import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  Session,
  User,
} from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type AppRole =
  | "admin"
  | "subscriber";

interface AuthContextValue {
  session: Session | null;

  user: User | null;

  roles: AppRole[];

  loading: boolean;

  isAdmin: boolean;

  isSubscriber: boolean;

  signOut: () => Promise<void>;
}

const AuthContext =
  createContext<
    AuthContextValue | undefined
  >(undefined);

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [session, setSession] =
    useState<Session | null>(null);

  const [user, setUser] =
    useState<User | null>(null);

  const [roles, setRoles] =
    useState<AppRole[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const {
      data: sub,
    } = supabase.auth.onAuthStateChange(
      (_event, sess) => {
        setSession(sess);

        setUser(sess?.user ?? null);

        const role =
          sess?.user?.user_metadata
            ?.role as AppRole;

        setRoles(role ? [role] : []);

        setLoading(false);
      }
    );

    supabase.auth
      .getSession()
      .then(
        ({
          data: { session: sess },
        }) => {
          setSession(sess);

          setUser(
            sess?.user ?? null
          );

          const role =
            sess?.user?.user_metadata
              ?.role as AppRole;

          setRoles(
            role ? [role] : []
          );

          setLoading(false);
        }
      );

    return () =>
      sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();

    setRoles([]);
  };

  const metadataRole =
    user?.user_metadata
      ?.role as AppRole;

  const isAdmin =
    metadataRole === "admin" ||
    roles.includes("admin");

  const isSubscriber =
    metadataRole ===
      "subscriber" ||
    isAdmin ||
    roles.includes(
      "subscriber"
    );

  return (
    <AuthContext.Provider
      value={{
        session,

        user,

        roles,

        loading,

        isAdmin,

        isSubscriber,

        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

function useAuth() {
  const ctx =
    useContext(AuthContext);

  if (!ctx)
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );

  return ctx;
};

export { useAuth };