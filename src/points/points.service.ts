import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../auth/supabase.constants';

export interface PointHistoryEntry {
  id: string;
  user_id: string;
  amount: number;
  type: 'add' | 'exchange';
  balance_after: number;
  created_at: string;
}

@Injectable()
export class PointsService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async addPoints(userId: string, amount: number): Promise<{ loyalty_points: number }> {
    const profile = await this.getProfileOrThrow(userId);
    const newPoints = profile.loyalty_points + amount;

    const { data, error } = await this.supabase
      .from('profiles')
      .update({
        loyalty_points: newPoints,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select('loyalty_points')
      .single();

    if (error) this.throwPointsError(error);
    const loyaltyPoints = (data as { loyalty_points: number }).loyalty_points;

    await this.recordHistory(userId, amount, 'add', loyaltyPoints);
    return { loyalty_points: loyaltyPoints };
  }

  async exchangePoints(userId: string, amount: number): Promise<{ loyalty_points: number }> {
    const profile = await this.getProfileOrThrow(userId);

    if (profile.loyalty_points < amount) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Insufficient points',
          message: `You have ${profile.loyalty_points} points. Need ${amount} to exchange.`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const newPoints = profile.loyalty_points - amount;

    const { data, error } = await this.supabase
      .from('profiles')
      .update({
        loyalty_points: newPoints,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select('loyalty_points')
      .single();

    if (error) this.throwPointsError(error);
    const loyaltyPoints = (data as { loyalty_points: number }).loyalty_points;

    await this.recordHistory(userId, -amount, 'exchange', loyaltyPoints);
    return { loyalty_points: loyaltyPoints };
  }

  async getHistory(userId: string, limit = 50): Promise<PointHistoryEntry[]> {
    const { data, error } = await this.supabase
      .from('point_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) this.throwHistoryError(error);
    return (data ?? []) as PointHistoryEntry[];
  }

  private async recordHistory(
    userId: string,
    amount: number,
    type: 'add' | 'exchange',
    balanceAfter: number,
  ): Promise<void> {
    const { error } = await this.supabase.from('point_history').insert({
      user_id: userId,
      amount,
      type,
      balance_after: balanceAfter,
    });
    if (error) {
      // Log but don't fail the main operation
      console.warn('[PointsService] Failed to record point_history:', error.message);
    }
  }

  private async getProfileOrThrow(userId: string): Promise<{ loyalty_points: number }> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('loyalty_points')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) this.throwPointsError(error);
    if (!data) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: 'Profile not found. Complete sign-in first.',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return data as { loyalty_points: number };
  }

  private throwPointsError(error: { message?: string }): never {
    const msg = (error?.message ?? String(error)).toLowerCase();
    const isTableMissing =
      msg.includes('schema cache') ||
      msg.includes('could not find the table') ||
      (msg.includes('profiles') &&
        (msg.includes('cache') || msg.includes('table') || msg.includes('relation')));

    if (isTableMissing) {
      throw new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          error: 'Profiles table missing',
          message: 'Run supabase/create-profiles-table.sql in Supabase SQL Editor.',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    throw new HttpException(
      {
        statusCode: HttpStatus.BAD_GATEWAY,
        error: 'Database error',
        message: 'Points operation failed.',
      },
      HttpStatus.BAD_GATEWAY,
    );
  }

  private throwHistoryError(error: { message?: string }): never {
    const msg = (error?.message ?? String(error)).toLowerCase();
    const isTableMissing =
      msg.includes('schema cache') ||
      msg.includes('could not find the table') ||
      (msg.includes('point_history') &&
        (msg.includes('cache') || msg.includes('table') || msg.includes('relation')));

    if (isTableMissing) {
      throw new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          error: 'Point history table missing',
          message: 'Run supabase/create-point-history-table.sql in Supabase SQL Editor.',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    throw new HttpException(
      {
        statusCode: HttpStatus.BAD_GATEWAY,
        error: 'Database error',
        message: 'Failed to load point history.',
      },
      HttpStatus.BAD_GATEWAY,
    );
  }
}
