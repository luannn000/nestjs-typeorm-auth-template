import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import pactum from 'pactum';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

describe('Auth API E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    await app.init();
    await app.listen(0);
    const address = app.getHttpServer().address();
    const port = typeof address === 'object' && address ? address.port : 3000;
    pactum.request.setBaseUrl(`http://localhost:${port}`);
  });

  afterAll(async () => {
    await app.close();
  });

  const testUser = {
    username: 'testuser',
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123!',
  };

  describe('Auth - Register', () => {
    it('should register a new user successfully', async () => {
      await pactum
        .spec()
        .post('/api/auth/register')
        .withJson({
          username: testUser.username,
          email: testUser.email,
          password: testUser.password,
        })
        .expectStatus(201)
        .expectJson({
          message: 'Registration successful, please verify your email',
        });
    });

    it('should fail to register with existing email', async () => {
      await pactum
        .spec()
        .post('/api/auth/register')
        .withJson({
          username: 'anotheruser',
          email: testUser.email,
          password: 'AnotherPassword123!',
        })
        .expectStatus(400)
        .expectJsonLike({
          message: 'Email already in use',
        });
    });

    it('should fail to register with invalid email', async () => {
      await pactum
        .spec()
        .post('/api/auth/register')
        .withJson({
          username: 'testuser',
          email: 'invalid-email',
          password: 'TestPassword123!',
        })
        .expectStatus(400);
    });

    it('should fail to register with missing fields', async () => {
      await pactum
        .spec()
        .post('/api/auth/register')
        .withJson({
          email: 'test@example.com',
        })
        .expectStatus(400);
    });
  });

  describe('Auth - Login', () => {
    it('should fail to login with non-existent user', async () => {
      await pactum
        .spec()
        .post('/api/auth/login')
        .withJson({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        })
        .expectStatus(400)
        .expectJsonLike({
          message: 'Invalid credentials',
        });
    });

    it('should fail to login with wrong password', async () => {
      await pactum
        .spec()
        .post('/api/auth/login')
        .withJson({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expectStatus(400)
        .expectJsonLike({
          message: 'Invalid credentials',
        });
    });

    it('should fail to login with unverified email', async () => {
      await pactum
        .spec()
        .post('/api/auth/login')
        .withJson({
          email: testUser.email,
          password: testUser.password,
        })
        .expectStatus(400)
        .expectJsonLike({
          message: 'Email not verified',
        });
    });
  });

  describe('Auth - Refresh Token', () => {
    it('should fail refresh without token', async () => {
      await pactum
        .spec()
        .post('/api/auth/refresh')
        .expectStatus(400)
        .expectJsonLike({
          message: 'Refresh token missing',
        });
    });

    it('should fail refresh with invalid token', async () => {
      await pactum
        .spec()
        .post('/api/auth/refresh')
        .withCookies('refreshToken', 'invalid-token')
        .expectStatus(400)
        .expectJsonLike({
          message: 'Invalid refresh token',
        });
    });
  });

  describe('Auth - Logout', () => {
    it('should fail logout without token', async () => {
      await pactum
        .spec()
        .post('/api/auth/logout')
        .expectStatus(400)
        .expectJsonLike({
          message: 'Refresh token missing',
        });
    });

    it('should fail logout with invalid token', async () => {
      await pactum
        .spec()
        .post('/api/auth/logout')
        .withCookies('refreshToken', 'invalid-token')
        .expectStatus(400)
        .expectJsonLike({
          message: 'Invalid refresh token',
        });
    });
  });

  describe('Password - Forgot Password', () => {
    it('should fail forgot password with non-existent email', async () => {
      await pactum
        .spec()
        .post('/api/password/forgot-password')
        .withJson({
          email: 'nonexistent@example.com',
        })
        .expectStatus(400)
        .expectJsonLike({
          message: 'Email not found',
        });
    });
  });

  describe('Password - Reset Password', () => {
    it('should fail reset with invalid token', async () => {
      await pactum
        .spec()
        .post('/api/password/reset-password')
        .withJson({
          token: 'invalid-token',
          newPassword: 'NewPassword123!',
        })
        .expectStatus(400)
        .expectJsonLike({
          message: 'Invalid or expired token',
        });
    });
  });

  describe('Mail - Resend Verification', () => {
    it('should fail resend verification with non-existent email', async () => {
      await pactum
        .spec()
        .post('/api/mail/resend-verification-email')
        .withJson({
          email: 'nonexistent@example.com',
        })
        .expectStatus(400)
        .expectJsonLike({
          message: 'User not found',
        });
    });
  });

  describe('Mail - Verify Email', () => {
    it('should fail verify with invalid token', async () => {
      await pactum
        .spec()
        .get('/api/mail/verify-email/invalid-token')
        .expectStatus(400)
        .expectJsonLike({
          message: 'Invalid verification token',
        });
    });
  });

  describe('Integration - Full User Journey', () => {
    it('should complete full user registration and login flow', async () => {
      const user = {
        username: `integrationuser${Date.now()}`,
        email: `integration${Date.now()}@example.com`,
        password: 'IntegrationPass123!',
      };

      await pactum
        .spec()
        .post('/api/auth/register')
        .withJson(user)
        .expectStatus(201);

      await pactum
        .spec()
        .post('/api/auth/login')
        .withJson({
          email: user.email,
          password: user.password,
        })
        .expectStatus(400)
        .expectJsonLike({
          message: 'Email not verified',
        });

      await pactum
        .spec()
        .post('/api/auth/login')
        .withJson({
          email: user.email,
          password: user.password,
        })
        .expectStatus(400)
        .expectJsonLike({
          message: 'Email not verified',
        });

      await pactum
        .spec()
        .post('/api/auth/logout')
        .withCookies('refreshToken', 'fake-token')
        .expectStatus(400);
    });
  });
});
