import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/roles/entities/role.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Roles } from 'src/commom/enums/roles.enum';
import { MailService } from './mail/mail.service';
import { Request, Response } from 'express';
import { Auth } from './auth';
import { PasswordService } from './password/password.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    private readonly mailService: MailService,
    private readonly passwordService: PasswordService,
    private readonly auth: Auth,
  ) {}

  async login(res: Response, dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
      relations: ['roles'],
    });
    if (!user) throw new BadRequestException('Invalid credentials');

    const passwordMatch = await this.passwordService.verifyPassword(
      user.password,
      dto.password,
    );
    if (!passwordMatch) throw new BadRequestException('Invalid credentials');

    if (!user.isEmailVerified)
      throw new BadRequestException('Email not verified');

    const accessToken = await this.auth.createAccessToken(user);
    const refreshToken = await this.auth.createRefreshToken(user, res);

    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    return { accessToken };
  }

  async register(dto: RegisterDto) {
    const foundUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (foundUser) throw new BadRequestException('Email already in use');

    const userRole = await this.roleRepository.findOne({
      where: { name: Roles.FREE },
    });
    if (!userRole)
      throw new InternalServerErrorException('Default role not found');

    const hashedPassword = await this.passwordService.hashPassword(
      dto.password,
    );

    const token = this.passwordService.generateVerificationToken();
    const tokenExpiryDate = new Date(60 * 60 * 1000 + Date.now());

    const newUser = this.userRepository.create();
    newUser.username = dto.username;
    newUser.email = dto.email;
    newUser.password = hashedPassword;
    newUser.verificationToken = token.hashedToken;
    newUser.emailVerificationExpiry = tokenExpiryDate;
    newUser.roles = [userRole];
    await this.userRepository.save(newUser);

    this.mailService.sendVerificationEmail(newUser.email, token.rawToken);

    return { message: 'Registration successful, please verify your email' };
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) throw new BadRequestException('Refresh token missing');

    const user = await this.userRepository.findOne({
      where: { refreshToken },
      relations: ['roles'],
    });
    if (!user) throw new BadRequestException('Invalid refresh token');

    if (!(await this.auth.verifyToken(refreshToken))) {
      user.refreshToken = null;
      await this.userRepository.save(user);
      throw new BadRequestException('Invalid refresh token');
    }

    const accessToken = await this.auth.createAccessToken(user);
    const newRefreshToken = await this.auth.createRefreshToken(user, res);

    user.refreshToken = newRefreshToken;
    await this.userRepository.save(user);

    return { accessToken };
  }

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) throw new BadRequestException('Refresh token missing');

    const user = await this.userRepository.findOne({
      where: { refreshToken },
    });
    if (!user) throw new BadRequestException('Invalid refresh token');

    user.refreshToken = null;
    await this.userRepository.save(user);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return { message: 'Logged out successfully' };
  }
}
