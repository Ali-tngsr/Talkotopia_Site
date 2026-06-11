import { Injectable, ConflictException, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Role } from '../users/role.enum';
import { RedisService } from '../redis/redis.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  // ===========================================
  // ثبت‌نام
  // ===========================================
  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('کاربری با این ایمیل از قبل ثبت‌نام کرده است.');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      isActive: false,
      role: Role.STUDENT,
    });
    await this.userRepository.save(user);

    const otp = Math.floor(10000 + Math.random() * 90000).toString();

    const redis = this.redisService.getClient();
    await redis.set(`otp:${user.email}`, otp, 'EX', 120);

    console.log(`[DEV LOG] - OTP Code for ${user.email} is: ${otp}`);

    return {
      message: 'ثبت‌نام اولیه انجام شد. کد تایید برای شما ارسال گردید.',
      dev_otp: otp,
    };
  }

  // ===========================================
  // تأیید OTP و فعال‌سازی کاربر
  // ===========================================
  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp } = verifyOtpDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('کاربری با این ایمیل یافت نشد.');
    }

    const redis = this.redisService.getClient();
    const storedOtp = await redis.get(`otp:${email}`);

    if (!storedOtp) {
      throw new BadRequestException('کد تایید منقضی شده است. لطفاً دوباره ثبت‌نام کنید.');
    }

    if (storedOtp !== otp) {
      throw new BadRequestException('کد تایید نادرست است.');
    }

    user.isActive = true;
    await this.userRepository.save(user);

    await redis.del(`otp:${email}`);

    const tokens = await this.generateTokens(user);

    return {
      message: 'ایمیل شما تایید شد. خوش آمدید!',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  // ===========================================
  // ورود
  // ===========================================
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('ایمیل یا رمز عبور نادرست است.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('حساب کاربری شما فعال نشده است. لطفاً ایمیل خود را تایید کنید.');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('ایمیل یا رمز عبور نادرست است.');
    }

    const tokens = await this.generateTokens(user);

    return {
      message: 'خوش آمدید!',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  // ===========================================
  // دریافت Access Token جدید
  // ===========================================
  async refresh(refreshDto: RefreshDto) {
    const { refresh_token } = refreshDto;

    try {
      const payload = this.jwtService.verify(refresh_token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      }) as JwtPayload;

      const redis = this.redisService.getClient();
      const storedToken = await redis.get(`refresh:${payload.userId}`);

      if (!storedToken || storedToken !== refresh_token) {
        throw new UnauthorizedException('توکن رفرش نامعتبر است.');
      }

      const user = await this.userRepository.findOne({ where: { id: payload.userId } });
      if (!user || !user.isActive) {
        throw new UnauthorizedException('کاربر یافت نشد یا غیرفعال است.');
      }

      const tokens = await this.generateTokens(user);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      };
    } catch (error) {
      throw new UnauthorizedException('توکن رفرش نامعتبر یا منقضی است.');
    }
  }

  // ===========================================
  // فراموشی رمز عبور
  // ===========================================
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return {
        message: 'اگر این ایمیل در سیستم ثبت‌نام شده باشد، لینک تغییر رمز برای آن ارسال خواهد شد.',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = expiresAt;
    await this.userRepository.save(user);

    const redis = this.redisService.getClient();
    await redis.set(`reset:${resetToken}`, user.id, 'EX', 1800);

    console.log(`[DEV LOG] - Password Reset Token for ${user.email} is: ${resetToken}`);

    return {
      message: 'اگر این ایمیل در سیستم ثبت‌نام شده باشد، لینک تغییر رمز برای آن ارسال خواهد شد.',
      dev_reset_token: resetToken,
    };
  }

  // ===========================================
  // تغییر رمز عبور
  // ===========================================
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, new_password } = resetPasswordDto;

    const redis = this.redisService.getClient();
    const userId = await redis.get(`reset:${token}`);

    if (!userId) {
      throw new BadRequestException('لینک تغییر رمز منقضی یا نامعتبر است.');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.passwordResetToken) {
      throw new BadRequestException('لینک تغییر رمز منقضی یا نامعتبر است.');
    }

    const now = new Date();
    if (user.passwordResetExpires && user.passwordResetExpires < now) {
      throw new BadRequestException('لینک تغییر رمز منقضی شده است.');
    }

    const tokenMatch = await bcrypt.compare(token, user.passwordResetToken);
    if (!tokenMatch) {
      throw new BadRequestException('لینک تغییر رمز نامعتبر است.');
    }

    const hashedPassword = await bcrypt.hash(new_password, 12);

    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.userRepository.save(user);

    await redis.del(`reset:${token}`);

    return {
      message: 'رمز عبور شما با موفقیت تغییر یافت. اکنون می‌تواند وارد شوید.',
    };
  }

  // ===========================================
  // تولید توکن‌ها (Access + Refresh)
  // ===========================================
  async generateTokens(user: User) {
    const jwtPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(jwtPayload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(jwtPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    const redis = this.redisService.getClient();
    await redis.set(`refresh:${user.id}`, refreshToken, 'EX', 604800);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  // ===========================================
  // خروج
  // ===========================================
  async logout(userId: string) {
    const redis = this.redisService.getClient();
    await redis.del(`refresh:${userId}`);
  }
}
