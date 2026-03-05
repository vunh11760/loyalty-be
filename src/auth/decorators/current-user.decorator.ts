import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import { REQUEST_USER_KEY } from '../guards/supabase-auth.guard';

export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext): User | unknown => {
    const request = ctx.switchToHttp().getRequest<Record<string, User>>();
    const user = request[REQUEST_USER_KEY] as User | undefined;
    if (!user) return null;
    return data ? user[data] : user;
  },
);
