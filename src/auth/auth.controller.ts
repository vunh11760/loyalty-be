import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SUPABASE_CLIENT } from './supabase.constants';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(SUPABASE_CLIENT)
    private readonly supabaseClient: SupabaseClient,
  ) {}

  @Post('request-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request OTP' })
  @ApiResponse({ status: 200, description: 'OTP sent to email' })
  async requestOtp(@Body() body: RequestOtpDto) {
    return this.authService.requestOtp(body.email);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiResponse({ status: 200, description: 'Returns accessToken, refreshToken, user' })
  async verifyOtp(@Body() body: VerifyOtpDto) {
    return this.authService.verifyOtp(body.email, body.token);
  }

  @Post('refresh-session')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh Session' })
  @ApiResponse({ status: 200, description: 'Returns new accessToken, refreshToken, user' })
  async refreshSession(@Body() body: RefreshTokenDto) {
    return this.authService.refreshSession(body.refreshToken);
  }

  @Get('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test Supabase connection' })
  @ApiResponse({ status: 200, description: 'Sample DB response' })
  async testSupabase() {
    const { data, error } = await this.supabaseClient.from('users').select('*').limit(1);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, sample: data };
  }
}
