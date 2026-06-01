import { useState, useCallback } from "react";
import {
  findColaboradorByCodigo,
  updateColaborador,
  Colaborador,
  hasPasswordSet,
} from "@/services/colaboradores";

interface UseColaboradorSignUpState {
  loading: boolean;
  error: string | null;
  success: boolean;
  colaborador: Colaborador | null;
}

interface UseColaboradorSignUpResult extends UseColaboradorSignUpState {
  validateAndFindColaborador: (codigo: string) => Promise<Colaborador | null>;
  updateWithPasswordAndName: (
    id: number,
    nome: string,
    senha: string
  ) => Promise<Colaborador | null>;
  reset: () => void;
}

/**
 * Hook para gerenciar o fluxo de cadastro com API de colaboradores
 * 
 * @example
 * const { validateAndFindColaborador, updateWithPasswordAndName, loading } = useColaboradorSignUp()
 * 
 * // Validar código
 * const colaborador = await validateAndFindColaborador("TEST")
 * 
 * // Atualizar com senha
 * await updateWithPasswordAndName(colaborador.id, "João", "senha123")
 */
export function useColaboradorSignUp(): UseColaboradorSignUpResult {
  const [state, setState] = useState<UseColaboradorSignUpState>({
    loading: false,
    error: null,
    success: false,
    colaborador: null,
  });

  const validateAndFindColaborador = useCallback(
    async (codigo: string): Promise<Colaborador | null> => {
      setState({
        loading: true,
        error: null,
        success: false,
        colaborador: null,
      });

      try {
        console.log("🚀 Iniciando validação de código:", codigo);
        
        const colaborador = await findColaboradorByCodigo(codigo);

        if (!colaborador) {
          const errorMsg = "Código de acesso não encontrado. Verifique o código informado.";
          console.warn("⚠️ " + errorMsg);
          
          setState({
            loading: false,
            error: errorMsg,
            success: false,
            colaborador: null,
          });
          return null;
        }

        if (hasPasswordSet(colaborador)) {
          const errorMsg = "Este código já possui uma senha definida. Acesse a aba 'Entrar' para fazer login.";
          console.warn("⚠️ " + errorMsg);
          
          setState({
            loading: false,
            error: errorMsg,
            success: false,
            colaborador,
          });
          return null;
        }

        console.log("✅ Validação concluída com sucesso");
        
        setState({
          loading: false,
          error: null,
          success: false,
          colaborador,
        });

        return colaborador;
      } catch (err: any) {
        const errorMessage = err?.message || "Erro ao validar código. Tente novamente.";
        
        console.error("❌ Erro na validação:", errorMessage);
        console.error("Detalhes:", err);

        // Mensagens mais amigáveis baseadas no tipo de erro
        let userFriendlyError = errorMessage;
        
        if (errorMessage.includes('não foi possível conectar')) {
          userFriendlyError = "Não foi possível verificar o código. Verifique sua conexão de internet.";
        } else if (errorMessage.includes('CORS')) {
          userFriendlyError = "Não foi possível verificar o código. Problema de segurança com a API.";
        } else if (errorMessage.includes('indisponível')) {
          userFriendlyError = "API indisponível. Tente novamente em alguns momentos.";
        }

        setState({
          loading: false,
          error: userFriendlyError,
          success: false,
          colaborador: null,
        });

        return null;
      }
    },
    []
  );

  const updateWithPasswordAndName = useCallback(
    async (
      id: number,
      nome: string,
      senha: string
    ): Promise<Colaborador | null> => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        const updated = await updateColaborador(id, nome, senha);

        setState({
          loading: false,
          error: null,
          success: true,
          colaborador: updated,
        });

        return updated;
      } catch (err: any) {
        const errorMessage =
          err?.message ||
          "Erro ao atualizar colaborador. Tente novamente.";

        setState({
          loading: false,
          error: errorMessage,
          success: false,
          colaborador: null,
        });

        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: false,
      colaborador: null,
    });
  }, []);

  return {
    ...state,
    validateAndFindColaborador,
    updateWithPasswordAndName,
    reset,
  };
}
