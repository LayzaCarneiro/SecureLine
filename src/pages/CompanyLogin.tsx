import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCompanyAuth } from "@/contexts/CompanyAuthContext";
import { getCompanies, updateCompanyPassword } from "@/services/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldAlert,
  CheckCircle2,
  LockKeyhole,
} from "lucide-react";

type ActiveTab = "login" | "cadastro";
type CadastroStep = "codigo" | "configurar" | "sucesso";

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

const CompanyLogin = () => {
  const navigate = useNavigate();
  const { company, login } = useCompanyAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>("login");
  const [tabDir, setTabDir] = useState(1);
  const [loading, setLoading] = useState(false);

  // LOGIN state
  const [codigoAcesso, setCodigoAcesso] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [loginError, setLoginError] = useState("");

  // CADASTRO/PRIMEIRO ACESSO state
  const [cadastroStep, setCadastroStep] = useState<CadastroStep>("codigo");
  const [cadastroDir, setCadastroDir] = useState(1);
  const [codigoAcessoCadastro, setCodigoAcessoCadastro] = useState("");
  const [codigoError, setCodigoError] = useState("");
  const [companyIdToUpdate, setCompanyIdToUpdate] = useState<number | null>(null);
  const [novaSenha, setNovaSenha] = useState("");
  const [senhaError, setSenhaError] = useState("");
  const [showNovaSenha, setShowNovaSenha] = useState(false);

  if (company) {
    return <Navigate to="/company/dashboard" replace />;
  }

  const switchTab = (tab: ActiveTab) => {
    if (tab === activeTab) return;
    setTabDir(tab === "login" ? -1 : 1);
    setActiveTab(tab);
    setLoginError("");
    setCodigoError("");
    setSenhaError("");
  };

  const goCadastro = (step: CadastroStep, dir = 1) => {
    setCadastroDir(dir);
    setCadastroStep(step);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!codigoAcesso.trim()) {
      setLoginError("Por favor, preencha o código de acesso.");
      return;
    }
    if (!senha.trim()) {
      setLoginError("Por favor, preencha a senha.");
      return;
    }

    setLoading(true);
    try {
      await login(codigoAcesso, senha);
      navigate("/company/dashboard");
    } catch (err: any) {
      console.error(err);
      setLoginError(err?.message || "Código de acesso ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodigoError("");

    const trimmed = codigoAcessoCadastro.trim();
    if (!trimmed) {
      setCodigoError("Por favor, preencha o código de acesso da empresa.");
      return;
    }

    setLoading(true);
    try {
      const companies = await getCompanies();
      const found = companies.find(
        (c) => c.codigo_acesso.trim().toUpperCase() === trimmed.toUpperCase()
      );

      if (!found) {
        setCodigoError("Código de acesso inválido ou empresa não cadastrada.");
        return;
      }

      setCompanyIdToUpdate(found.id);
      goCadastro("configurar", 1);
    } catch (err: any) {
      console.error(err);
      setCodigoError("Erro ao buscar empresas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDefinirSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setSenhaError("");

    if (!novaSenha || novaSenha.length < 3) {
      setSenhaError("A senha deve ter ao menos 3 caracteres.");
      return;
    }

    if (companyIdToUpdate === null) {
      setSenhaError("ID da empresa inválido. Recomece o processo.");
      return;
    }

    setLoading(true);
    try {
      await updateCompanyPassword(companyIdToUpdate, novaSenha);
      goCadastro("sucesso", 1);
    } catch (err: any) {
      console.error(err);
      setSenhaError(err?.message || "Erro ao definir senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060816] text-white flex items-center justify-center px-4 py-10">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.20),transparent_35%)]" />
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px]" />
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
              Painel da Empresa
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mx-auto">
              Monitore o progresso e o nível de vulnerabilidade dos seus colaboradores.
            </p>
          </div>
        </div>

        {/* CARD */}
        <Card className="relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-white/[0.035] backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.15),transparent_40%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <CardContent className="relative z-10 p-0">
            {/* TAB SWITCHER */}
            <div className="px-6 pt-6 pb-0">
              <div className="relative flex h-12 rounded-2xl bg-white/[0.04] border border-white/[0.07] p-1 gap-1">
                {/* Sliding pill */}
                <motion.div
                  layoutId="company-tab-pill"
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
                    className={`
                      relative z-10 flex-1 text-sm font-semibold rounded-[14px]
                      transition-colors duration-200
                      ${activeTab === tab ? "text-white" : "text-zinc-500 hover:text-zinc-300"}
                    `}
                  >
                    {tab === "login" ? "Entrar" : "Primeiro Acesso"}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB CONTENT */}
            <div className="overflow-hidden">
              <AnimatePresence mode="wait" custom={tabDir}>
                {/* LOGIN TAB */}
                {activeTab === "login" && (
                  <motion.div
                    key="company-tab-login"
                    custom={tabDir}
                    variants={tabContent}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                  >
                    <form onSubmit={handleLogin} className="px-6 py-6 space-y-5">
                      <div>
                        <h3 className="text-lg font-bold text-white">Acesse sua empresa</h3>
                        <p className="text-sm text-zinc-500 mt-0.5">
                          Entre com o código de acesso e senha da sua empresa.
                        </p>
                      </div>

                      {/* Código de Acesso */}
                      <div className="space-y-1.5">
                        <Label htmlFor="codigo" className="text-zinc-300 font-medium text-sm">
                          Código de Acesso
                        </Label>
                        <Input
                          id="codigo"
                          type="text"
                          value={codigoAcesso}
                          onChange={(e) => {
                            setCodigoAcesso(e.target.value);
                            setLoginError("");
                          }}
                          placeholder="Ex: CODIGO123"
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
                        <Label htmlFor="senha" className="text-zinc-300 font-medium text-sm">
                          Senha
                        </Label>
                        <div className="relative">
                          <Input
                            id="senha"
                            type={showSenha ? "text" : "password"}
                            value={senha}
                            onChange={(e) => {
                              setSenha(e.target.value);
                              setLoginError("");
                            }}
                            placeholder="Sua senha"
                            disabled={loading}
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
                            onClick={() => setShowSenha((s) => !s)}
                            tabIndex={-1}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                          >
                            {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Error message */}
                      {loginError && (
                        <div className="flex items-center gap-2.5 text-sm text-red-400 bg-red-500/10 border border-red-500/25 rounded-2xl px-4 py-3">
                          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                          <span>{loginError}</span>
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={loading}
                        className="
                          w-full h-12 rounded-2xl font-semibold
                          bg-gradient-to-r from-primary to-secondary
                          shadow-[0_8px_32px_rgba(124,58,237,0.35)]
                          hover:shadow-[0_8px_40px_rgba(124,58,237,0.5)]
                          transition-shadow duration-300
                          disabled:opacity-50 disabled:cursor-not-allowed
                        "
                      >
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {loading ? "Entrando..." : "Entrar"}
                      </Button>
                    </form>
                  </motion.div>
                )}

                {/* CADASTRO / PRIMEIRO ACESSO TAB */}
                {activeTab === "cadastro" && (
                  <motion.div
                    key="company-tab-cadastro"
                    custom={tabDir}
                    variants={tabContent}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                  >
                    <div className="px-6 py-6">
                      {cadastroStep !== "sucesso" && (
                        <div className="flex items-center gap-2 mb-5">
                          {(["codigo", "configurar"] as CadastroStep[]).map((s, i) => {
                            const isActive = s === cadastroStep;
                            const isDone = cadastroStep === "configurar" && s === "codigo";
                            return (
                              <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
                                <div
                                  className={`
                                    w-7 h-7 rounded-full flex items-center justify-center
                                    text-xs font-bold transition-all duration-300
                                    ${
                                      isActive
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
                                  <div
                                    className={`flex-1 h-px transition-all duration-500 ${
                                      isDone ? "bg-primary/40" : "bg-white/[0.08]"
                                    }`}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <AnimatePresence mode="wait" custom={cadastroDir}>
                        {/* Passo 1: Verificar Código */}
                        {cadastroStep === "codigo" && (
                          <motion.form
                            key="comp-cad-codigo"
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
                                Insira o código de acesso fornecido para sua empresa.
                              </p>
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="codigo-cad" className="text-zinc-300 font-medium text-sm">
                                Código de Acesso da Empresa
                              </Label>
                              <Input
                                id="codigo-cad"
                                type="text"
                                value={codigoAcessoCadastro}
                                onChange={(e) => {
                                  setCodigoAcessoCadastro(e.target.value);
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
                              {codigoError && (
                                <p className="text-xs text-red-400 mt-1 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                  {codigoError}
                                </p>
                              )}
                            </div>

                            <Button
                              type="submit"
                              disabled={loading || !codigoAcessoCadastro.trim()}
                              className="
                                w-full h-12 rounded-2xl font-semibold
                                bg-gradient-to-r from-primary to-secondary
                                shadow-[0_8px_32px_rgba(124,58,237,0.35)]
                                hover:shadow-[0_8px_40px_rgba(124,58,237,0.5)]
                                transition-shadow duration-300
                                disabled:opacity-50 disabled:cursor-not-allowed
                              "
                            >
                              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                              Continuar
                              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                            </Button>
                          </motion.form>
                        )}

                        {/* Passo 2: Definir Senha */}
                        {cadastroStep === "configurar" && (
                          <motion.form
                            key="comp-cad-configurar"
                            custom={cadastroDir}
                            variants={fadeSlide}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            onSubmit={handleDefinirSenha}
                            className="space-y-5"
                          >
                            <div>
                              <h3 className="text-lg font-bold text-white">Definir senha de acesso</h3>
                              <p className="text-sm text-zinc-500 mt-0.5">
                                Defina a senha para o login administrativo da empresa.
                              </p>
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="nova-senha" className="text-zinc-300 font-medium text-sm">
                                Nova Senha
                              </Label>
                              <div className="relative">
                                <Input
                                  id="nova-senha"
                                  type={showNovaSenha ? "text" : "password"}
                                  value={novaSenha}
                                  onChange={(e) => {
                                    setNovaSenha(e.target.value);
                                    setSenhaError("");
                                  }}
                                  placeholder="Crie uma senha de acesso"
                                  disabled={loading}
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
                                  onClick={() => setShowNovaSenha((s) => !s)}
                                  tabIndex={-1}
                                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                  {showNovaSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                              <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-600">
                                <LockKeyhole className="w-3 h-3" />
                                Mínimo de 3 caracteres
                              </div>
                              {senhaError && (
                                <p className="text-xs text-red-400 mt-1 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                  {senhaError}
                                </p>
                              )}
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
                                disabled={loading || !novaSenha}
                                className="
                                  flex-1 h-12 rounded-2xl font-semibold
                                  bg-gradient-to-r from-primary to-secondary
                                  shadow-[0_8px_32px_rgba(124,58,237,0.35)]
                                  disabled:opacity-50 disabled:cursor-not-allowed
                                "
                              >
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Salvar Senha
                              </Button>
                            </div>
                          </motion.form>
                        )}

                        {/* Passo 3: Sucesso */}
                        {cadastroStep === "sucesso" && (
                          <motion.div
                            key="comp-cad-sucesso"
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
                              <h3 className="text-lg font-bold text-white">Senha configurada!</h3>
                              <p className="text-sm text-zinc-400 leading-relaxed">
                                A senha da empresa foi salva com sucesso.
                                <br />
                                Agora faça login para gerenciar seus colaboradores.
                              </p>
                            </div>

                            <Button
                              onClick={() => {
                                setCodigoAcesso(codigoAcessoCadastro);
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

        {/* Back link */}
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

export default CompanyLogin;
