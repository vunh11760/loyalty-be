import { Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from './supabase.constants';
import { DEFAULT_PROFILE_ROLE, type ProfileRole } from '../profile/dto/profile-roles';

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

    return this.buildAuthResponse(data);
  }

  async refreshSession(refreshToken: string) {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw error;
    }

    return this.buildAuthResponse(data);
  }

  private async buildAuthResponse(data: { session: any; user: any }) {
    const user = data.user;
    let userRole: ProfileRole = DEFAULT_PROFILE_ROLE;
    if (user?.id) {
      userRole = await this.getOrCreateProfileRole(user.id, user.email);
    }

    return {
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
      user: user
        ? {
            ...user,
            role: userRole,
          }
        : null,
    };
  }

  private async getOrCreateProfileRole(
    userId: string,
    email?: string | null,
  ): Promise<ProfileRole> {
    const { error: upsertError } = await this.supabase.from('profiles').upsert(
      {
        user_id: userId,
        email: email ?? null,
        full_name: null,
        phone: null,
        address: null,
        loyalty_points: 0,
        loyalty_tier: 'bronze',
        role: DEFAULT_PROFILE_ROLE,
      },
      { onConflict: 'user_id', ignoreDuplicates: true },
    );

    if (upsertError) {
      // Table may not exist yet; verify-otp still succeeds, profile can be created later
      console.warn('[AuthService] Could not ensure profile:', upsertError.message);
    }

    const { data, error: selectError } = await this.supabase
      .from('profiles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (selectError || !data) {
      return DEFAULT_PROFILE_ROLE;
    }

    return data.role as ProfileRole;
  }
}
