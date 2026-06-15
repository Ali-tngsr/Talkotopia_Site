import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyPaymentDto {
  @ApiPropertyOptional({ enum: ['OK', 'NOK'], default: 'OK' })
  @IsOptional()
  @IsIn(['OK', 'NOK'])
  status?: 'OK' | 'NOK';

  @ApiPropertyOptional({ description: 'Gateway authority token' })
  @IsOptional()
  @IsString()
  authority?: string;
}
