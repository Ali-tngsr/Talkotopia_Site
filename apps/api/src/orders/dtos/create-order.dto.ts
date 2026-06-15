import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ type: [String], description: 'Course IDs to purchase' })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  course_ids: string[];
}
