import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ValidateUserIdDto {
  @ApiProperty({
    format: 'uuid',
    example: 'c3f8c5a4-1234-4c9a-9b0c-abcdef012345',
    description: 'Supabase auth user id (UUID)',
  })
  @IsNotEmpty()
  @IsUUID()
  qrCode!: string;
}
