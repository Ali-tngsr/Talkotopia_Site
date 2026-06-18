import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsEnum,
  IsUrl,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ContentType } from '../content-type.enum';

export class CreateLessonDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @IsInt()
  order: number;

  @IsOptional()
  @IsEnum(ContentType)
  content_type?: ContentType;

  @IsUrl()
  quality_720_url: string;

  @IsOptional()
  @IsUrl()
  quality_1080_url?: string;

  @IsOptional()
  @IsUrl()
  quality_480_url?: string;

  @IsOptional()
  @IsBoolean()
  is_free_preview?: boolean;

  @IsOptional()
  @IsBoolean()
  allow_download?: boolean;
}

export class UpdateLessonDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsUrl()
  quality_720_url?: string;

  @IsOptional()
  @IsUrl()
  quality_1080_url?: string;

  @IsOptional()
  @IsUrl()
  quality_480_url?: string;

  @IsOptional()
  @IsBoolean()
  is_free_preview?: boolean;

  @IsOptional()
  @IsBoolean()
  allow_download?: boolean;
}

export class LessonResponseDto {
  id: string;
  section_id: string;
  title: string;
  order: number;
  content_type: ContentType;
  quality_720_url: string;
  quality_1080_url: string | null;
  quality_480_url: string | null;
  duration_seconds: number | null;
  is_free_preview: boolean;
  allow_download: boolean;
  created_at: Date;
}
