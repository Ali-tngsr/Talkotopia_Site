import { Controller, Post, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // قفل کردن این مسیر با استفاده از محافظی که ساختیم
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK) // بازگرداندن کد 200 به جای 201
  async logout(@Req() req: Request) {
    // اطلاعات کاربر (req.user) توسط استراتژی JWT خوانده شده است
    const user = req.user as { userId: string; role: string };
    
    // فراخوانی سرویس برای حذف توکن از ردیس
    await this.authService.logout(user.userId);
    
    return { message: 'با موفقیت از حساب کاربری خارج شدید.' };
  }
}