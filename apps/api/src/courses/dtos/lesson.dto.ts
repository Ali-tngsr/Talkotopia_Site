import { IsString, IsOptional, IsInt, IsBoolean, IsEnum, MinLength, MaxLength } from 'class-validator';
import { ContentType } from '../content-type.enum';
import { ProcessingStatus } from '../processing-status.enum';

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
  storage_key: string | null;
  duration_seconds: number | null;
  is_free_preview: boolean;
  allow_download: boolean;
  processing_status: ProcessingStatus;
  created_at: Date;
}
