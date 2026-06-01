import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { motion } from "framer-motion";

import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { toast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, LockKeyhole } from "lucide-react";

const signInSchema = z.object({
  codigo: z.string().trim().min(2, "Informe o código"),
  senha: z.string().min(1, "Informe a senha"),
});

const signUpSchema = z.object({
  nome: z.string().trim().min(2, "Nome muito curto").max(100),
  codigo: z.string().trim().min(2, "Código inválido").max(100),
  senha: z.string().min(4, "Mínimo 4 caracteres").max(72),
  setor: z.string().trim().max(60).optional(),
  telefone: z.string().trim().max(20).optional(),
});

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);

  // SIGN IN
  const [codigoIn, setCodigoIn] = useState("");
  const [senhaIn, setSenhaIn] = useState("");

  // SIGN UP
  const [nome, setNome] = useState("");
  const [codigoUp, setCodigoUp] = useState("");
  const [senhaUp, setSenhaUp] = useState("");
  const [setor, setSetor] = useState("");
  const [telefone, setTelefone] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signInSchema.safeParse({ codigo: codigoIn, senha: senhaIn });
    if (!parsed.success) {
      toast({
        title: "Dados inválidos",
        description: parsed.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      await signIn(parsed.data.codigo, parsed.data.senha);
      navigate("/members");
    } catch (err) {
      toast({
        title: "Falha ao entrar",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signUpSchema.safeParse({
      nome,
      codigo: codigoUp,
      senha: senhaUp,
      setor: setor || undefined,
      telefone: telefone || undefined,
    });
    if (!parsed.success) {
      toast({
        title: "Dados inválidos",
        description: parsed.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      await signUp({
        nome: parsed.data.nome,
        codigo_colaborador: parsed.data.codigo,
        senha: parsed.data.senha,
        setor: parsed.data.setor,
        telefone: parsed.data.telefone,
      });
      toast({ title: "Conta criada!", description: "Seu acesso foi liberado." });
      navigate("/members");
    } catch (err) {
      toast({
        title: "Erro no cadastro",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    "h-12 rounded-2xl border-white/10 bg-white/[0.03] text-white placeholder:text-zinc-500 focus-visible:ring-primary";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060816] text-white flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.20),transparent_35%)]" />
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="group flex items-center gap-3 mb-6">
            <img src="/images/logo.svg" alt="SecureLine" className="w-12 h-12" />
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
              Acesse com seu código de colaborador.
            </p>
          </div>
        </div>

        <Card className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.18),transparent_35%)]" />

          <CardContent className="relative z-10 p-8">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid grid-cols-2 h-12 rounded-2xl bg-white/[0.04] border border-white/10 p-1">
                <TabsTrigger
                  value="signin"
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white"
                >
                  Entrar
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white"
                >
                  Criar conta
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-5 mt-6">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Código do colaborador</Label>
                    <Input
                      value={codigoIn}
                      onChange={(e) => setCodigoIn(e.target.value)}
                      required
                      placeholder="EMP-XXXXXXXX"
                      className={fieldClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Senha</Label>
                    <Input
                      type="password"
                      value={senhaIn}
                      onChange={(e) => setSenhaIn(e.target.value)}
                      required
                      className={fieldClass}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-2xl font-semibold bg-gradient-to-r from-primary to-secondary shadow-[0_10px_40px_rgba(124,58,237,0.35)]"
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Entrar
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-5 mt-6">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Nome completo</Label>
                    <Input
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                      className={fieldClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Código do colaborador</Label>
                    <Input
                      value={codigoUp}
                      onChange={(e) => setCodigoUp(e.target.value)}
                      required
                      placeholder="EMP-XXXXXXXX"
                      className={fieldClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Setor</Label>
                    <Input
                      value={setor}
                      onChange={(e) => setSetor(e.target.value)}
                      placeholder="Geral"
                      className={fieldClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Telefone (opcional)</Label>
                    <Input
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="5585999999999"
                      className={fieldClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Senha</Label>
                    <Input
                      type="password"
                      value={senhaUp}
                      onChange={(e) => setSenhaUp(e.target.value)}
                      required
                      minLength={4}
                      className={fieldClass}
                    />
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <LockKeyhole className="w-3.5 h-3.5" />
                      Mínimo de 4 caracteres
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-2xl font-semibold bg-gradient-to-r from-primary to-secondary shadow-[0_10px_40px_rgba(124,58,237,0.35)]"
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Criar conta
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Link
          to="/"
          className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para início
        </Link>
      </motion.div>
    </div>
  );
};

export default Auth;
