import { IsString, IsInt, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateCourseSectionDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @IsInt()
  order: number;
}

export class UpdateCourseSectionDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}

export class CourseSectionResponseDto {
  id: string;
  course_id: string;
  title: string;
  order: number;
}
