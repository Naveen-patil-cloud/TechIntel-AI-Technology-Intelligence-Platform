import { supabase } from './lib/supabase';

export const auth = {
  currentUser: null as any,
  signOut: async () => {
    await supabase.auth.signOut();
    auth.currentUser = null;
    if (authUpdateListener) authUpdateListener(null);
  }
};

let authUpdateListener: ((user: any) => void) | null = null;

export const onAuthStateChanged = (authInstance: any, callback: (user: any) => void) => {
  authUpdateListener = callback;
  
  supabase.auth.getSession().then(({ data: { session } }) => {
    const u = session?.user ? {
      uid: session.user.id,
      email: session.user.email,
      displayName: session.user.user_metadata?.username || session.user.email?.split('@')[0],
      photoURL: null,
    } : null;
    auth.currentUser = u;
    callback(u);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    const u = session?.user ? {
      uid: session.user.id,
      email: session.user.email,
      displayName: session.user.user_metadata?.username || session.user.email?.split('@')[0],
      photoURL: null,
    } : null;
    auth.currentUser = u;
    if (authUpdateListener) authUpdateListener(u);
  });

  return () => { 
    subscription.unsubscribe();
    authUpdateListener = null; 
  };
};

export const signInWithPopup = async (authInstance: any, provider: any) => {
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
  if (error) throw error;
  return data;
};

export const signInWithEmailAndPassword = async (authInstance: any, email: string, password?: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: password || '' });
  if (error) throw error;
  return { user: data.user };
};

export const createUserWithEmailAndPassword = async (authInstance: any, email: string, password?: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password: password || '' });
  if (error) throw error;
  return { user: data.user };
};

export const updateProfile = async (user: any, data: any) => {
  await supabase.auth.updateUser({ data: { username: data.displayName } });
};

export const googleProvider = {};
export const db = {} as any; // Legacy export to avoid breaking existing imports where unused

export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};
