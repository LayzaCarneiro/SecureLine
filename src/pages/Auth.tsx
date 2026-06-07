import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
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
  Eye,
  EyeOff,
} from "lucide-react";

import { verificarCodigoEmpresa, loginAPI } from "@/services/auth";
import { updateColaborador } from "@/services/colaboradores";
import { useColaborador } from "@/hooks/useColaborador";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ActiveTab = "login" | "cadastro";

// Cadastro sub-steps
type CadastroStep = "codigo" | "configurar" | "sucesso";

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const fadeSlide = {
  enter: (dir: number) => ({ x: dir > 0 ? 32 : -32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -32 : 32, opacity: 0 }),
};

const tabContent = {
  enter: (dir: number) => ({ x: dir > 0 ? 24 : -24, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -24 : 24, opacity: 0 }),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function FieldError({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-xs text-red-400 mt-1.5 flex items-center gap-1.5"
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
      {msg}
    </motion.p>
  );
}

function AlertError({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2.5 text-sm text-red-400 bg-red-500/10 border border-red-500/25 rounded-2xl px-4 py-3"
    >
      <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
      {msg}
    </motion.div>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  disabled,
  autoComplete,
  autoFocus,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className="
          h-12 pr-11 rounded-2xl
          border-white/10 bg-white/[0.03]
          text-white placeholder:text-zinc-600
          focus-visible:ring-primary
          disabled:opacity-50
        "
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const Auth = () => {
  const navigate = useNavigate();
  const { colaborador: loggedColaborador, logout } = useColaborador();

  const [activeTab, setActiveTab] = useState<ActiveTab>("login");
  const [tabDir, setTabDir] = useState(1);
  const [loading, setLoading] = useState(false);

  // ── LOGIN state ──
  const [loginApelido, setLoginApelido] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const [loginError, setLoginError] = useState("");

  // ── CADASTRO state ──
  const [cadastroStep, setCadastroStep] = useState<CadastroStep>("codigo");
  const [cadastroDir, setCadastroDir] = useState(1);
  const [codigoEmpresa, setCodigoEmpresa] = useState("");
  const [codigoError, setCodigoError] = useState("");
  const [colaboradorId, setColaboradorId] = useState<number | null>(null);
  const [apelido, setApelido] = useState("");
  const [apelidoError, setApelidoError] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [senhaError, setSenhaError] = useState("");

  // ── Tab switch ──
  const switchTab = (tab: ActiveTab) => {
    if (tab === activeTab) return;
    setTabDir(tab === "login" ? -1 : 1);
    setActiveTab(tab);
    // Reset errors on switch
    setLoginError("");
    setCodigoError("");
    setApelidoError("");
    setSenhaError("");
  };

  const goCadastro = (step: CadastroStep, dir = 1) => {
    setCadastroDir(dir);
    setCadastroStep(step);
  };

  // ── Handlers ──

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

      localStorage.setItem("colaborador", JSON.stringify(result.usuario));
      window.dispatchEvent(new Event("colaborador-changed"));
      navigate("/members");
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg === "UNAUTHORIZED") {
        setLoginError("Apelido ou senha incorretos.");
      } else if (msg.includes("Tempo limite") || msg.includes("conectar")) {
        setLoginError("Sem conexão com a API. Verifique sua internet.");
      } else {
        setLoginError(msg || "Erro ao fazer login. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

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

      const cId = result.colaboradorId ?? result.id ?? null;
      setColaboradorId(cId);

      if (result.isPrimeiroAcesso) {
        goCadastro("configurar", 1);
      } else {
        // Já tem conta — manda para login com dica
        setLoginApelido("");
        switchTab("login");
        setLoginError("Este código já foi ativado. Faça login com seu apelido e senha.");
      }
    } catch (err: any) {
      const msg = err?.message || "Erro desconhecido";
      setCodigoError(
        msg.includes("Tempo limite") || msg.includes("conectar")
          ? "Não foi possível conectar à API. Verifique sua conexão."
          : msg
      );
    } finally {
      setLoading(false);
    }
  };

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
      if (colaboradorId) {
        await updateColaborador(colaboradorId, null, novaSenha, apelido.trim());
      } else {
        console.warn("⚠️ colaboradorId não disponível — etapa de configuração ignorada.");
      }
      goCadastro("sucesso", 1);
    } catch (err: any) {
      setSenhaError(err?.message || "Erro ao salvar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render: logged in state — redireciona de forma síncrona, sem useEffect
  // ---------------------------------------------------------------------------
  if (loggedColaborador) {
    return <Navigate to="/members" replace />;
  }

  // ---------------------------------------------------------------------------
  // Render: auth flow
  // ---------------------------------------------------------------------------
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060816] text-white flex items-center justify-center px-4 py-10">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.20),transparent_35%)]" />
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px]" />
      {/* Extra subtle orbs */}
      <div className="absolute bottom-[-60px] right-[10%] w-[300px] h-[300px] rounded-full bg-secondary/10 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* LOGO */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="group flex items-center gap-3 mb-5">
            <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              <img src="/images/logo.svg" alt="SecureLine" className="w-12 h-12 relative" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight leading-none">SecureLine</h1>
              <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mt-0.5">
                Security Awareness
              </p>
            </div>
          </Link>

          <div className="text-center">
            <h2 className="text-3xl font-black tracking-tight mb-2 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Área de membros
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              Treinamentos, simulações e dashboard de conscientização digital.
            </p>
          </div>
        </div>

        {/* CARD */}
        <Card className="relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-white/[0.035] backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
          {/* Inner glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.15),transparent_40%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <CardContent className="relative z-10 p-0">
            {/* ── TAB SWITCHER ── */}
            <div className="px-6 pt-6 pb-0">
              <div className="relative flex h-12 rounded-2xl bg-white/[0.04] border border-white/[0.07] p-1 gap-1">
                {/* Sliding pill */}
                <motion.div
                  layoutId="tab-pill"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  className={`
                    absolute top-1 bottom-1 rounded-[14px]
                    bg-gradient-to-r from-primary to-secondary
                    shadow-[0_4px_20px_rgba(124,58,237,0.4)]
                    ${activeTab === "login" ? "left-1 right-[calc(50%+2px)]" : "left-[calc(50%+2px)] right-1"}
                  `}
                />

                {(["login", "cadastro"] as ActiveTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => switchTab(tab)}
                    id={`tab-${tab}`}
                    className={`
                      relative z-10 flex-1 text-sm font-semibold rounded-[14px]
                      transition-colors duration-200
                      ${activeTab === tab ? "text-white" : "text-zinc-500 hover:text-zinc-300"}
                    `}
                  >
                    {tab === "login" ? "Entrar" : "Criar conta"}
                  </button>
                ))}
              </div>
            </div>

            {/* ── TAB CONTENT ── */}
            <div className="overflow-hidden">
              <AnimatePresence mode="wait" custom={tabDir}>
                {/* ══════════════ LOGIN TAB ══════════════ */}
                {activeTab === "login" && (
                  <motion.div
                    key="tab-login"
                    custom={tabDir}
                    variants={tabContent}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                  >
                    <form onSubmit={handleLogin} className="px-6 py-6 space-y-5">
                      {/* Title */}
                      <div className="mb-1">
                        <h3 className="text-lg font-bold text-white">Bem-vindo de volta</h3>
                        <p className="text-sm text-zinc-500 mt-0.5">
                          Entre com seu apelido e senha para continuar.
                        </p>
                      </div>

                      {/* Apelido */}
                      <div className="space-y-1.5">
                        <Label htmlFor="login-apelido" className="text-zinc-300 font-medium text-sm">
                          Apelido
                        </Label>
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
                          className="
                            h-12 rounded-2xl
                            border-white/10 bg-white/[0.03]
                            text-white placeholder:text-zinc-600
                            focus-visible:ring-primary
                            disabled:opacity-50
                          "
                        />
                      </div>

                      {/* Senha */}
                      <div className="space-y-1.5">
                        <Label htmlFor="login-senha" className="text-zinc-300 font-medium text-sm">
                          Senha
                        </Label>
                        <PasswordInput
                          id="login-senha"
                          value={loginSenha}
                          onChange={(v) => {
                            setLoginSenha(v);
                            setLoginError("");
                          }}
                          placeholder="Sua senha"
                          disabled={loading}
                          autoComplete="current-password"
                        />
                      </div>

                      {/* Erro de login em vermelho */}
                      <AlertError msg={loginError} />

                      <Button
                        type="submit"
                        id="btn-entrar"
                        disabled={loading || !loginApelido.trim() || !loginSenha}
                        className="
                          w-full h-12 rounded-2xl font-semibold
                          bg-gradient-to-r from-primary to-secondary
                          shadow-[0_8px_32px_rgba(124,58,237,0.35)]
                          hover:shadow-[0_8px_40px_rgba(124,58,237,0.5)]
                          transition-shadow duration-300
                          disabled:opacity-50 disabled:cursor-not-allowed
                        "
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        {loading ? "Entrando…" : "Entrar"}
                      </Button>

                      {/* Link para cadastro */}
                      <p className="text-center text-sm text-zinc-500">
                        Primeiro acesso?{" "}
                        <button
                          type="button"
                          onClick={() => switchTab("cadastro")}
                          className="text-primary hover:text-primary/80 font-medium transition-colors"
                        >
                          Criar conta
                        </button>
                      </p>
                    </form>
                  </motion.div>
                )}

                {/* ══════════════ CADASTRO TAB ══════════════ */}
                {activeTab === "cadastro" && (
                  <motion.div
                    key="tab-cadastro"
                    custom={tabDir}
                    variants={tabContent}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                  >
                    <div className="px-6 py-6">
                      {/* Progress dots */}
                      {cadastroStep !== "sucesso" && (
                        <div className="flex items-center gap-2 mb-5">
                          {(["codigo", "configurar"] as CadastroStep[]).map((s, i) => {
                            const isActive = s === cadastroStep;
                            const isDone =
                              cadastroStep === "configurar" && s === "codigo";
                            return (
                              <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
                                <div
                                  className={`
                                    w-7 h-7 rounded-full flex items-center justify-center
                                    text-xs font-bold transition-all duration-300
                                    ${isActive
                                      ? "bg-primary text-white shadow-[0_0_14px_rgba(124,58,237,0.55)]"
                                      : isDone
                                      ? "bg-primary/25 text-primary border border-primary/40"
                                      : "bg-white/[0.06] text-zinc-500"
                                    }
                                  `}
                                >
                                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                                </div>
                                {i === 0 && (
                                  <div className={`flex-1 h-px transition-all duration-500 ${isDone ? "bg-primary/40" : "bg-white/[0.08]"}`} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* ── Sub-step: Código da Empresa ── */}
                      <AnimatePresence mode="wait" custom={cadastroDir}>
                        {cadastroStep === "codigo" && (
                          <motion.form
                            key="cad-codigo"
                            custom={cadastroDir}
                            variants={fadeSlide}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            onSubmit={handleVerificarCodigo}
                            className="space-y-5"
                          >
                            <div>
                              <h3 className="text-lg font-bold text-white">Verificar empresa</h3>
                              <p className="text-sm text-zinc-500 mt-0.5">
                                Insira o código fornecido pela sua empresa.
                              </p>
                            </div>

                            <div className="space-y-1.5">
                              <Label
                                htmlFor="codigo-empresa"
                                className="text-zinc-300 font-medium text-sm"
                              >
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
                                placeholder="Ex: CODIGO123"
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
                              <FieldError msg={codigoError} />
                            </div>

                            <Button
                              type="submit"
                              id="btn-verificar-codigo"
                              disabled={loading || !codigoEmpresa.trim()}
                              className="
                                w-full h-12 rounded-2xl font-semibold
                                bg-gradient-to-r from-primary to-secondary
                                shadow-[0_8px_32px_rgba(124,58,237,0.35)]
                                hover:shadow-[0_8px_40px_rgba(124,58,237,0.5)]
                                transition-shadow duration-300
                                disabled:opacity-50 disabled:cursor-not-allowed
                              "
                            >
                              {loading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : null}
                              {loading ? "Verificando…" : "Continuar"}
                              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                            </Button>

                            <p className="text-center text-sm text-zinc-500">
                              Já tem conta?{" "}
                              <button
                                type="button"
                                onClick={() => switchTab("login")}
                                className="text-primary hover:text-primary/80 font-medium transition-colors"
                              >
                                Entrar
                              </button>
                            </p>
                          </motion.form>
                        )}

                        {/* ── Sub-step: Configurar apelido e senha ── */}
                        {cadastroStep === "configurar" && (
                          <motion.form
                            key="cad-configurar"
                            custom={cadastroDir}
                            variants={fadeSlide}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            onSubmit={handlePrimeiroAcesso}
                            className="space-y-5"
                          >
                            <div>
                              <h3 className="text-lg font-bold text-white">Criar seu perfil</h3>
                              <p className="text-sm text-zinc-500 mt-0.5">
                                Escolha um apelido e crie sua senha de acesso.
                              </p>
                            </div>

                            {/* Apelido */}
                            <div className="space-y-1.5">
                              <Label
                                htmlFor="cad-apelido"
                                className="text-zinc-300 font-medium text-sm"
                              >
                                Apelido
                              </Label>
                              <Input
                                id="cad-apelido"
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
                              <FieldError msg={apelidoError} />
                            </div>

                            {/* Senha */}
                            <div className="space-y-1.5">
                              <Label
                                htmlFor="cad-senha"
                                className="text-zinc-300 font-medium text-sm"
                              >
                                Senha
                              </Label>
                              <PasswordInput
                                id="cad-senha"
                                value={novaSenha}
                                onChange={(v) => {
                                  setNovaSenha(v);
                                  setSenhaError("");
                                }}
                                placeholder="Crie uma senha segura"
                                disabled={loading}
                                autoComplete="new-password"
                              />
                              <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-600">
                                <LockKeyhole className="w-3 h-3" />
                                Mínimo de 3 caracteres
                              </div>
                              <FieldError msg={senhaError} />
                            </div>

                            <div className="flex gap-3">
                              <Button
                                type="button"
                                variant="outline"
                                disabled={loading}
                                onClick={() => goCadastro("codigo", -1)}
                                className="h-12 px-4 rounded-2xl border-white/10 hover:bg-white/[0.04]"
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
                                  shadow-[0_8px_32px_rgba(124,58,237,0.35)]
                                  disabled:opacity-50 disabled:cursor-not-allowed
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

                        {/* ── Sub-step: Sucesso ── */}
                        {cadastroStep === "sucesso" && (
                          <motion.div
                            key="cad-sucesso"
                            custom={cadastroDir}
                            variants={fadeSlide}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="flex flex-col items-center gap-5 py-4"
                          >
                            <div className="relative">
                              <div className="absolute inset-0 bg-green-400/25 rounded-full blur-2xl" />
                              <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 280, damping: 18 }}
                                className="relative bg-green-500/10 border border-green-500/25 rounded-full p-5"
                              >
                                <CheckCircle2 className="w-10 h-10 text-green-400" />
                              </motion.div>
                            </div>

                            <div className="text-center space-y-1.5">
                              <h3 className="text-lg font-bold text-white">Conta criada!</h3>
                              <p className="text-sm text-zinc-400 leading-relaxed">
                                Seu apelido e senha foram configurados com sucesso.
                                <br />
                                Agora faça login para acessar a plataforma.
                              </p>
                            </div>

                            <Button
                              id="btn-ir-login"
                              onClick={() => {
                                setLoginApelido(apelido);
                                switchTab("login");
                              }}
                              className="
                                w-full h-12 rounded-2xl font-semibold
                                bg-gradient-to-r from-primary to-secondary
                                shadow-[0_8px_32px_rgba(124,58,237,0.35)]
                              "
                            >
                              Ir para o login
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* BACK */}
        <Link
          to="/"
          className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-600 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para início
        </Link>
      </motion.div>
    </div>
  );
};

export default Auth;