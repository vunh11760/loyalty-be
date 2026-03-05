import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPhoneNumber, IsString, Min } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: '+12025550123' })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  loyaltyPoints?: number;

  @ApiPropertyOptional({ example: 'gold' })
  @IsOptional()
  @IsString()
  loyaltyTier?: string;
}

