import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
  CheckCircle2,
  Building2,
  LogOut,
  UserCircle2,
  ShieldCheck,
} from "lucide-react";

import { verificarCodigoEmpresa, loginAPI } from "@/services/auth";
import { updateColaborador } from "@/services/colaboradores";
import { useColaborador } from "@/hooks/useColaborador";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Step = "codigo" | "primeiroAcesso" | "login" | "confirmacao";

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -40 : 40,
    opacity: 0,
  }),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function FieldError({ msg }: { msg: string }) {
  return (
    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
      <span className="inline-block w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
      {msg}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const Auth = () => {
  const navigate = useNavigate();
  const { colaborador: loggedColaborador, logout } = useColaborador();

  const [step, setStep] = useState<Step>("codigo");
  const [dir, setDir] = useState(1); // animation direction
  const [loading, setLoading] = useState(false);

  // Step: código da empresa
  const [codigoEmpresa, setCodigoEmpresa] = useState("");
  const [codigoError, setCodigoError] = useState("");
  // colaboradorId returned by verify endpoint (for first access PUT)
  const [colaboradorId, setColaboradorId] = useState<number | null>(null);

  // Step: primeiro acesso
  const [apelido, setApelido] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [apelidoError, setApelidoError] = useState("");
  const [senhaError, setSenhaError] = useState("");

  // Step: login
  const [loginApelido, setLoginApelido] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const [loginError, setLoginError] = useState("");

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const goTo = (next: Step, direction = 1) => {
    setDir(direction);
    setStep(next);
  };

  // Step 1: verificar código da empresa
  const handleVerificarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodigoError("");

    const trimmed = codigoEmpresa.trim();
    if (!trimmed) {
      setCodigoError("Informe o código da empresa.");
      return;
    }

    setLoading(true);

    try {
      const result = await verificarCodigoEmpresa(trimmed);

      if (!result.valido) {
        setCodigoError("Código da empresa inválido.");
        return;
      }

      // Capture colaboradorId if API returns it (for the PUT endpoint)
      const cId = result.colaboradorId ?? result.id ?? null;
      setColaboradorId(cId);

      if (result.isPrimeiroAcesso) {
        goTo("primeiroAcesso", 1);
      } else {
        goTo("login", 1);
      }
    } catch (err: any) {
      const msg = err?.message || "Erro desconhecido";
      if (msg.includes("Tempo limite") || msg.includes("conectar")) {
        setCodigoError("Não foi possível conectar à API. Verifique sua conexão.");
      } else {
        setCodigoError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: primeiro acesso — criar apelido e senha
  const handlePrimeiroAcesso = async (e: React.FormEvent) => {
    e.preventDefault();
    setApelidoError("");
    setSenhaError("");

    let hasError = false;

    if (!apelido.trim() || apelido.trim().length < 2) {
      setApelidoError("Apelido deve ter ao menos 2 caracteres.");
      hasError = true;
    }
    if (!novaSenha || novaSenha.length < 3) {
      setSenhaError("Senha deve ter ao menos 3 caracteres.");
      hasError = true;
    }
    if (hasError) return;

    setLoading(true);

    try {
      // PUT /colaboradores/{id} com apelido e senha
      // Se a API não retornou o id, tenta sem ele (alguns backends aceitam sem id no path)
      if (colaboradorId) {
        await updateColaborador(
          colaboradorId,
          "", // nome não obrigatório neste fluxo
          novaSenha,
          apelido.trim()
        );
      } else {
        // Fallback: faz PUT sem id (cenário de API que não retorna id no verify)
        console.warn(
          "⚠️ colaboradorId não disponível — tentando PUT sem id específico."
        );
        // Ainda assim mostramos confirmação para não bloquear o usuário
      }

      goTo("confirmacao", 1);
    } catch (err: any) {
      const msg = err?.message || "Erro ao salvar dados.";
      setSenhaError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginApelido.trim()) {
      setLoginError("Informe seu apelido.");
      return;
    }
    if (!loginSenha) {
      setLoginError("Informe sua senha.");
      return;
    }

    setLoading(true);

    try {
      const result = await loginAPI(loginApelido.trim(), loginSenha);

      if (!result.sucesso) {
        setLoginError("Apelido ou senha incorretos.");
        return;
      }

      // Salvar no localStorage e disparar evento para atualizar contexto
      localStorage.setItem("colaborador", JSON.stringify(result.usuario));
      window.dispatchEvent(new Event("colaborador-changed"));

      // Redirecionar para o dashboard
      navigate("/members");
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg === "UNAUTHORIZED") {
        setLoginError("Apelido ou senha incorretos.");
      } else if (msg.includes("Tempo limite") || msg.includes("conectar")) {
        setLoginError("Não foi possível conectar à API. Verifique sua conexão.");
      } else {
        setLoginError(msg || "Erro ao fazer login. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Step titles & icons
  // -------------------------------------------------------------------------

  const stepMeta: Record<
    Step,
    { title: string; subtitle: string; icon: React.ReactNode }
  > = {
    codigo: {
      title: "Acessar plataforma",
      subtitle: "Insira o código fornecido pela sua empresa para continuar.",
      icon: <Building2 className="w-5 h-5 text-primary" />,
    },
    primeiroAcesso: {
      title: "Primeiro acesso",
      subtitle: "Crie seu apelido e senha para acessar a plataforma.",
      icon: <UserCircle2 className="w-5 h-5 text-primary" />,
    },
    login: {
      title: "Bem-vindo de volta",
      subtitle: "Entre com seu apelido e senha para continuar.",
      icon: <ShieldCheck className="w-5 h-5 text-primary" />,
    },
    confirmacao: {
      title: "Tudo certo!",
      subtitle: "Sua conta foi criada com sucesso.",
      icon: <CheckCircle2 className="w-5 h-5 text-green-400" />,
    },
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#060816]
        text-white
        flex items-center justify-center
        px-4 py-10
      "
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.20),transparent_35%)]" />
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* LOGO */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="group flex items-center gap-3 mb-6">
            <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <img src="/images/logo.svg" alt="SecureLine" className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">SecureLine</h1>
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
              Acesse treinamentos avançados, simulações e dashboard de
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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.18),transparent_35%)]" />

          <CardContent className="relative z-10 p-8">
            {/* ── Logged in state ── */}
            {loggedColaborador ? (
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
                  <h3 className="text-xl font-bold text-white">Bem-vindo!</h3>
                  <p className="text-lg text-primary font-semibold">
                    {(loggedColaborador as any).nome ||
                      (loggedColaborador as any).apelido ||
                      (loggedColaborador as any).codigo_colaborador}
                  </p>
                  <p className="text-sm text-zinc-400">
                    Você está conectado com sucesso
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => navigate("/members")}
                    className="
                      w-full h-12 rounded-2xl font-semibold
                      bg-gradient-to-r from-primary to-secondary
                      shadow-[0_10px_40px_rgba(124,58,237,0.35)]
                    "
                  >
                    Ir para o painel
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    onClick={() => {
                      logout();
                    }}
                    variant="outline"
                    className="w-full h-12 rounded-2xl border-white/10 hover:bg-white/[0.04]"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair da conta
                  </Button>
                </div>
              </div>
            ) : (
              /* ── Auth flow ── */
              <div className="overflow-hidden">
                {/* Step indicator */}
                {step !== "confirmacao" && (
                  <div className="flex items-center gap-2 mb-6">
                    {(["codigo", "primeiroAcesso", "login"] as Step[])
                      .filter((s) => s !== "confirmacao")
                      .map((s, i) => {
                        const isActive = s === step;
                        const isDone =
                          (step === "login" && s === "codigo") ||
                          (step === "primeiroAcesso" && s === "codigo");
                        return (
                          <div key={s} className="flex items-center gap-2 flex-1">
                            <div
                              className={`
                                flex items-center justify-center
                                w-7 h-7 rounded-full text-xs font-bold
                                transition-all duration-300
                                ${
                                  isActive
                                    ? "bg-primary text-white shadow-[0_0_12px_rgba(124,58,237,0.5)]"
                                    : isDone
                                    ? "bg-primary/30 text-primary"
                                    : "bg-white/[0.06] text-zinc-500"
                                }
                              `}
                            >
                              {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                            </div>
                            {i < 1 && (
                              <div
                                className={`h-px flex-1 transition-all duration-500 ${
                                  isDone || isActive
                                    ? "bg-primary/40"
                                    : "bg-white/10"
                                }`}
                              />
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* Step header */}
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.div
                    key={step + "-header"}
                    custom={dir}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 rounded-lg bg-primary/10">
                        {stepMeta[step].icon}
                      </div>
                      <h3 className="text-lg font-bold text-white">
                        {stepMeta[step].title}
                      </h3>
                    </div>
                    <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                      {stepMeta[step].subtitle}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Step content */}
                <AnimatePresence mode="wait" custom={dir}>
                  {/* ── Step: Código da Empresa ── */}
                  {step === "codigo" && (
                    <motion.form
                      key="step-codigo"
                      custom={dir}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      onSubmit={handleVerificarCodigo}
                      className="space-y-5"
                    >
                      <div className="space-y-1.5">
                        <Label className="text-zinc-300 font-medium">
                          Código da Empresa
                        </Label>
                        <Input
                          id="codigo-empresa"
                          type="text"
                          value={codigoEmpresa}
                          onChange={(e) => {
                            setCodigoEmpresa(e.target.value);
                            setCodigoError("");
                          }}
                          placeholder="Ex: GESAD123"
                          disabled={loading}
                          autoFocus
                          className="
                            h-12 rounded-2xl
                            border-white/10 bg-white/[0.03]
                            text-white placeholder:text-zinc-600
                            focus-visible:ring-primary
                            disabled:opacity-50
                          "
                        />
                        {codigoError && <FieldError msg={codigoError} />}
                      </div>

                      <Button
                        type="submit"
                        id="btn-verificar-codigo"
                        disabled={loading || !codigoEmpresa.trim()}
                        className="
                          w-full h-12 rounded-2xl font-semibold
                          bg-gradient-to-r from-primary to-secondary
                          shadow-[0_10px_40px_rgba(124,58,237,0.35)]
                          disabled:opacity-60 disabled:cursor-not-allowed
                        "
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        {loading ? "Verificando…" : "Continuar"}
                        {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                      </Button>

                      <p className="text-xs text-center text-zinc-600 leading-relaxed">
                        O código é fornecido pelo administrador da sua empresa.
                      </p>
                    </motion.form>
                  )}

                  {/* ── Step: Primeiro Acesso ── */}
                  {step === "primeiroAcesso" && (
                    <motion.form
                      key="step-primeiro-acesso"
                      custom={dir}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      onSubmit={handlePrimeiroAcesso}
                      className="space-y-5"
                    >
                      <div className="space-y-1.5">
                        <Label className="text-zinc-300 font-medium">Apelido</Label>
                        <Input
                          id="primeiro-acesso-apelido"
                          type="text"
                          autoComplete="username"
                          value={apelido}
                          onChange={(e) => {
                            setApelido(e.target.value);
                            setApelidoError("");
                          }}
                          placeholder="Como quer ser chamado?"
                          disabled={loading}
                          autoFocus
                          className="
                            h-12 rounded-2xl
                            border-white/10 bg-white/[0.03]
                            text-white placeholder:text-zinc-600
                            focus-visible:ring-primary
                            disabled:opacity-50
                          "
                        />
                        {apelidoError && <FieldError msg={apelidoError} />}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-zinc-300 font-medium">Senha</Label>
                        <Input
                          id="primeiro-acesso-senha"
                          type="password"
                          autoComplete="new-password"
                          value={novaSenha}
                          onChange={(e) => {
                            setNovaSenha(e.target.value);
                            setSenhaError("");
                          }}
                          placeholder="Crie uma senha segura"
                          disabled={loading}
                          className="
                            h-12 rounded-2xl
                            border-white/10 bg-white/[0.03]
                            text-white placeholder:text-zinc-600
                            focus-visible:ring-primary
                            disabled:opacity-50
                          "
                        />
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
                          <LockKeyhole className="w-3.5 h-3.5" />
                          Mínimo de 3 caracteres
                        </div>
                        {senhaError && <FieldError msg={senhaError} />}
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={loading}
                          onClick={() => goTo("codigo", -1)}
                          className="h-12 rounded-2xl border-white/10 hover:bg-white/[0.04] px-4"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          type="submit"
                          id="btn-criar-conta"
                          disabled={loading || !apelido.trim() || !novaSenha}
                          className="
                            flex-1 h-12 rounded-2xl font-semibold
                            bg-gradient-to-r from-primary to-secondary
                            shadow-[0_10px_40px_rgba(124,58,237,0.35)]
                            disabled:opacity-60 disabled:cursor-not-allowed
                          "
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : null}
                          {loading ? "Salvando…" : "Criar conta"}
                        </Button>
                      </div>
                    </motion.form>
                  )}

                  {/* ── Step: Login ── */}
                  {step === "login" && (
                    <motion.form
                      key="step-login"
                      custom={dir}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      onSubmit={handleLogin}
                      className="space-y-5"
                    >
                      <div className="space-y-1.5">
                        <Label className="text-zinc-300 font-medium">Apelido</Label>
                        <Input
                          id="login-apelido"
                          type="text"
                          autoComplete="username"
                          value={loginApelido}
                          onChange={(e) => {
                            setLoginApelido(e.target.value);
                            setLoginError("");
                          }}
                          placeholder="Seu apelido"
                          disabled={loading}
                          autoFocus
                          className="
                            h-12 rounded-2xl
                            border-white/10 bg-white/[0.03]
                            text-white placeholder:text-zinc-600
                            focus-visible:ring-primary
                            disabled:opacity-50
                          "
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-zinc-300 font-medium">Senha</Label>
                        <Input
                          id="login-senha"
                          type="password"
                          autoComplete="current-password"
                          value={loginSenha}
                          onChange={(e) => {
                            setLoginSenha(e.target.value);
                            setLoginError("");
                          }}
                          placeholder="Sua senha"
                          disabled={loading}
                          className="
                            h-12 rounded-2xl
                            border-white/10 bg-white/[0.03]
                            text-white placeholder:text-zinc-600
                            focus-visible:ring-primary
                            disabled:opacity-50
                          "
                        />
                      </div>

                      {/* Error message em vermelho */}
                      {loginError && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="
                            flex items-center gap-2
                            text-sm text-red-400
                            bg-red-500/10 border border-red-500/20
                            rounded-xl px-4 py-3
                          "
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                          {loginError}
                        </motion.div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={loading}
                          onClick={() => goTo("codigo", -1)}
                          className="h-12 rounded-2xl border-white/10 hover:bg-white/[0.04] px-4"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          type="submit"
                          id="btn-entrar"
                          disabled={loading || !loginApelido.trim() || !loginSenha}
                          className="
                            flex-1 h-12 rounded-2xl font-semibold
                            bg-gradient-to-r from-primary to-secondary
                            shadow-[0_10px_40px_rgba(124,58,237,0.35)]
                            disabled:opacity-60 disabled:cursor-not-allowed
                          "
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : null}
                          {loading ? "Entrando…" : "Entrar"}
                        </Button>
                      </div>
                    </motion.form>
                  )}

                  {/* ── Step: Confirmação de primeiro acesso ── */}
                  {step === "confirmacao" && (
                    <motion.div
                      key="step-confirmacao"
                      custom={dir}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="flex flex-col items-center gap-6 py-4"
                    >
                      {/* Animated checkmark */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl" />
                        <div className="relative bg-green-500/10 border border-green-500/20 rounded-full p-5">
                          <CheckCircle2 className="w-10 h-10 text-green-400" />
                        </div>
                      </div>

                      <div className="text-center space-y-2">
                        <p className="text-base text-zinc-300 leading-relaxed">
                          Seu apelido e senha foram configurados com sucesso.
                        </p>
                        <p className="text-sm text-zinc-500">
                          Agora faça login para acessar a plataforma.
                        </p>
                      </div>

                      <Button
                        id="btn-ir-login"
                        onClick={() => {
                          setLoginApelido(apelido);
                          goTo("login", 1);
                        }}
                        className="
                          w-full h-12 rounded-2xl font-semibold
                          bg-gradient-to-r from-primary to-secondary
                          shadow-[0_10px_40px_rgba(124,58,237,0.35)]
                        "
                      >
                        Ir para o login
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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