import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'ایمیل وارد شده نامعتبر است' })
  email: string;
}
