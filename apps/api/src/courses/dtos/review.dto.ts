import { IsInt, IsOptional, IsString, Min, Max, MinLength, MaxLength } from 'class-validator';

export class CreateEnrollmentDto {
  @IsInt()
  course_id: string;
}

export class EnrollmentResponseDto {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: Date;
  completed_at: Date | null;
}

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  comment?: string;
}

export class UpdateReviewDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  comment?: string;
}

export class ReviewResponseDto {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  comment: string | null;
  created_at: Date;
  updated_at: Date;
}
