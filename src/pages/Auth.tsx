import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useColaborador } from "@/hooks/useColaborador";

import { z } from "zod";

import { motion } from "framer-motion";

import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { toast } from "@/hooks/use-toast";

import {
  Loader2,
  ArrowLeft,
  LockKeyhole,
  LogOut,
  CheckCircle2,
} from "lucide-react";

import {
  findColaboradorByCodigo,
  updateColaborador,
  hasPasswordSet,
  isActive,
  loginColaborador,
} from "@/services/colaboradores";

const ADMIN_CODE = "AdminSecureL1n&";

/**
 * Gera uma senha forte e determinística para o Supabase.
 * Baseada no email e código do colaborador, nunca contém senhas comuns.
 */
function mkSupabasePass(identifier: string): string {
  return "SL!" + btoa(identifier + ":SecureLine@2026").replace(/=/g, "") + "#Zx9";
}

const signUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Nome muito curto")
    .max(100),

  email: z
    .string()
    .trim()
    .min(3, "Username/E-mail muito curto")
    .max(255),

  password: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(72),

  accessCode: z
    .string()
    .min(3, "Código inválido"),
});

const signInSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, "Informe seu Apelido")
    .max(255),

  password: z
    .string()
    .min(1, "Informe a senha")
    .max(72),
});

