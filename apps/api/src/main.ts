import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ۱. CORS — allow frontend origin
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
  });

  // ۲. تنظیم پیشوند استاندارد برای تمام Endpointها (طبق نقشه راه)
  app.setGlobalPrefix('api/v1');

  // ۳. فعال‌سازی اعتبارسنجی خودکار ورودی‌ها برای امنیت بیشتر
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // ۴. تنظیمات Swagger برای مستندسازی و تست APIها
  const config = new DocumentBuilder()
    .setTitle('Talkotopia LMS API')
    .setDescription('مستندات و محیط تست APIهای پلتفرم آموزشی')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ۵. تنظیم پورت و اجرای برنامه
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
  console.log(
    `📄 Swagger documentation is available at: http://localhost:${port}/api/docs`,
  );
}
void bootstrap();
