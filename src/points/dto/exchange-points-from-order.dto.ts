import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class ExchangePointsFromOrderDto {
  @ApiProperty({
    example: 49.99,
    description:
      'Order total in currency units (e.g. USD). Points = floor(orderAmount / unitsPerPoint); default 10 = 1 point.',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  orderAmount!: number;
}
