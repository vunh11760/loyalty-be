/** Allowed application roles on `public.profiles.role` */
export const PROFILE_ROLES = ['user', 'staff', 'admin'] as const;

export type ProfileRole = (typeof PROFILE_ROLES)[number];

/** Default role for new profiles */
export const DEFAULT_PROFILE_ROLE: ProfileRole = 'user';
