import { supabase } from "@/integrations/supabase/client";
import { findColaboradorByCodigo } from "./colaboradores";

const API_BASE = "https://api-golpe-whatsapp.onrender.com";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VerificarCodigoResponse {
  valido: boolean;
  isPrimeiroAcesso: boolean;
  /** ID do colaborador — retornado pela API quando isPrimeiroAcesso é true */
  colaboradorId?: number;
  id?: number;
  nome?: string | null;
}

export interface UsuarioLogado {
  id: number;
  nome: string;
  apelido: string;
  empresaId: number;
}

export interface LoginAPIResponse {
  sucesso: boolean;
  colaborador: UsuarioLogado;
  /** Alias legado — algumas versões da API retornam como usuario */
  usuario?: UsuarioLogado;
}

// ---------------------------------------------------------------------------
// API endpoints
// ---------------------------------------------------------------------------

/**
 * Verifica se o código da empresa é válido e se é primeiro acesso.
 * POST /auth/verificar-codigo
 */
export async function verificarCodigoEmpresa(
  codigo: string
): Promise<VerificarCodigoResponse> {
  try {
    const colaborador = await findColaboradorByCodigo(codigo);

    if (!colaborador) {
      return {
        valido: false,
        isPrimeiroAcesso: false,
      };
    }

    // Se o colaborador não tem apelido (nickname) configurado, é considerado primeiro acesso (primeira ativação)
    const isPrimeiro = !colaborador.apelido || colaborador.apelido.trim() === "";

    return {
      valido: true,
      isPrimeiroAcesso: isPrimeiro,
      colaboradorId: colaborador.id,
      id: colaborador.id,
      empresaId: colaborador.empresaId || undefined,
    };
  } catch (err: any) {
    console.error("Erro ao verificar código localmente:", err);
    throw err;
  }
}

/**
 * Autentica o colaborador com apelido e senha.
 * POST /auth/login
 *
 * Lança erro com mensagem "UNAUTHORIZED" para status 401.
 */
export async function loginAPI(
  apelido: string,
  senha: string
): Promise<LoginAPIResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ apelido, senha }),
      signal: controller.signal,
      mode: "cors",
      credentials: "omit",
    });

    clearTimeout(timeoutId);

    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Erro ${res.status}: ${body}`);
    }

    const data: LoginAPIResponse = await res.json();
    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err?.name === "AbortError") {
      throw new Error("Tempo limite esgotado. Verifique sua conexão.");
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Supabase helpers (mantidos para compatibilidade)
// ---------------------------------------------------------------------------

/**
 * Authenticate user with email and password (Supabase)
 */
export async function loginWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { success: true, data: data.user };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Register new user (Supabase)
 */
export async function registerUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return { success: true, data: data.user };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Logout current user (Supabase)
 */
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
