import {
  IsString,
  IsDecimal,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { CourseStatus } from '../course-status.enum';

export class CreateCourseDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsDecimal({ decimal_digits: '1,2' })
  price: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '1,2' })
  discount_price?: number;

  @IsOptional()
  @IsString()
  thumbnail?: string;
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @IsOptional()
  @IsDecimal({ decimal_digits: '1,2' })
  price?: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '1,2' })
  discount_price?: number;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;
}

export class CourseResponseDto {
  id: string;
  title: string;
  slug: string;
  description: string;
  teacher_id: string;
  price: number;
  discount_price: number | null;
  thumbnail: string | null;
  status: CourseStatus;
  created_at: Date;
  updated_at: Date;
}

export class PaginatedCoursesDto {
  data: CourseResponseDto[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
