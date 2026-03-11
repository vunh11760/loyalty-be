import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class AddPointsDto {
  @ApiProperty({
    example: 'c3f8c5a4-1234-4c9a-9b0c-abcdef012345',
    description: 'Supabase user id to add points for',
  })
  @IsString()
  userId!: string;

  @ApiProperty({ example: 100, minimum: 1 })
  @IsInt()
  @Min(1)
  amount!: number;
}
