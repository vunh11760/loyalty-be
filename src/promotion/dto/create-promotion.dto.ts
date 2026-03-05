import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreatePromotionDto {
  @ApiProperty({ example: 'Summer Sale' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ example: '20% off all items' })
  @IsOptional()
  @IsString()
  description?: string;
}
