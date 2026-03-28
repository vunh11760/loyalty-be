import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ResetPointsDto {
  @ApiProperty({
    example: 'c3f8c5a4-1234-4c9a-9b0c-abcdef012345',
    description: 'Supabase user id to reset points',
  })
  @IsString()
  userId!: string;
}
