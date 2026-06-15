import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    // اتصال به داکر ردیس با استفاده از متغیرهای فایل .env
    this.redisClient = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
    });
  }

  onModuleDestroy() {
    // قطع اتصال هنگام خاموش شدن سرور
    void this.redisClient.quit();
  }

  getClient(): Redis {
    return this.redisClient;
  }

  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.redisClient.setex(key, ttlSeconds, value);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async delete(key: string): Promise<number> {
    return await this.redisClient.del(key);
  }

  async deletePattern(pattern: string): Promise<void> {
    const keys = await this.redisClient.keys(pattern);
    if (keys.length > 0) {
      await this.redisClient.del(...keys);
    }
  }

  async increment(key: string, increment: number = 1): Promise<number> {
    return await this.redisClient.incrby(key, increment);
  }

  async decrement(key: string, decrement: number = 1): Promise<number> {
    return await this.redisClient.decrby(key, decrement);
  }

  async exists(key: string): Promise<number> {
    return await this.redisClient.exists(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return await this.redisClient.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return await this.redisClient.ttl(key);
  }
}
