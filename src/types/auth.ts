export type AppRole = 'super_admin' | 'director' | 'coordinator';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  clinic_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  profileError: string | null;
}