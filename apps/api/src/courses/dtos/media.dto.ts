import { IsEnum } from 'class-validator';

export enum VideoQuality {
  Q480 = '480p',
  Q720 = '720p',
  Q1080 = '1080p',
}

export class VideoQualitySourceDto {
  @IsEnum(VideoQuality)
  quality: VideoQuality;

  url: string;

  is_default: boolean;

  can_download: boolean;

  filename: string;
}

export class LessonMediaResponseDto {
  lesson_id: string;

  title: string;

  default_quality: VideoQuality;

  sources: VideoQualitySourceDto[];

  allow_download: boolean;
}
