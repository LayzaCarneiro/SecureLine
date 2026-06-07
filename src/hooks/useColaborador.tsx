import { useState, useEffect } from "react";

export interface Colaborador {
  id: number;
  nome: string | null;
  senha: string;
  codigo_colaborador: string;
  apelido: string | null;
  setor: string | null;
  created_at: string;
  empresaId: number | null;
  triked: boolean;
  ativo: boolean;
  empresa: any;
  telefones: any[];
  resultadosTestes: any[];
}

// Lê o colaborador do localStorage de forma síncrona
function readColaboradorFromStorage(): Colaborador | null {
  try {
    const stored = localStorage.getItem("colaborador");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed ?? null;
  } catch {
    return null;
  }
}

export const useColaborador = () => {
  // Inicialização SÍNCRONA: evita qualquer race condition com ProtectedRoute
  const [colaborador, setColaborador] = useState<Colaborador | null>(
    readColaboradorFromStorage
  );

  useEffect(() => {
    // Atualiza o estado quando outra parte do app altera o localStorage
    const handleChange = () => {
      setColaborador(readColaboradorFromStorage());
    };

    window.addEventListener("colaborador-changed", handleChange);

    return () => {
      window.removeEventListener("colaborador-changed", handleChange);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("colaborador");
    setColaborador(null);
    window.dispatchEvent(new Event("colaborador-changed"));
  };

  return {
    colaborador,
    loading: false, // nunca mais há carregamento assíncrono
    logout,
    isLoggedIn: !!colaborador,
  };
};
