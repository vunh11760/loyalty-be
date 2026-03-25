import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Health + DB check (no auth). Use when /profile/me is flaky.',
  })
  async getHealth() {
    const supabaseHost = this.healthService.getSupabaseHost();
    const profiles = await this.healthService.checkProfilesTable();

    return {
      status: 'ok',
      supabaseHost,
      profilesTable: profiles.ok ? 'reachable' : 'unreachable',
      ...(profiles.detail ? { profilesDetail: profiles.detail } : {}),
    };
  }
}
