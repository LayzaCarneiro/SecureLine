/**
 * Exemplo de como usar o hook useColaboradorSignUp em um componente
 * Este é um exemplo educacional que mostra como reutilizar a integração
 */

import { useState } from "react";
import { useColaboradorSignUp } from "@/hooks/useColaboradorSignUp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

/**
 * Componente que valida um código de colaborador
 * Este pode ser usado como um formulário pré-cadastro
 */
export function ColaboradorValidationExample() {
  const [codigo, setCodigo] = useState("");
  const [stage, setStage] = useState<"validation" | "registration">("validation");

  const {
    loading,
    error,
    success,
    colaborador,
    validateAndFindColaborador,
    updateWithPasswordAndName,
    reset,
  } = useColaboradorSignUp();

  /**
   * Etapa 1: Validar código
   */
  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!codigo.trim()) {
      toast({
        title: "Código vazio",
        description: "Informe o código de acesso",
        variant: "destructive",
      });
      return;
    }

    const result = await validateAndFindColaborador(codigo);

    if (result) {
      setStage("registration");
      toast({
        title: "Código validado!",
        description: "Agora configure sua senha",
      });
    } else {
      toast({
        title: "Erro ao validar",
        description: error || "Código não encontrado",
        variant: "destructive",
      });
    }
  };

  /**
   * Etapa 2: Registrar com senha
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!colaborador) {
      toast({
        title: "Erro",
        description: "Dados do colaborador não encontrados",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData(e.target as HTMLFormElement);
    const nome = formData.get("nome") as string;
    const senha = formData.get("senha") as string;

    if (!nome || !senha) {
      toast({
        title: "Dados incompletos",
        description: "Preencha nome e senha",
        variant: "destructive",
      });
      return;
    }

    const result = await updateWithPasswordAndName(
      colaborador.id,
      nome,
      senha
    );

    if (result) {
      toast({
        title: "Registrado com sucesso!",
        description: "Você pode fazer login agora",
      });

      // Limpar formulário
      setCodigo("");
      setStage("validation");
      reset();
    } else {
      toast({
        title: "Erro ao registrar",
        description: error || "Tente novamente",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6">
      {stage === "validation" ? (
        <form onSubmit={handleValidateCode} className="space-y-4">
          <h2 className="text-2xl font-bold">Validar Código</h2>

          <Input
            type="text"
            placeholder="Digite seu código de acesso"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            disabled={loading}
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Validar Código
          </Button>

          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <h2 className="text-2xl font-bold">Configurar Conta</h2>

          <div>
            <label className="block text-sm font-medium mb-2">
              Nome Completo
            </label>
            <Input
              type="text"
              name="nome"
              placeholder="João da Silva"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Senha (mínimo 8 caracteres)
            </label>
            <Input
              type="password"
              name="senha"
              placeholder="••••••••"
              disabled={loading}
              required
              minLength={8}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registrar Conta
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setStage("validation");
              reset();
            }}
            disabled={loading}
            className="w-full"
          >
            Voltar
          </Button>

          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </form>
      )}
    </div>
  );
}

/**
 * ALTERNATIVA: Usar diretamente no componente Auth.tsx
 * 
 * Exemplo de integração minimalista:
 * 
 * const { validateAndFindColaborador, updateWithPasswordAndName } = useColaboradorSignUp()
 * 
 * // Durante o signup:
 * const colaborador = await validateAndFindColaborador(codigoDoFormulario)
 * if (colaborador) {
 *   await updateWithPasswordAndName(colaborador.id, nome, senha)
 * }
 */
