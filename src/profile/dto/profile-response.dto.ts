import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Shape returned by GET /profile/me (for Swagger) */
export class ProfileResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  user_id!: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  email!: string | null;

  @ApiPropertyOptional()
  full_name!: string | null;

  @ApiPropertyOptional()
  phone!: string | null;

  @ApiProperty()
  loyalty_points!: number;

  @ApiProperty()
  loyalty_tier!: string;

  @ApiProperty()
  created_at!: string;

  @ApiProperty()
  updated_at!: string;
}
