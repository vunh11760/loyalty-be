import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AddPointsDto {
  @ApiProperty({ example: 100, minimum: 1 })
  @IsInt()
  @Min(1)
  amount!: number;
}
