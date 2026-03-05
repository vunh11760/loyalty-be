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
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PromotionService } from './promotion.service';

@ApiTags('promotion')
@ApiBearerAuth()
@Controller('promotions')
@UseGuards(SupabaseAuthGuard)
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post()
  @ApiOperation({ summary: 'Create promotion' })
  @ApiResponse({ status: 201, description: 'Promotion created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() dto: CreatePromotionDto) {
    return this.promotionService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all promotions' })
  @ApiResponse({ status: 200, description: 'List of promotions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.promotionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get promotion by id' })
  @ApiResponse({ status: 200, description: 'Promotion' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findOne(@Param('id') id: string) {
    const promotion = await this.promotionService.findOne(id);
    if (!promotion) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: 'Promotion not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return promotion;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update promotion' })
  @ApiResponse({ status: 200, description: 'Promotion updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  update(@Param('id') id: string, @Body() dto: UpdatePromotionDto) {
    return this.promotionService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete promotion' })
  @ApiResponse({ status: 200, description: 'Promotion deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: string) {
    await this.promotionService.remove(id);
    return { deleted: true };
  }
}
