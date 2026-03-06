import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { CreateLoyaltyLevelDto } from './dto/create-loyalty-level.dto';
import { UpdateLoyaltyLevelDto } from './dto/update-loyalty-level.dto';
import { LoyaltyLevelService } from './loyalty-level.service';

@ApiTags('loyalty-level')
@ApiBearerAuth()
@Controller('loyalty-levels')
@UseGuards(SupabaseAuthGuard)
export class LoyaltyLevelController {
  constructor(private readonly loyaltyLevelService: LoyaltyLevelService) {}

  @Post()
  @ApiOperation({ summary: 'Create loyalty level' })
  @ApiResponse({ status: 201, description: 'Level created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() dto: CreateLoyaltyLevelDto) {
    return this.loyaltyLevelService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all loyalty levels' })
  @ApiResponse({ status: 200, description: 'List of levels (by sort_order, min_points)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.loyaltyLevelService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get loyalty level by id' })
  @ApiResponse({ status: 200, description: 'Loyalty level' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findOne(@Param('id') id: string) {
    const level = await this.loyaltyLevelService.findOne(id);
    if (!level) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: 'Loyalty level not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return level;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update loyalty level' })
  @ApiResponse({ status: 200, description: 'Level updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@Param('id') id: string, @Body() dto: UpdateLoyaltyLevelDto) {
    return this.loyaltyLevelService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete loyalty level' })
  @ApiResponse({ status: 200, description: 'Level deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: string) {
    await this.loyaltyLevelService.remove(id);
    return { deleted: true };
  }
}
