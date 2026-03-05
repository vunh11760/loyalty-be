import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePromotionDto {
  @ApiPropertyOptional({ example: 'Winter Sale' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: '30% off' })
  @IsOptional()
  @IsString()
  description?: string;
}
