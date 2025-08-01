
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: 'super_admin' | 'director' | 'coordinator';
  clinic_name: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch user profile using any type temporarily until types update
        const { data: profileData, error } = await (supabase as any)
          .from('user_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (!error && profileData) {
          setProfile(profileData as UserProfile);
        }
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const { data: profileData, error } = await (supabase as any)
            .from('user_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          if (!error && profileData) {
            setProfile(profileData as UserProfile);
          }
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
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
