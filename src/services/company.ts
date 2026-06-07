import axios from "axios";

const API_BASE = "https://api-golpe-whatsapp.onrender.com";

export interface CompanyColaborador {
  id: number;
  nome: string | null;
  codigo_colaborador: string;
  apelido: string | null;
  setor: string | null;
  created_at: string;
  empresaId: number;
  triked: boolean;
  ativo: boolean;
  senha?: string;
}

export interface Company {
  id: number;
  nome: string;
  codigo_acesso: string;
  segmento: string | null;
  email_admin: string | null;
  created_at: string;
  ativo: boolean;
  senha?: string;
  colaboradores: CompanyColaborador[];
}

export interface Result {
  id: number;
  total_acertos: number | null;
  total_erros: number | null;
  score: number | null;
  faixa_etaria: string | null;
  conhecimento_ti: string | null;
  colaboradorId: number;
  colaborador: {
    id: number;
    nome: string | null;
    senha?: string;
    codigo_colaborador: string;
    apelido: string | null;
    setor: string | null;
    created_at: string;
    empresaId: number;
    triked: boolean;
    ativo: boolean;
  };
}

/**
 * Obtém a lista de todas as empresas do endpoint.
 */
export async function getCompanies(): Promise<Company[]> {
  const response = await axios.get<Company[]>(`${API_BASE}/empresas`);
  return response.data;
}

/**
 * Obtém todos os resultados de testes do endpoint.
 */
export async function getResults(): Promise<Result[]> {
  const response = await axios.get<Result[]>(`${API_BASE}/resultados`);
  return response.data;
}

/**
 * Atualiza a senha de uma empresa específica.
 */
export async function updateCompanyPassword(id: number, newPassword: string): Promise<Company> {
  const responseCompanies = await axios.get<Company[]>(`${API_BASE}/empresas`);
  const company = responseCompanies.data.find((c) => c.id === id);
  if (!company) {
    throw new Error("Empresa não encontrada.");
  }
  
  const updatedCompany = {
    ...company,
    senha: newPassword,
  };

  const response = await axios.put<Company>(`${API_BASE}/empresas/${id}`, updatedCompany);
  return response.data;
}
