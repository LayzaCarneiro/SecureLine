import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { motion } from "framer-motion";

import MembersLayout from "@/components/members/MembersLayout";

import { fetchTrainingsFromAPI } from "@/services/tiposGolpe";
import type { TrainingFromAPI } from "@/services/tiposGolpe";

import { Button } from "@/components/ui/button";

import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Shield,
  BrainCircuit,
} from "lucide-react";

import { toast } from "@/hooks/use-toast";

const levelStyles: Record<
  string,
  {
    label: string;
    className: string;
    glow: string;
  }
> = {
  iniciante: {
    label: "Iniciante",
    className:
      "bg-emerald-500/10 text-emerald-300 border border-emerald-400/20",

    glow:
      "from-emerald-500/20 to-green-500/10",
  },

  intermediario: {
    label: "Intermediário",
    className:
      "bg-yellow-500/10 text-yellow-300 border border-yellow-400/20",

    glow:
      "from-yellow-500/20 to-orange-500/10",
  },

  avancado: {
    label: "Avançado",
    className:
      "bg-red-500/10 text-red-300 border border-red-400/20",

    glow:
      "from-red-500/20 to-rose-500/10",
  },
};

const TrainingsList = () => {
  const [trainings, setTrainings] =
    useState<TrainingFromAPI[]>([]);

  const [loading, setLoading] =
    useState(true);

  const load = async () => {
    setLoading(true);

    try {
      const data = await fetchTrainingsFromAPI();
      setTrainings(data);
    } catch (error: any) {
      console.error("Erro ao carregar treinamentos:", error);
      toast({
        title: "Erro ao carregar treinamentos",
        description: error?.message || "Não foi possível conectar à API.",
        variant: "destructive",
      });
      setTrainings([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <MembersLayout>
      <div className="space-y-8">
        {/* HERO */}
        <section
          className="
            relative
            overflow-hidden
            rounded-[36px]
            border border-white/10
            bg-[#0B1023]
            p-8 md:p-10
          "
        >
          {/* Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.18),transparent_35%)]" />

          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:48px_48px]" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            <div className="max-w-2xl">
              <div
                className="
                  inline-flex
                  items-center gap-2
                  px-4 py-2
                  rounded-full
                  border border-primary/20
                  bg-primary/10
                  text-primary
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  mb-6
                "
              >
                <Shield className="w-3.5 h-3.5" />
                SecureLine Academy
              </div>

              <h1
                className="
                  text-4xl md:text-5xl
                  font-black
                  tracking-tight
                  leading-[1.05]
                  text-white
                  mb-5
                "
              >
                Treinamentos
                <span
                  className="
                    block
                    text-transparent
                    bg-gradient-to-r
                    from-primary
                    via-violet-400
                    to-secondary
                    bg-clip-text
                  "
                >
                  avançados
                </span>
              </h1>

              <p className="text-zinc-400 text-lg leading-relaxed max-w-xl">
                Simulações realistas,
                engenharia social,
                comportamento humano e
                conscientização digital em
                experiências modernas e
                interativas.
              </p>
            </div>

            {/* SIDE CARD */}
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="
                relative
                w-full max-w-sm
                rounded-[30px]
                border border-white/10
                bg-white/[0.03]
                backdrop-blur-2xl
                p-7
              "
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-zinc-500 mb-1">
                    Disponíveis
                  </p>

                  <h3 className="text-5xl font-black text-white">
                    {
                      trainings.length
                    }
                  </h3>
                </div>

                <div
                  className="
                    w-14 h-14
                    rounded-2xl
                    bg-primary/10
                    border border-primary/20
                    flex items-center justify-center
                  "
                >
                  <BrainCircuit className="w-7 h-7 text-primary" />
                </div>
              </div>

              <div className="space-y-4">

                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="w-[78%] h-full bg-gradient-to-r from-primary to-secondary rounded-full" />
                </div>

                <p className="text-sm text-zinc-400 leading-relaxed">
                  Continue evoluindo suas
                  habilidades contra golpes,
                  phishing e ameaças
                  digitais.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* LOADING */}
        {loading ? (
          <div className="text-center py-20 text-zinc-500">
            Carregando treinamentos...
          </div>
        ) : trainings.length === 0 ? (
          <div
            className="
              relative
              overflow-hidden
              rounded-[32px]
              border border-white/10
              bg-[#0B1023]
              p-14
              text-center
            "
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.15),transparent_40%)]" />

            <div className="relative z-10">
              <div
                className="
                  w-24 h-24
                  mx-auto mb-8
                  rounded-[30px]
                  border border-primary/20
                  bg-primary/10
                  flex items-center justify-center
                "
              >
                <GraduationCap className="w-12 h-12 text-primary" />
              </div>

              <h2 className="text-3xl font-black text-white mb-4">
                Nenhum treinamento disponível
              </h2>

              <p className="text-zinc-400 max-w-lg mx-auto leading-relaxed mb-8">
                Ainda não existem módulos
                cadastrados na plataforma.
              </p>

              <Button
                onClick={load}
                className="
                  h-12 px-6
                  rounded-2xl
                  bg-gradient-to-r
                  from-primary
                  to-secondary
                "
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {trainings.map((t, index) => {
              const style =
                levelStyles[t.level] ||
                levelStyles.iniciante;

              return (
                <motion.div
                  key={t.id}
                  initial={{
                    opacity: 0,
                    y: 30,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.06,
                  }}
                  whileHover={{
                    y: -8,
                  }}
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-[32px]
                    border border-white/10
                    bg-[#0B1023]
                    p-7
                    transition-all duration-500
                    hover:border-primary/20
                    hover:shadow-[0_20px_80px_rgba(124,58,237,0.15)]
                  "
                >
                  {/* Glow */}
                  <div
                    className={`
                      absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                      bg-gradient-to-br ${style.glow}
                    `}
                  />

                  {/* Noise */}
                  <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')]" />

                  <div className="relative z-10 flex flex-col h-full">
                    {/* TOP */}
                    <div className="flex items-start justify-between gap-4 mb-8">
                      <span
                        className={`
                          text-xs
                          px-3 py-1.5
                          rounded-full
                          font-semibold
                          uppercase
                          tracking-wide
                          ${style.className}
                        `}
                      >
                        {style.label}
                      </span>

                      <div className="flex items-center gap-1 text-xs text-zinc-500">
                        {t.content.steps.length}{" "}
                        {t.content.steps.length === 1 ? "cenário" : "cenários"}
                      </div>
                    </div>

                    {/* ICON */}
                    <div
                      className="
                        w-16 h-16
                        rounded-2xl
                        bg-white/[0.03]
                        border border-white/10
                        flex items-center justify-center
                        mb-8
                        transition-all duration-500
                        group-hover:scale-110
                        group-hover:rotate-3
                      "
                    >
                      <GraduationCap className="w-8 h-8 text-primary" />
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1">
                      <p className="text-sm text-primary font-medium mb-3 uppercase tracking-[0.15em]">
                        {t.category}
                      </p>

                      <h3 className="text-2xl font-black text-white leading-tight mb-4">
                        {t.title}
                      </h3>

                      <p className="text-zinc-400 leading-relaxed text-[15px]">
                        {t.description}
                      </p>
                    </div>

                    {/* FOOTER */}
                    <Button
                      asChild
                      className="
                        mt-8
                        h-12
                        rounded-2xl
                        bg-white/[0.04]
                        border border-white/10
                        text-white
                        hover:bg-white/[0.08]
                      "
                    >
                      <Link
                        to={`/members/trainings/${t.id}`}
                      >
                        Iniciar treinamento

                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </MembersLayout>
  );
};

export default TrainingsList;