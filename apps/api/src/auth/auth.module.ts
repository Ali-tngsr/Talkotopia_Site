import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { RedisModule } from '../redis/redis.module';
import { RedisService } from '../redis/redis.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RateLimitGuard } from './guards/rate-limit.guard';

@Module({
  imports: [
    UsersModule,
    RedisModule, // <--- این خط اضافه شد
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: '15m', // مدت زمان اکسس توکن طبق نقشه راه
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: RateLimitGuard,
      useFactory: (redisService: RedisService) =>
        new RateLimitGuard(redisService, { maxRequests: 5, windowSeconds: 60 }),
      inject: [RedisService],
    },
  ],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
