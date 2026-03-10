import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class ExchangePointsDto {
  @ApiProperty({ example: 50, minimum: 1 })
  @IsInt()
  @Min(1)
  amount!: number;
}
