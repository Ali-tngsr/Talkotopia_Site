import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ۱. تنظیم پیشوند استاندارد برای تمام Endpointها (طبق نقشه راه)
  app.setGlobalPrefix('api/v1');

  // ۲. فعال‌سازی اعتبارسنجی خودکار ورودی‌ها برای امنیت بیشتر
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // حذف فیلدهای اضافی و غیرمجاز از درخواست‌ها
      transform: true, // تبدیل خودکار تایپ‌ها (مثلا string به number)
    }),
  );

  // ۳. تنظیمات Swagger برای مستندسازی و تست APIها
  const config = new DocumentBuilder()
    .setTitle('Talkotopia LMS API')
    .setDescription('مستندات و محیط تست APIهای پلتفرم آموزشی')
    .setVersion('1.0')
    .addBearerAuth() // اضافه کردن قابلیت تست توکن احراز هویت در آینده
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  
  // مسیر دسترسی به صفحه مستندات: /api/docs
  SwaggerModule.setup('api/docs', app, document);

  // ۴. تنظیم پورت و اجرای برنامه
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
  console.log(`📄 Swagger documentation is available at: http://localhost:${port}/api/docs`);
}
bootstrap();