import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  DEFAULT_PROFILE_ROLE,
  PROFILE_ROLES,
  type ProfileRole,
} from './profile-roles';

export { DEFAULT_PROFILE_ROLE, PROFILE_ROLES, type ProfileRole };

/** Shape returned by GET /profile/me (for Swagger) */
export class ProfileResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  user_id!: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  email!: string | null;

  @ApiPropertyOptional({
    description: 'Display name (from full_name)',
    example: 'Jane Doe',
  })
  name!: string | null;

  @ApiPropertyOptional()
  phone!: string | null;

  @ApiPropertyOptional({
    description: 'Street, city, etc.',
    example: '123 Example St',
  })
  address!: string | null;

  @ApiProperty()
  loyalty_points!: number;

  @ApiProperty()
  loyalty_tier!: string;

  @ApiProperty({
    enum: PROFILE_ROLES,
    example: DEFAULT_PROFILE_ROLE,
    default: DEFAULT_PROFILE_ROLE,
    description: 'Application role: user | staff | admin',
  })
  role!: ProfileRole;

  @ApiProperty()
  created_at!: string;

  @ApiProperty()
  updated_at!: string;
}
