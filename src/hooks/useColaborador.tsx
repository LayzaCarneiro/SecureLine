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

export const useColaborador = () => {
  const [colaborador, setColaborador] = useState<Colaborador | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Recuperar dados do localStorage ao montar
    const stored = localStorage.getItem("colaborador");
    if (stored) {
      try {
        setColaborador(JSON.parse(stored));
      } catch (err) {
        console.error("Erro ao parsejar colaborador:", err);
        setColaborador(null);
      }
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("colaborador");
    setColaborador(null);
  };

  return {
    colaborador,
    loading,
    logout,
    isLoggedIn: !!colaborador,
  };
};
