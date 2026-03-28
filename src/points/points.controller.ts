import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { User } from '@supabase/supabase-js';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { AddPointsDto } from './dto/add-points.dto';
import { ExchangePointsFromOrderDto } from './dto/exchange-points-from-order.dto';
import { ExchangePointsDto } from './dto/exchange-points.dto';
import { ResetPointsDto } from './dto/reset-points.dto';
import { PointsService } from './points.service';

@ApiTags('points')
@ApiBearerAuth()
@Controller('points')
@UseGuards(SupabaseAuthGuard)
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Post('add')
  @ApiOperation({ summary: 'Add points for a user' })
  @ApiResponse({ status: 200, description: 'Points added; returns new loyalty_points' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  addPoints(@CurrentUser() _user: User, @Body() dto: AddPointsDto) {
    // _user is the authenticated caller (e.g. admin); dto.userId is the target user
    return this.pointsService.addPoints(dto.userId, dto.amount);
  }

  @Post('exchange')
  @ApiOperation({ summary: 'Exchange / redeem points (deduct)' })
  @ApiResponse({ status: 200, description: 'Points deducted; returns new loyalty_points' })
  @ApiResponse({ status: 400, description: 'Insufficient points' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  exchangePoints(@CurrentUser() user: User, @Body() dto: ExchangePointsDto) {
    return this.pointsService.exchangePoints(user.id, dto.amount);
  }

  @Post('exchange-from-order')
  @ApiOperation({
    summary: 'Exchange points from order amount',
    description:
      'Redeems points from the signed-in user’s balance based on order total. ' +
      'Points deducted = floor(orderAmount / LOYALTY_CURRENCY_UNITS_PER_POINT); default 10 currency units = 1 point (e.g. $10 → 1 point, $25 → 2).',
  })
  @ApiResponse({
    status: 200,
    description: 'Points deducted; returns new balance and breakdown',
  })
  @ApiResponse({ status: 400, description: 'Insufficient points or order too small' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  exchangePointsFromOrder(@CurrentUser() user: User, @Body() dto: ExchangePointsFromOrderDto) {
    return this.pointsService.exchangePointsFromOrderAmount(user.id, dto.orderAmount);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get point history (add/exchange)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of point history entries' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getHistory(@CurrentUser() user: User, @Query('limit') limit?: string) {
    const limitNum = limit ? Math.min(100, Math.max(1, parseInt(limit, 10) || 50)) : 50;
    return this.pointsService.getHistory(user.id, limitNum);
  }

  @Post('reset')
  @ApiOperation({
    summary: 'Reset points to 0',
    description:
      'Resets the loyalty points of the target user to 0. Caller must be authenticated (e.g. admin).',
  })
  @ApiResponse({ status: 200, description: 'Points reset to 0; returns loyalty_points: 0' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  resetPoints(@Body() dto: ResetPointsDto) {
    return this.pointsService.resetPoints(dto.userId);
  }
}
