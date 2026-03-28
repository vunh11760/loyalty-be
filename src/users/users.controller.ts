import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(SupabaseAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Get list of users',
    description:
      'Returns all rows from public.profiles. The API server should use SUPABASE_SERVICE_ROLE_KEY so PostgREST is not limited by RLS to the caller’s own row.',
  })
  @ApiResponse({ status: 200, description: 'List of users (profiles)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.usersService.findAll();
  }
}
