import { Body, Controller, Get, Param, Put, Req, Res, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { User } from '@supabase/supabase-js';
import type { Request, Response } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { DEFAULT_PROFILE_ROLE, ProfileResponseDto } from './dto/profile-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

@ApiTags('profile')
@ApiBearerAuth()
@Controller('profile')
@UseGuards(SupabaseAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get my profile',
    description:
      'Supports conditional GET: send If-Modified-Since (RFC 7231 HTTP-date). If unchanged, returns 304 with empty body and saves bandwidth.',
  })
  @ApiHeader({
    name: 'If-Modified-Since',
    required: false,
    description:
      'Only return body if profile changed after this time (e.g. from prior Last-Modified)',
  })
  @ApiOkResponse({
    type: ProfileResponseDto,
    description:
      'Profile (includes email from DB or JWT if unset); response includes Last-Modified header',
  })
  @ApiResponse({
    status: 304,
    description: 'Not Modified — profile unchanged since If-Modified-Since',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: User,
  ) {
    const profile = await this.profileService.getOrCreateProfileByUserId(user.id);
    const lastModified = new Date(profile.updated_at);
    const lastModifiedHttp = lastModified.toUTCString();

    res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');
    res.setHeader('Last-Modified', lastModifiedHttp);

    const ims = req.headers['if-modified-since'];
    if (ims) {
      const clientTime = new Date(ims);
      if (!Number.isNaN(clientTime.getTime()) && lastModified <= clientTime) {
        res.status(304).end();
        return;
      }
    }

    const { full_name, ...profileRest } = profile;
    return {
      ...profileRest,
      name: full_name,
      email: profile.email ?? user.email ?? null,
      address: profile.address ?? null,
      role: profile.role ?? DEFAULT_PROFILE_ROLE,
    };
  }

  @Put('me')
  @ApiOperation({
    summary: 'Update my profile',
    description:
      'Optional fields: email, name (or fullName), phone, address, loyaltyPoints, loyaltyTier',
  })
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiResponse({ status: 200, description: 'Updated profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(@CurrentUser() user: User, @Body() body: UpdateProfileDto) {
    const profile = await this.profileService.updateProfileForUser(user.id, body);
    const { full_name, ...profileRest } = profile;
    return {
      ...profileRest,
      name: full_name,
      email: profile.email ?? user.email ?? null,
      address: profile.address ?? null,
      role: profile.role ?? DEFAULT_PROFILE_ROLE,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get profile by user ID' })
  @ApiParam({ name: 'id', description: 'User UUID', type: String })
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getProfileById(@Param('id') id: string) {
    const profile = await this.profileService.getProfileById(id);
    const { full_name, ...profileRest } = profile;
    return {
      ...profileRest,
      name: full_name,
      email: profile.email ?? null,
      address: profile.address ?? null,
      role: profile.role ?? DEFAULT_PROFILE_ROLE,
    };
  }
  @Put(':id')
  @ApiOperation({ summary: 'Update profile by user ID' })
  @ApiParam({ name: 'id', description: 'User UUID', type: String })
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiResponse({ status: 200, description: 'Updated profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async updateProfileById(@Param('id') id: string, @Body() body: UpdateProfileDto) {
    const profile = await this.profileService.updateProfileById(id, body);
    const { full_name, ...profileRest } = profile;
    return {
      ...profileRest,
      name: full_name,
      email: profile.email ?? null,
      address: profile.address ?? null,
      role: profile.role ?? DEFAULT_PROFILE_ROLE,
    };
  }
}
