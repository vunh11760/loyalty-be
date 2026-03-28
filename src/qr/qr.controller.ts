import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidateUserIdDto } from './dto/validate-user-id.dto';
import { QrService } from './qr.service';

@ApiTags('qr')
@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate user id',
    description:
      'Checks that userId is a UUID and whether a profile exists for that Supabase user. No auth required (e.g. kiosk / QR scan).',
  })
  @ApiResponse({ status: 200, description: 'Validation result' })
  @ApiResponse({ status: 400, description: 'Invalid UUID or body' })
  @ApiResponse({ status: 502, description: 'Database error' })
  validateUserId(@Body() dto: ValidateUserIdDto) {
    return this.qrService.validateUserId(dto.qrCode);
  }
}
