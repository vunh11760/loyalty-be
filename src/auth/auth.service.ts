import { Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from './supabase.constants';

@Injectable()
export class AuthService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async requestOtp(email: string) {
    const { error } = await this.supabase.auth.signInWithOtp({
      email,
      // options: {
      //   emailRedirectTo: undefined,
      // },
      // options: {
      //   // set this to false if you do not want the user to be automatically signed up
      //   shouldCreateUser: false,
      // },
    });

    if (error) {
      throw error;
    }

    return { success: true };
  }

  async verifyOtp(email: string, token: string) {
    const { data, error } = await this.supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      throw error;
    }

    const user = data.user;
    if (user?.id) {
      await this.ensureProfileForUser(user.id, user.email);
    }

    return {
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
      user: data.user,
    };
  }

  private async ensureProfileForUser(
    userId: string,
    email?: string | null,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('profiles')
      .upsert(
        {
          user_id: userId,
          email: email ?? null,
          full_name: null,
          phone: null,
          loyalty_points: 0,
          loyalty_tier: 'bronze',
        },
        { onConflict: 'user_id', ignoreDuplicates: true },
      );

    if (error) {
      // Table may not exist yet; verify-otp still succeeds, profile can be created later
      console.warn('[AuthService] Could not ensure profile:', error.message);
    }
  }
}

