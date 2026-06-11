import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { RedisService } from '../redis/redis.service';

describe('RateLimiting Integration Tests', () => {
  let app: INestApplication;
  let authService: AuthService;
  let redisService: RedisService;

  beforeAll(async () => {
    const mockAuthService = {
      register: jest.fn().mockResolvedValue({ message: 'ثبت‌نام اولیه انجام شد.' }),
      login: jest.fn().mockResolvedValue({ message: 'خوش آمدید!' }),
    };

    const mockRedisService = {
      getClient: jest.fn().mockReturnValue({
        incr: jest.fn().mockResolvedValue(1),
        expire: jest.fn().mockResolvedValue(true),
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: RedisService, useValue: mockRedisService },
        RateLimitGuard,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    redisService = moduleFixture.get<RedisService>(RedisService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Rate Limit Guard', () => {
    it('should allow requests up to limit', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Test', email: 'test@test.com', password: 'pass123' });

      expect(response.status).not.toBe(HttpStatus.TOO_MANY_REQUESTS);
    });
  });
});
