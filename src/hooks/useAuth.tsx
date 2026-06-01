import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  Colaborador,
  loginColaborador,
  signupColaborador,
  SignupPayload,
} from "@/services/colaboradores";

const STORAGE_KEY = "secureline.colaborador";

interface AuthContextValue {
  user: Colaborador | null;
  loading: boolean;
  isAdmin: boolean;
  isSubscriber: boolean;
  signIn: (codigo: string, senha: string) => Promise<Colaborador>;
  signUp: (payload: SignupPayload) => Promise<Colaborador>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const isAdminColaborador = (c: Colaborador | null) => {
  if (!c) return false;
  const code = c.codigo_colaborador?.toUpperCase() ?? "";
  return code.includes("ADMIN");
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Colaborador | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const persist = (c: Colaborador | null) => {
    setUser(c);
    if (c) localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const signIn = async (codigo: string, senha: string) => {
    const c = await loginColaborador(codigo, senha);
    persist(c);
    return c;
  };

  const signUp = async (payload: SignupPayload) => {
    const c = await signupColaborador(payload);
    // try login afterwards to fetch full record (with empresa/telefones)
    try {
      const full = await loginColaborador(payload.codigo_colaborador, payload.senha);
      persist(full);
      return full;
    } catch {
      persist(c);
      return c;
    }
  };

  const signOut = async () => {
    persist(null);
  };

  const isAdmin = isAdminColaborador(user);
  const isSubscriber = !!user;

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin, isSubscriber, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
