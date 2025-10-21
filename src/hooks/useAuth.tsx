import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isTrialValid: boolean;
  profile: any | null;
  clubOwnerProfile: any | null;
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
  const [clubOwnerProfile, setClubOwnerProfile] = useState<any | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile and trial check to avoid blocking the auth callback
          setTimeout(() => {
            if (isMounted) {
              fetchProfile(session.user.id);
              checkTrialStatus();
            }
          }, 0);
        } else {
          setProfile(null);
          setIsTrialValid(false);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
        checkTrialStatus();
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      // Fetch user's own profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setProfile(data);

      // Get club owner ID
      const { data: ownerIdData, error: ownerError } = await supabase.rpc('get_club_owner_id', {
        user_uuid: userId
      });

      if (ownerError) {
        console.error('Error getting club owner ID:', ownerError);
        setClubOwnerProfile(data); // Fallback to user's own profile
        return;
      }

      // If user is not the owner, fetch club owner's profile
      if (ownerIdData && ownerIdData !== userId) {
        const { data: ownerProfile, error: ownerProfileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', ownerIdData)
          .single();

        if (ownerProfileError) {
          console.error('Error fetching club owner profile:', ownerProfileError);
          setClubOwnerProfile(data); // Fallback to user's own profile
          return;
        }
        setClubOwnerProfile(ownerProfile);
      } else {
        // User is the owner, use their own profile
        setClubOwnerProfile(data);
      }
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
    clubOwnerProfile,
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