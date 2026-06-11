import { IsEmail, IsString } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail({}, { message: 'ایمیل وارد شده نامعتبر است' })
  email: string;

  @IsString()
  otp: string;
}
