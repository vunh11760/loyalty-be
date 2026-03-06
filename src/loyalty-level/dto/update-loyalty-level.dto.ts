import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateLoyaltyLevelDto {
  @ApiPropertyOptional({ example: 'Platinum' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 1000, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  min_points?: number;

  @ApiPropertyOptional({ example: '1000+ points' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;
}
