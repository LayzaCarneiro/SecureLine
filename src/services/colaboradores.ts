const API_BASE = "https://api-golpe-whatsapp.onrender.com";

export interface Telefone {
  id: number;
  numero: string;
  colaboradorId: number;
}

export interface Empresa {
  id: number;
  nome: string | null;
  codigo_acesso: string | null;
  segmento: string | null;
  email_admin: string | null;
  created_at: string;
  ativo: boolean;
}

export interface Colaborador {
  id: number;
  nome: string | null;
  senha: string | null;
  codigo_colaborador: string;
  apelido: string | null;
  setor: string | null;
  created_at: string;
  empresaId: number | null;
  triked: boolean;
  ativo: boolean;
  empresa?: Empresa | null;
  telefones?: Telefone[];
  resultadosTestes?: unknown[];
}

export async function listColaboradores(): Promise<Colaborador[]> {
  const res = await fetch(`${API_BASE}/colaboradores`);
  if (!res.ok) throw new Error("Falha ao buscar colaboradores");
  return res.json();
}

export async function loginColaborador(
  codigo_colaborador: string,
  senha: string
): Promise<Colaborador> {
  const all = await listColaboradores();
  const found = all.find(
    (c) =>
      c.codigo_colaborador.trim().toLowerCase() ===
        codigo_colaborador.trim().toLowerCase() &&
      (c.senha ?? "") === senha
  );
  if (!found) throw new Error("Código ou senha inválidos");
  return found;
}

export interface SignupPayload {
  nome: string;
  codigo_colaborador: string;
  senha: string;
  setor?: string;
  apelido?: string;
  empresaId?: number;
  telefone?: string;
}

export async function signupColaborador(
  payload: SignupPayload
): Promise<Colaborador> {
  const res = await fetch(`${API_BASE}/colaboradores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: payload.nome,
      codigo_colaborador: payload.codigo_colaborador,
      senha: payload.senha,
      setor: payload.setor ?? "Geral",
      apelido: payload.apelido ?? null,
      empresaId: payload.empresaId ?? null,
      ativo: true,
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Falha no cadastro: ${txt || res.status}`);
  }
  return res.json();
}

export async function listEmpresas(): Promise<Empresa[]> {
  const res = await fetch(`${API_BASE}/empresas`);
  if (!res.ok) throw new Error("Falha ao buscar empresas");
  return res.json();
}
