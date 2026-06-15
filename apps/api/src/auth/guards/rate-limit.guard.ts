import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { RedisService } from '../../redis/redis.service';

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly redisService: RedisService,
    private readonly config: RateLimitConfig = {
      maxRequests: 5,
      windowSeconds: 60,
    },
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = this.getClientIp(request);
    const endpoint = request.path;

    const key = `ratelimit:${ip}:${endpoint}`;
    const redis = this.redisService.getClient();

    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, this.config.windowSeconds);
    }

    if (current > this.config.maxRequests) {
      throw new HttpException(
        `بیش از حد درخواست‌های متوالی. لطفاً ${this.config.windowSeconds} ثانیه بعد دوباره سعی کنید.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private getClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return request.ip || 'unknown';
  }
}
