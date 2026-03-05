import { IsInt, IsOptional, IsPhoneNumber, IsString, Min } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  loyaltyPoints?: number;

  @IsOptional()
  @IsString()
  loyaltyTier?: string;
}

