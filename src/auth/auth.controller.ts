import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from './auth.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SUPABASE_CLIENT } from './supabase.constants';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(SUPABASE_CLIENT)
    private readonly supabaseClient: SupabaseClient,
  ) {}

  @Post('request-otp')
  @HttpCode(HttpStatus.OK)
  async requestOtp(@Body() body: RequestOtpDto) {
    return this.authService.requestOtp(body.email);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() body: VerifyOtpDto) {
    return this.authService.verifyOtp(body.email, body.token);
  }

  @Get('test')
  @HttpCode(HttpStatus.OK)
  async testSupabase() {
    const { data, error } = await this.supabaseClient
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, sample: data };
  }
}

