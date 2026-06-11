import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      // توکن را از هدر Authorization و با پیشوند Bearer می‌خواند
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // توکن‌های منقضی‌شده بلافاصله رد می‌شوند
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') as string,
    });
  }

  async validate(payload: JwtPayload) {
    // اگر توکن معتبر باشد، این اطلاعات به شیء request (req.user) اضافه می‌شود
    return { userId: payload.userId, role: payload.role };
  }
}