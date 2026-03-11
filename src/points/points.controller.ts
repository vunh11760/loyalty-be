import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { AddPointsDto } from './dto/add-points.dto';
import { ExchangePointsDto } from './dto/exchange-points.dto';
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

  @Get('history')
  @ApiOperation({ summary: 'Get point history (add/exchange)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of point history entries' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getHistory(
    @CurrentUser() user: User,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? Math.min(100, Math.max(1, parseInt(limit, 10) || 50)) : 50;
    return this.pointsService.getHistory(user.id, limitNum);
  }
}