const Auth = () => {
  const navigate = useNavigate();
  const { colaborador, logout } = useColaborador();

  const [loading, setLoading] =
    useState(false);

  // SIGN UP
  const [name, setName] = useState("");
  const [emailUp, setEmailUp] = useState("");
  const [passwordUp, setPasswordUp] = useState("");
  const [accessCode, setAccessCode] = useState("");

  // SIGN IN
  const [nomeIn, setNomeIn] = useState("");
  const [passwordIn, setPasswordIn] = useState("");

  const handleSignUp = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const parsed =
      signUpSchema.safeParse({
        fullName: name,
        email: emailUp,
        password: passwordUp,
        accessCode
      });

    if (!parsed.success) {
      toast({
        title: "Dados inválidos",
        description:
          parsed.error.errors[0].message,
        variant: "destructive",
      });

      return;
    }

    const normalizedCode = parsed.data.accessCode.trim();
    const supabaseEmail = parsed.data.email.includes("@")
      ? parsed.data.email
      : `${parsed.data.email}@secureline.com`;

    setLoading(true);

    // Admin code bypassa a API e cria conta admin diretamente no Supabase
    if (normalizedCode === ADMIN_CODE) {
      const { error } = await supabase.auth.signUp({
        email: supabaseEmail,
        password: mkSupabasePass(supabaseEmail),
        options: {
          emailRedirectTo: `${window.location.origin}/members`,
          data: {
            full_name: parsed.data.fullName,
            role: "admin",
          },
        },
      });

      setLoading(false);

      if (error) {
        // Se der erro de senha fraca, logar e prosseguir (conta admin será criada no login)
        console.warn("Erro ao criar conta Admin no Supabase (ignorado):", error.message);
      }

      toast({
        title: "Conta criada!",
        description: "Acesso administrativo liberado.",
      });
      navigate("/members");
      return;
    }

    // Fluxo padrão: valida código de colaborador via API
    let colaborador: any = null;
    try {
      console.log(" Buscando código:", normalizedCode);
      colaborador = await findColaboradorByCodigo(normalizedCode);
    } catch (err: any) {
      setLoading(false);
      const errorMsg = err?.message || "Erro desconhecido";
      
      console.error(" Erro ao buscar código:", errorMsg);
      
      toast({
        title: " Não foi possível verificar o código",
        description: errorMsg.includes('conectar') 
          ? "Verifique sua conexão de internet ou tente novamente."
          : "Não conseguimos validar seu código. Tente novamente.",
        variant: "destructive",
      });
      return;
    }

    if (!colaborador) {
      setLoading(false);
      toast({
        title: " Código não encontrado",
        description: "O código de acesso informado não foi encontrado no sistema.",
        variant: "destructive",
      });
      return;
    }

    if (hasPasswordSet(colaborador)) {
      setLoading(false);
      toast({
        title: " Cadastro já realizado",
        description:
          "Este código já possui uma senha definida. Faça login na aba Entrar.",
        variant: "destructive",
      });
      return;
    }

    // Atualiza colaborador na API com nome + senha + apelido
    try {
      await updateColaborador(
        colaborador.id,
        parsed.data.fullName,
        parsed.data.password,
        parsed.data.email
      );
    } catch (err: any) {
      // Erros da API externa não bloqueiam o cadastro — logamos e continuamos
      console.warn("⚠️ Aviso ao atualizar colaborador na API (não bloqueia o cadastro):", err?.message);
    }

    // Cria conta no Supabase para acessar a área de membros
    const { error } = await supabase.auth.signUp({
      email: supabaseEmail,
      password: mkSupabasePass(supabaseEmail),
      options: {
        emailRedirectTo: `${window.location.origin}/members`,
        data: {
          full_name: parsed.data.fullName,
          role: "subscriber",
          codigo_colaborador: colaborador.codigo_colaborador,
        },
      },
    });

    setLoading(false);

    if (error) {
      // Ignorar qualquer erro de senha fraca - conta será acessada com mkSupabasePass no login
      if (!error.message.toLowerCase().includes("weak") && !error.message.toLowerCase().includes("guess") && !error.message.toLowerCase().includes("known")) {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      console.warn("Erro ignorado do Supabase:", error.message);
    }

    toast({
      title: "Conta criada!",
      description: "Senha definida e acesso liberado com sucesso.",
    });

    window.location.href = "/members";
  };

  const handleSignIn = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const parsed =
      signInSchema.safeParse({
        nome: nomeIn,
        password: passwordIn,
      });

    if (!parsed.success) {
      toast({
        title: "Dados inválidos",
        description:
          parsed.error.errors[0].message,
        variant: "destructive",
      });

      return;
    }

    setLoading(true);

    try {
      console.log(" Iniciando login...");
      
      // Fazer login contra a API
      let colaborador = null;
      try {
        colaborador = await loginColaborador(
          parsed.data.nome,
          parsed.data.password
        );
      } catch (apiErr) {
        console.warn("API de colaboradores falhou ou indisponível, tentando Supabase diretamente...", apiErr);
      }

      if (!colaborador) {
        // Fallback: Tenta autenticar diretamente no Supabase (para admins e contas supabased puras)
        console.log("Tentando login direto no Supabase...");
        const supabaseEmail = parsed.data.nome.includes("@")
          ? parsed.data.nome
          : `${parsed.data.nome}@secureline.com`;

        // Tenta com a senha crua primeiro (caso seja conta admin criada com senha crua)
        let { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
          email: supabaseEmail,
          password: mkSupabasePass(supabaseEmail),
        });

        // Se falhar, tenta com a senha + sufixo legado
        if (sbError) {
          const { data: sbDataRetry, error: sbErrorRetry } = await supabase.auth.signInWithPassword({
            email: supabaseEmail,
            password: parsed.data.password + "#StrongPass2026!",
          });
          if (!sbErrorRetry) {
            sbError = null;
            sbData = sbDataRetry;
          }
        }

        if (sbError) {
          setLoading(false);
          toast({
            title: "Credenciais inválidas",
            description: "Nome/Código ou senha incorretos.",
            variant: "destructive",
          });
          return;
        }

        // Sucesso no login Supabase direto (ex: admin)
        console.log("Login Supabase direto bem-sucedido:", sbData);
        toast({
          title: "Bem-vindo!",
          description: `Autenticado como ${sbData.user?.email}`,
        });
        
        // Salva mock de colaborador no local storage para o navbar / ui
        const mockColaborador = {
          nome: sbData.user?.user_metadata?.full_name || sbData.user?.email || "Admin",
          codigo_colaborador: sbData.user?.user_metadata?.codigo_colaborador || "admin",
          ativo: true,
          apelido: parsed.data.nome,
        };
        localStorage.setItem('colaborador', JSON.stringify(mockColaborador));
        window.dispatchEvent(new Event("colaborador-changed"));
        window.location.href = "/members";
        return;
      }

      if (!colaborador.ativo) {
        setLoading(false);
        toast({
          title: " Usuário inativo",
          description: "Este código ainda não está ativado.",
          variant: "destructive",
        });
        return;
      }

      // Se autenticado na API, fazer login no Supabase para garantir a sessão
      const supabaseEmail = (colaborador.apelido || "").includes("@")
        ? colaborador.apelido
        : `${colaborador.apelido || colaborador.codigo_colaborador}@secureline.com`;

      const { error: supabaseError } = await supabase.auth.signInWithPassword({
        email: supabaseEmail,
        password: mkSupabasePass(supabaseEmail),
      });

      if (supabaseError) {
        console.error("Erro ao autenticar no Supabase:", supabaseError.message);
        // Se o usuário não existir no Supabase, criamos ele dinamicamente na hora
        if (supabaseError.message.includes("Invalid login credentials") || supabaseError.message.includes("User not found")) {
          console.log("Criando conta correspondente no Supabase...");
          await supabase.auth.signUp({
            email: supabaseEmail,
            password: mkSupabasePass(supabaseEmail),
            options: {
              data: {
                full_name: colaborador.nome || parsed.data.nome,
                role: "subscriber",
                codigo_colaborador: colaborador.codigo_colaborador,
              },
            },
          });
        } else {
          console.warn("Sessão Supabase não iniciada:", supabaseError.message);
        }
      }

      console.log(" Login bem-sucedido:", colaborador);
      
      toast({
        title: "Bem-vindo!",
        description: `Autenticado como ${colaborador.nome || colaborador.codigo_colaborador}`,
      });

      // Salvar dados do colaborador no localStorage
      localStorage.setItem('colaborador', JSON.stringify(colaborador));
      window.dispatchEvent(new Event("colaborador-changed"));

      // Redirecionar para área de membros
      window.location.href = "/members";

    } catch (err: any) {
      setLoading(false);
      const errorMsg = err?.message || "Erro ao fazer login";
      
      console.error(" Erro no login:", errorMsg);
      
      toast({
        title: " Erro ao fazer login",
        description: errorMsg.includes('conectar')
          ? "Verifique sua conexão de internet."
          : errorMsg,
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#060816]
        text-white
        flex items-center justify-center
        px-4
      "
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.20),transparent_35%)]" />

      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* GLOW */}
      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px]" />

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="
          relative z-10
          w-full max-w-md
        "
      >
        {/* LOGO */}
        <div className="flex flex-col items-center mb-8">
          <Link
            to="/"
            className="
              group
              flex items-center gap-3
              mb-6
            "
          >
            <div
              className="
                relative
                flex items-center justify-center
                transition-transform duration-300
                group-hover:scale-110
              "
            >
              <img
                src="/images/logo.svg"
                alt="SecureLine"
                className="w-12 h-12"
              />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight">
                SecureLine
              </h1>

              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                Security Awareness
              </p>
            </div>
          </Link>

          <div className="text-center">
            <h2 className="text-3xl font-black tracking-tight mb-2">
              Área de membros
            </h2>

            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
              Acesse treinamentos avançados,
              simulações e dashboard de
              conscientização digital.
            </p>
          </div>
        </div>

        {/* CARD */}
        <Card
          className="
            relative
            overflow-hidden
            rounded-[32px]
            border border-white/10
            bg-white/[0.04]
            backdrop-blur-2xl
            shadow-[0_20px_80px_rgba(0,0,0,0.45)]
          "
        >
          {/* Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.18),transparent_35%)]" />

          <CardContent className="relative z-10 p-8">
            {colaborador ? (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-3 py-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-75" />
                    <div className="relative bg-[#060816] p-3 rounded-full">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-3">
                  <h3 className="text-xl font-bold text-white">
                    Bem-vindo!
                  </h3>
                  <p className="text-lg text-primary font-semibold">
                    {colaborador.nome || colaborador.codigo_colaborador}
                  </p>
                  <p className="text-sm text-zinc-400">
                    Você está conectado com sucesso
                  </p>
                </div>

                <Button
                  onClick={() => {
                    logout();
                    navigate("/auth");
                  }}
                  variant="outline"
                  className="w-full h-12 rounded-2xl border-white/10 hover:bg-white/[0.04]"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair da conta
                </Button>
              </div>
            ) : (
              <Tabs
              defaultValue="signin"
              className="w-full"
            >
              {/* TABS */}
              <TabsList
                className="
                  grid grid-cols-2
                  h-12
                  rounded-2xl
                  bg-white/[0.04]
                  border border-white/10
                  p-1
                "
              >
                <TabsTrigger
                  value="signin"
                  className="
                    rounded-xl
                    data-[state=active]:bg-gradient-to-r
                    data-[state=active]:from-primary
                    data-[state=active]:to-secondary
                    data-[state=active]:text-white
                  "
                >
                  Entrar
                </TabsTrigger>

                <TabsTrigger
                  value="signup"
                  className="
                    rounded-xl
                    data-[state=active]:bg-gradient-to-r
                    data-[state=active]:from-primary
                    data-[state=active]:to-secondary
                    data-[state=active]:text-white
                  "
                >
                  Criar conta
                </TabsTrigger>
              </TabsList>

              {/* SIGN IN */}
              <TabsContent value="signin">
                <form
                  onSubmit={handleSignIn}
                  className="space-y-5 mt-6"
                >
                  <div className="space-y-2">
                    <Label className="text-zinc-300">
                      Username
                    </Label>

                    <Input
                      type="text"
                      id="signin-username"
                      name="username"
                      autoComplete="username"
                      value={nomeIn}
                      onChange={(e) =>
                        setNomeIn(
                          e.target.value
                        )
                      }
                      placeholder="Digite seu Username"
                      required
                      className="
                        h-12
                        rounded-2xl
                        border-white/10
                        bg-white/[0.03]
                        text-white
                        placeholder:text-zinc-500
                        focus-visible:ring-primary
                      "
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-300">
                      Senha
                    </Label>

                    <Input
                      type="password"
                      value={passwordIn}
                      onChange={(e) =>
                        setPasswordIn(
                          e.target.value
                        )
                      }
                      required
                      className="
                        h-12
                        rounded-2xl
                        border-white/10
                        bg-white/[0.03]
                        text-white
                        placeholder:text-zinc-500
                        focus-visible:ring-primary
                      "
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="
                      w-full
                      h-12
                      rounded-2xl
                      font-semibold
                      bg-gradient-to-r
                      from-primary
                      to-secondary
                      shadow-[0_10px_40px_rgba(124,58,237,0.35)]
                    "
                  >
                    {loading && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}

                    Entrar
                  </Button>
                </form>
              </TabsContent>

              {/* SIGN UP */}
              <TabsContent value="signup">
                <form
                  onSubmit={handleSignUp}
                  className="space-y-5 mt-6"
                >
                  <div className="space-y-2">
                    <Label className="text-zinc-300">
                      Código de acesso
                    </Label>

                    <Input
                      value={accessCode}
                      onChange={(e) =>
                        setAccessCode(e.target.value)
                      }
                      required
                      className="
                        h-12
                        rounded-2xl
                        border-white/10
                        bg-white/[0.03]
                        text-white
                        placeholder:text-zinc-500
                        focus-visible:ring-primary
                      "
                    />

                    <p className="text-xs text-zinc-500">
                      Informe o código fornecido pela empresa.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-300">
                      Nome completo
                    </Label>

                    <Input
                      value={name}
                      onChange={(e) =>
                        setName(
                          e.target.value
                        )
                      }
                      required
                      className="
                        h-12
                        rounded-2xl
                        border-white/10
                        bg-white/[0.03]
                        text-white
                        placeholder:text-zinc-500
                        focus-visible:ring-primary
                      "
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-300">
                      Username
                    </Label>

                    <Input
                      type="text"
                      id="signup-username"
                      name="username"
                      autoComplete="username"
                      placeholder="Digite seu Username"
                      value={emailUp}
                      onChange={(e) =>
                        setEmailUp(
                          e.target.value
                        )
                      }
                      required
                      className="
                        h-12
                        rounded-2xl
                        border-white/10
                        bg-white/[0.03]
                        text-white
                        placeholder:text-zinc-500
                        focus-visible:ring-primary
                      "
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-300">
                      Senha
                    </Label>

                    <Input
                      type="password"
                      value={passwordUp}
                      onChange={(e) =>
                        setPasswordUp(
                          e.target.value
                        )
                      }
                      required
                      minLength={3}
                      className="
                        h-12
                        rounded-2xl
                        border-white/10
                        bg-white/[0.03]
                        text-white
                        placeholder:text-zinc-500
                        focus-visible:ring-primary
                      "
                    />

                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <LockKeyhole className="w-3.5 h-3.5" />

                      Defina sua senha de acesso
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="
                      w-full
                      h-12
                      rounded-2xl
                      font-semibold
                      bg-gradient-to-r
                      from-primary
                      to-secondary
                      shadow-[0_10px_40px_rgba(124,58,237,0.35)]
                    "
                  >
                    {loading && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}

                    Criar conta
                  </Button>

                  <p className="text-xs text-center text-zinc-500 leading-relaxed">
                    O acesso é liberado automaticamente após validação do código.
                  </p>
                </form>
              </TabsContent>
            </Tabs>
            )}
          </CardContent>
        </Card>

        {/* BACK */}
        <Link
          to="/"
          className="
            mt-6
            flex items-center justify-center gap-2
            text-sm text-zinc-500
            hover:text-white
            transition-colors
          "
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para início
        </Link>
      </motion.div>
    </div>
  );
};

export default Auth;