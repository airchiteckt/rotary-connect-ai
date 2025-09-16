import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isTrialValid: boolean;
  profile: any | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: { full_name: string; club_name: string }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  checkTrialStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTrialValid, setIsTrialValid] = useState(false);
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile and trial check
          setTimeout(() => {
            fetchProfile(session.user.id);
            checkTrialStatus();
          }, 0);
        } else {
          setProfile(null);
          setIsTrialValid(false);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
        checkTrialStatus();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const checkTrialStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .rpc('is_trial_valid', { user_uuid: user.id });
      
      if (error) throw error;
      setIsTrialValid(data || false);
    } catch (error) {
      console.error('Error checking trial status:', error);
      setIsTrialValid(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signUp = async (email: string, password: string, userData: { full_name: string; club_name: string }) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData
      }
    });

    return { error };
  };

  const signOut = async () => {
    try {
      // Clear local state first to ensure UI updates immediately
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsTrialValid(false);
      
      // Then attempt to sign out from Supabase
      await supabase.auth.signOut();
    } catch (error) {
      // Even if signOut fails, we still want to clear the local state
      console.error('Error during sign out:', error);
      // Force clear the session from localStorage as fallback
      localStorage.removeItem('sb-ajgyrhddxljfauwneput-auth-token');
    }
  };

  const value = {
    user,
    session,
    loading,
    isTrialValid,
    profile,
    signIn,
    signUp,
    signOut,
    checkTrialStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}