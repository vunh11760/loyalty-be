import { Logger, Module } from '@nestjs/common';
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
        const url = config.get<string>('SUPABASE_URL')?.trim();
        const anonKey = config.get<string>('SUPABASE_ANON_KEY')?.trim();
        const serviceRoleKey = config
          .get<string>('SUPABASE_SERVICE_ROLE_KEY')
          ?.trim();

        if (!url || !anonKey) {
          throw new Error(
            'SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables',
          );
        }

        const logger = new Logger('SupabaseClient');
        // Prefer service role for backend so PostgREST runs as service_role (bypasses RLS).
        // With anon only, server requests have no user JWT → RLS blocks public.profiles.
        const key = serviceRoleKey || anonKey;
        if (serviceRoleKey) {
          logger.log('Using SUPABASE_SERVICE_ROLE_KEY (server-side DB access).');
        } else {
          logger.warn(
            'SUPABASE_SERVICE_ROLE_KEY is not set; using anon key. Server-side profiles/points will fail with RLS unless you set the service role key or pass a user JWT per request.',
          );
        }

        return createClient(url, key, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        });
      },
    },
  ],
  exports: [SUPABASE_CLIENT, SupabaseAuthGuard],
})
export class AuthModule {}

