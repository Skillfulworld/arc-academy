import { useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export interface SupabaseAuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export function useSupabaseAuth(): SupabaseAuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, session, loading };
}
