import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // ۱. تنظیمات خواندن فایل متغیرهای محیطی
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env', // آدرس فایل .env در روت اصلی پروژه
    }),
    // ۲. تنظیمات اتصال به PostgreSQL با TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: 'localhost', 
        port: 5432,
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        // نکته مهم: این گزینه در محیط پروداکشن باید حتماً false باشد
        synchronize: false, 
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}