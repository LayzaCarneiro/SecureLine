import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { motion } from "framer-motion";

import MembersLayout from "@/components/members/MembersLayout";

import { useAuth } from "@/hooks/useAuth";

import { supabase } from "@/integrations/supabase/client";

import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Progress } from "@/components/ui/progress";

import {
  Award,
  TrendingUp,
  Target,
  Clock,
  ArrowRight,
  Shield,
  Activity,
} from "lucide-react";

interface Attempt {
  id: string;
  training_id: string;
  score: number;
  total: number;
  percentage: number;
  completed_at: string;
}

const MembersDashboard = () => {
  const { user } = useAuth();

  const [attempts, setAttempts] = useState<
    Attempt[]
  >([]);

  const [trainingTitles, setTrainingTitles] =
    useState<Record<string, string>>({});

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (!user) return;

    (async () => {
      const { data: atts } =
        await supabase
          .from("training_attempts")
          .select("*")
          .order("completed_at", {
            ascending: false,
          });

      setAttempts(
        (atts as Attempt[]) ?? []
      );

      if (atts && atts.length > 0) {
        const ids = [
          ...new Set(
            atts.map((a) => a.training_id)
          ),
        ];

        const { data: trainings } =
          await supabase
            .from("advanced_trainings")
            .select("id, title")
            .in("id", ids);

        setTrainingTitles(
          Object.fromEntries(
            (trainings ?? []).map((t) => [
              t.id,
              t.title,
            ])
          )
        );
      }

      setLoading(false);
    })();
  }, [user]);

  const totalAttempts = attempts.length;

  const avgScore = totalAttempts
    ? attempts.reduce(
        (s, a) =>
          s + Number(a.percentage),
        0
      ) / totalAttempts
    : 0;

  const bestScore = totalAttempts
    ? Math.max(
        ...attempts.map((a) =>
          Number(a.percentage)
        )
      )
    : 0;

  const uniqueTrainings = new Set(
    attempts.map((a) => a.training_id)
  ).size;

  return (
    <MembersLayout>
      <div className="relative space-y-8">
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
          {/* BG */}
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
                SecureLine Members
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
                Olá,
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
                  {user?.user_metadata
                    ?.full_name ||
                    "usuário"}
                </span>
              </h1>

              <p className="text-zinc-400 text-lg leading-relaxed max-w-xl">
                Continue evoluindo sua
                conscientização digital através
                de treinamentos interativos,
                simulações e analytics de
                segurança.
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <Button
                  asChild
                  className="
                    h-12 px-6
                    rounded-2xl
                    font-semibold
                    bg-gradient-to-r
                    from-primary
                    to-secondary
                    shadow-[0_10px_40px_rgba(124,58,237,0.35)]
                  "
                >
                  <Link to="/members/trainings">
                    Explorar treinamentos

                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="
                    h-12 px-6
                    rounded-2xl
                    border-white/10
                    bg-white/[0.03]
                    text-white
                    hover:bg-white/[0.06]
                  "
                >
                  <Link to="/">
                    Voltar ao site
                  </Link>
                </Button>
              </div>
            </div>

            {/* SCORE CARD */}
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
                    Média geral
                  </p>

                  <h3 className="text-5xl font-black text-white">
                    {avgScore.toFixed(0)}%
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
                  <Activity className="w-7 h-7 text-primary" />
                </div>
              </div>

              <Progress
                value={avgScore}
                className="h-3 bg-white/5"
              />

              <div className="flex items-center justify-between mt-4 text-sm">
                <span className="text-zinc-500">
                  Evolução atual
                </span>

                <span className="font-semibold text-primary">
                  Excelente progresso
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* STATS */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Target}
            label="Tentativas"
            value={totalAttempts.toString()}
            glow="from-violet-500/20 to-fuchsia-500/10"
          />

          <StatCard
            icon={TrendingUp}
            label="Média"
            value={`${avgScore.toFixed(
              0
            )}%`}
            glow="from-cyan-500/20 to-blue-500/10"
          />

          <StatCard
            icon={Award}
            label="Melhor resultado"
            value={`${bestScore.toFixed(
              0
            )}%`}
            glow="from-emerald-500/20 to-green-500/10"
          />

          <StatCard
            icon={Clock}
            label="Treinamentos"
            value={uniqueTrainings.toString()}
            glow="from-orange-500/20 to-yellow-500/10"
          />
        </div>

        {/* HISTORY */}
        <section
          className="
            relative
            overflow-hidden
            rounded-[32px]
            border border-white/10
            bg-[#0B1023]
          "
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.12),transparent_35%)]" />

          <div className="relative z-10 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-primary text-sm font-semibold uppercase tracking-[0.2em] mb-3">
                  Histórico
                </p>

                <h2 className="text-3xl font-black text-white">
                  Atividades recentes
                </h2>
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-zinc-500">
                Carregando dashboard...
              </div>
            ) : attempts.length === 0 ? (
              <div
                className="
                  py-16
                  text-center
                  rounded-3xl
                  border border-white/5
                  bg-white/[0.02]
                "
              >
                <div
                  className="
                    w-20 h-20
                    rounded-3xl
                    mx-auto mb-6
                    bg-primary/10
                    border border-primary/20
                    flex items-center justify-center
                  "
                >
                  <Shield className="w-10 h-10 text-primary" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">
                  Nenhum treinamento iniciado
                </h3>

                <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                  Comece agora sua jornada de
                  conscientização digital com
                  simulações interativas.
                </p>

                <Button
                  asChild
                  className="
                    h-12 px-6
                    rounded-2xl
                    bg-gradient-to-r
                    from-primary
                    to-secondary
                  "
                >
                  <Link to="/members/trainings">
                    Começar agora
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {attempts
                  .slice(0, 10)
                  .map((a, index) => (
                    <motion.div
                      key={a.id}
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: index * 0.05,
                      }}
                      className="
                        group
                        relative
                        overflow-hidden
                        rounded-2xl
                        border border-white/10
                        bg-white/[0.03]
                        p-5
                        transition-all
                        duration-300
                        hover:border-primary/20
                        hover:bg-white/[0.05]
                      "
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />

                            <p className="font-semibold text-white truncate">
                              {trainingTitles[
                                a.training_id
                              ] ??
                                "Treinamento"}
                            </p>
                          </div>

                          <p className="text-sm text-zinc-500">
                            {new Date(
                              a.completed_at
                            ).toLocaleString(
                              "pt-BR"
                            )}
                          </p>
                        </div>

                        <div className="w-full md:w-56">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-zinc-400">
                              Desempenho
                            </span>

                            <span className="text-sm font-bold text-white">
                              {Number(
                                a.percentage
                              ).toFixed(0)}
                              %
                            </span>
                          </div>

                          <Progress
                            value={Number(
                              a.percentage
                            )}
                            className="h-2 bg-white/5"
                          />

                          <p className="text-xs text-right mt-2 text-zinc-500">
                            {a.score}/{a.total}{" "}
                            acertos
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </MembersLayout>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  glow,
}: {
  icon: any;
  label: string;
  value: string;
  glow: string;
}) => (
  <motion.div whileHover={{ y: -5 }}>
    <Card
      className="
        relative
        overflow-hidden
        rounded-[28px]
        border border-white/10
        bg-[#0B1023]
      "
    >
      <div
        className={`
          absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500
          bg-gradient-to-br ${glow}
        `}
      />

      <CardContent className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-5">
          <div
            className="
              w-14 h-14
              rounded-2xl
              bg-white/[0.03]
              border border-white/10
              flex items-center justify-center
            "
          >
            <Icon className="w-6 h-6 text-primary" />
          </div>

          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        </div>

        <p className="text-sm text-zinc-500 mb-2">
          {label}
        </p>

        <h3 className="text-4xl font-black text-white tracking-tight">
          {value}
        </h3>
      </CardContent>
    </Card>
  </motion.div>
);

export default MembersDashboard;