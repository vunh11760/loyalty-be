import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { SUPABASE_CLIENT } from './supabase.constants';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    SupabaseAuthGuard,
    {
      provide: SUPABASE_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): SupabaseClient => {
        const url = config.get<string>('SUPABASE_URL');
        const anonKey = config.get<string>('SUPABASE_ANON_KEY');
        const serviceRoleKey = config.get<string>('SUPABASE_SERVICE_ROLE_KEY');

        if (!url || !anonKey) {
          throw new Error(
            'SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables',
          );
        }

        // Prefer service role for backend so DB (e.g. profiles) and auth work without RLS blocking
        const key = serviceRoleKey || anonKey;
        return createClient(url, key);
      },
    },
  ],
  exports: [SUPABASE_CLIENT, SupabaseAuthGuard],
})
export class AuthModule {}

