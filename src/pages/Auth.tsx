import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

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
} from "lucide-react";

const MEMBER_CODE = "SecureL1n&";
const ADMIN_CODE = "AdminSecureL1n&";

const signUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Nome muito curto")
    .max(100),

  email: z
    .string()
    .trim()
    .email("E-mail inválido")
    .max(255),

  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .max(72),

  accessCode: z
    .string()
    .min(3, "Código inválido"),
});

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email("E-mail inválido")
    .max(255),

  password: z
    .string()
    .min(1, "Informe a senha")
    .max(72),
});

const Auth = () => {
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(false);

  // SIGN UP
  const [name, setName] = useState("");
  const [emailUp, setEmailUp] = useState("");
  const [passwordUp, setPasswordUp] = useState("");
  const [accessCode, setAccessCode] = useState("");

  // SIGN IN
  const [emailIn, setEmailIn] = useState("");
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

    const role =
      normalizedCode === ADMIN_CODE
        ? "admin"
        : normalizedCode === MEMBER_CODE
        ? "subscriber"
        : null;

    setLoading(true);

    if (!role) {
      setLoading(false);

      toast({
        title: "Código inválido",
        description:
          "O código de acesso informado é inválido.",
        variant: "destructive",
      });

      return;
    }

    const { error } =
      await supabase.auth.signUp({
        email: parsed.data.email,

        password: parsed.data.password,

        options: {
          emailRedirectTo: `${window.location.origin}/members`,

          data: {
            full_name: parsed.data.fullName,
            role,
          },
        },
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });

      return;
    }

    toast({
      title: "Conta criada!",
      description:
        role === "admin"
          ? "Acesso administrativo liberado."
          : "Seu acesso foi liberado com sucesso.",
    });

    navigate("/members");
  };

  const handleSignIn = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const parsed =
      signInSchema.safeParse({
        email: emailIn,
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

    const { error } =
      await supabase.auth.signInWithPassword(
        {
          email: parsed.data.email,
          password: parsed.data.password,
        }
      );

    setLoading(false);

    if (error) {
      toast({
        title: "Falha ao entrar",
        description: error.message,
        variant: "destructive",
      });

      return;
    }

    navigate("/members");
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
                      E-mail
                    </Label>

                    <Input
                      type="email"
                      value={emailIn}
                      onChange={(e) =>
                        setEmailIn(
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
                      type="email"
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
                      minLength={8}
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

                      Mínimo de 8 caracteres
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