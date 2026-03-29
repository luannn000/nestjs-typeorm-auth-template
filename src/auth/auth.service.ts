import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/roles/entities/role.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Roles } from 'src/commom/enums/roles.enum';
import { EncryptionService } from 'src/encryption/encryption.service';
import { MailService } from './mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    private readonly encryptionService: EncryptionService,
    private readonly mailService: MailService,
  ) {}

  async login(dto: LoginDto) {}

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

    const hashedPassword = await this.encryptionService.hashPassword(
      dto.password,
    );

    const token = this.encryptionService.generateVerificationToken();
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
}
