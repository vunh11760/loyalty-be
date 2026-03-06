import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateLoyaltyLevelDto {
  @ApiProperty({ example: 'Gold' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 500, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  min_points?: number;

  @ApiPropertyOptional({ example: '500+ points' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;
}
