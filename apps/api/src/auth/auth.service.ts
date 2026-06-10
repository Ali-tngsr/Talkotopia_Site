import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Role } from '../users/role.enum';
import { RedisService } from '../redis/redis.service'; // اضافه شد

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService, // اضافه شد
  ) {}

async generateTokens(userId: string, role: Role) {
    const payload: JwtPayload = { userId, role };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    // ذخیره Refresh Token در Redis با مدت زمان ۷ روز (معادل 604800 ثانیه)
    const redis = this.redisService.getClient();
    await redis.set(`refresh_token:${userId}`, refreshToken, 'EX', 604800);

    return {
      accessToken,
      refreshToken,
    };
  } // <--- این آکولاد برای بستن متد generateTokens الزامی است

  async logout(userId: string): Promise<void> {
    const redis = this.redisService.getClient();
    await redis.del(`refresh_token:${userId}`);
  }
} // <--- این آکولاد برای بستن کل کلاس AuthService است