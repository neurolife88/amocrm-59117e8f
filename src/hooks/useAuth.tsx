
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserProfile = {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: 'super_admin' | 'director' | 'coordinator';
  clinic_name: string | null;
  created_at: string;
  updated_at: string;
};

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  profileError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching profile for user ID:', userId);
      setProfileError(null);
      
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      console.log('📊 Profile fetch result:', { profileData, error });
      
      if (!error && profileData) {
        console.log('✅ Profile loaded successfully:', profileData);
        setProfile(profileData);
        setProfileError(null);
      } else {
        console.error('❌ Error fetching profile:', error);
        setProfileError(error?.message || 'Failed to load profile');
        setProfile(null);
      }
    } catch (err) {
      console.error('💥 Profile fetch exception:', err);
      setProfileError('Network error while loading profile');
      setProfile(null);
    }
  };

  const refetchProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('🔐 Initial session:', session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      
      setLoading(false);
    }).catch(err => {
      console.error('💥 Session fetch error:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state changed:', event, session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetch to avoid blocking auth state change
          setTimeout(async () => {
            await fetchProfile(session.user.id);
          }, 0);
        } else {
          console.log('🚪 User logged out, clearing profile');
          setProfile(null);
          setProfileError(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in for:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('Signing out');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, profileError, signIn, signOut, refetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
