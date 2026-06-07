import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCompanyAuth } from "@/contexts/CompanyAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, Eye, EyeOff, ShieldAlert } from "lucide-react";

const CompanyLogin = () => {
  const navigate = useNavigate();
  const { company, login } = useCompanyAuth();
  const [codigoAcesso, setCodigoAcesso] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (company) {
    return <Navigate to="/company/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!codigoAcesso.trim()) {
      setError("Por favor, preencha o código de acesso.");
      return;
    }
    if (!senha.trim()) {
      setError("Por favor, preencha a senha.");
      return;
    }

    setLoading(true);
    try {
      await login(codigoAcesso, senha);
      navigate("/company/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Código de acesso ou senha inválidos.");
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

          <CardContent className="relative z-10 p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    setError("");
                  }}
                  placeholder="Ex: GESAD123"
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
                      setError("");
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
              {error && (
                <div className="flex items-center gap-2.5 text-sm text-red-400 bg-red-500/10 border border-red-500/25 rounded-2xl px-4 py-3">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
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
