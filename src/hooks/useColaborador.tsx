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
    const readFromStorage = () => {
      const stored = localStorage.getItem("colaborador");
      if (stored) {
        try {
          setColaborador(JSON.parse(stored));
        } catch (err) {
          console.error("Erro ao parsejar colaborador:", err);
          setColaborador(null);
        }
      } else {
        setColaborador(null);
      }
      setLoading(false);
    };

    readFromStorage();

    // Escuta evento customizado para atualizar estado na mesma aba
    const handleChange = () => readFromStorage();
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
    loading,
    logout,
    isLoggedIn: !!colaborador,
  };
};
