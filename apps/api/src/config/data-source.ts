import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// خواندن فایل .env از پوشه اصلی پروژه
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  synchronize: false,
});
