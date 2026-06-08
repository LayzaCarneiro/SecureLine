import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  CheckCheck,
  ChevronRight,
  Lightbulb,
  CheckCircle,
  Search
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { createResultado, updateResultado } from "@/services/tiposGolpe";

import scenarios, {
  QuizScenario,
  QuizOption,
} from "@/data/quizScenarios";

interface SimulationProps {
  onComplete: (
    score: number,
    total: number,
    answers: AnswerRecord[]
  ) => void;
}

export interface AnswerRecord {
  scenarioId: number;
  scenarioTitle: string;
  scamType: string;
  selectedOption: QuizOption;
  explanation: string;
}

const TypingIndicator = () => (
  <div
    className="
      flex items-center gap-1
      px-4 py-3
      rounded-2xl rounded-tl-md
      bg-[#1A2338]
      border border-white/5
      shadow-lg
      w-fit
    "
  >
    <span
      className="w-2 h-2 rounded-full bg-zinc-400 animate-typing"
      style={{ animationDelay: "0s" }}
    />

    <span
      className="w-2 h-2 rounded-full bg-zinc-400 animate-typing"
      style={{ animationDelay: "0.2s" }}
    />

    <span
      className="w-2 h-2 rounded-full bg-zinc-400 animate-typing"
      style={{ animationDelay: "0.4s" }}
    />
  </div>
);

const WhatsAppSimulation = ({
  onComplete,
}: SimulationProps) => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [showSurvey, setShowSurvey] = useState(false);
  const [faixaEtaria, setFaixaEtaria] = useState("");
  const [conhecimentoTi, setConhecimentoTi] = useState("");
  const [submittingSurvey, setSubmittingSurvey] = useState(false);

  const getColaboradorId = (): number | null => {
    try {
      const stored = localStorage.getItem("colaborador");
      if (stored) {
        const parsed = JSON.parse(stored);
        const userObj = parsed?.colaborador || parsed?.usuario || parsed;
        const id = userObj?.id ?? userObj?.colaboradorId ?? parsed?.id ?? parsed?.colaboradorId;
        if (id !== undefined && id !== null) {
          const num = Number(id);
          if (!isNaN(num) && num > 0) return num;
        }
      }
    } catch {
      // ignora
    }
    return null;
  };

  const handleSurveySubmit = async () => {
    if (!faixaEtaria || !conhecimentoTi) return;
    setSubmittingSurvey(true);

    const score = answers.filter((a) => a.selectedOption.isCorrect).length;
    const total = scenarios.length;

    try {
      let colabId = getColaboradorId();
      if (!colabId) {
        // Cria colaborador visitante sob a empresa ID 2 (Usuários Avulsos)
        const randomCode = `AVULSO-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        const colabRes = await fetch("https://api-golpe-whatsapp.onrender.com/colaboradores", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            nome: "Visitante Avulso",
            codigo_colaborador: randomCode,
            empresaId: 2,
            setor: "Geral",
            ativo: true,
            triked: false
          })
        });

        if (!colabRes.ok) {
          throw new Error("Erro ao registrar visitante na API");
        }
        const createdColab = await colabRes.json();
        colabId = createdColab.id;
      }

      if (colabId) {
        // Cria a sessão de resultado para o colaborador
        const rId = await createResultado(colabId);

        // Atualiza com o resultado final e os dados demográficos
        const pct = Math.round((score / total) * 100);
        await updateResultado(rId, {
          total_acertos: score,
          total_erros: total - score,
          score: pct,
          faixa_etaria: faixaEtaria,
          conhecimento_ti: conhecimentoTi
        });
        console.log("✅ Resultados salvos com sucesso!");
      }
    } catch (err) {
      console.error("⚠️ Erro ao registrar dados de simulação:", err);
    } finally {
      setSubmittingSurvey(false);
      onComplete(score, total, answers);
    }
  };

  const [visibleMessages, setVisibleMessages] =
    useState(0);

  const [showOptions, setShowOptions] =
    useState(false);

  const [selectedAnswer, setSelectedAnswer] =
    useState<QuizOption | null>(null);

  const [showFeedback, setShowFeedback] =
    useState(false);

  const [answers, setAnswers] = useState<
    AnswerRecord[]
  >([]);

  const [isTyping, setIsTyping] = useState(true);

  const scenario = scenarios[currentScenario];

  useEffect(() => {
    setVisibleMessages(0);
    setShowOptions(false);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsTyping(true);

    let timeout: NodeJS.Timeout;

    const showMessagesSequentially = (
      index: number
    ) => {
      if (index < scenario.messages.length) {
        setIsTyping(true);

        timeout = setTimeout(() => {
          setIsTyping(false);

          setVisibleMessages(index + 1);

          if (index + 1 < scenario.messages.length) {
            setTimeout(
              () =>
                showMessagesSequentially(index + 1),
              400
            );
          } else {
            setTimeout(
              () => setShowOptions(true),
              700
            );
          }
        }, 900 + Math.random() * 500);
      }
    };

    setTimeout(
      () => showMessagesSequentially(0),
      700
    );

    return () => clearTimeout(timeout);
  }, [currentScenario, scenario.messages.length]);

  const handleAnswer = (option: QuizOption) => {
    setSelectedAnswer(option);

    setShowFeedback(true);

    setAnswers((prev) => [
      ...prev,
      {
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        scamType: scenario.scamType,
        selectedOption: option,
        explanation: scenario.explanation,
      },
    ]);
  };

  const handleNext = () => {
    if (currentScenario + 1 >= scenarios.length) {
      setShowSurvey(true);
    } else {
      setCurrentScenario((prev) => prev + 1);
    }
  };

  if (showSurvey) {
    return (
      <section className="relative py-20 overflow-hidden bg-[#060816] min-h-[80vh] flex items-center justify-center">
        {/* Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.15),transparent_35%)]" />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto rounded-[32px] border border-white/10 bg-[#0B1020] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.5)] space-y-6"
          >
            <div className="text-center">
              <h2 className="text-3xl font-black text-white mb-2 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                Simulação Concluída!
              </h2>
              <p className="text-zinc-400 text-sm">
                Antes de ver seu resultado detalhado, nos conte um pouco sobre você (respostas anônimas).
              </p>
            </div>

            <div className="space-y-4">
              {/* Faixa Etária */}
              <div className="space-y-2">
                <label className="text-zinc-300 font-medium text-sm">
                  Qual a sua faixa etária?
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { val: "Até 30 anos", label: "Até 30 anos (Jovem)" },
                    { val: "31 a 50 anos", label: "31 a 50 anos (Adulto)" },
                    { val: "Mais de 50 anos", label: "Mais de 50 anos (Sênior)" }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setFaixaEtaria(opt.val)}
                      className={`
                        w-full px-4 py-3.5 rounded-xl border text-left text-sm font-medium transition-all
                        ${faixaEtaria === opt.val
                          ? "bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(124,58,237,0.25)]"
                          : "bg-white/[0.03] border-white/5 text-zinc-300 hover:border-white/10 hover:bg-white/[0.05]"
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nível de Expertise */}
              <div className="space-y-2">
                <label className="text-zinc-300 font-medium text-sm">
                  Qual o seu nível de familiaridade/expertise com a internet?
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { val: "Básico", label: "Básico (Redes sociais e mensagens)" },
                    { val: "Intermediário", label: "Intermediário (Navegação diária e compras)" },
                    { val: "Avançado", label: "Avançado (Trabalho com tecnologia / TI)" }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setConhecimentoTi(opt.val)}
                      className={`
                        w-full px-4 py-3.5 rounded-xl border text-left text-sm font-medium transition-all
                        ${conhecimentoTi === opt.val
                          ? "bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(124,58,237,0.25)]"
                          : "bg-white/[0.03] border-white/5 text-zinc-300 hover:border-white/10 hover:bg-white/[0.05]"
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={handleSurveySubmit}
              disabled={submittingSurvey || !faixaEtaria || !conhecimentoTi}
              className="
                w-full h-12 rounded-2xl font-semibold text-base
                bg-gradient-to-r from-primary to-secondary
                shadow-[0_8px_32px_rgba(124,58,237,0.35)]
                hover:shadow-[0_8px_40px_rgba(124,58,237,0.5)]
                transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {submittingSurvey ? "Salvando..." : "Ver Resultados"}
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="
        relative
        py-20
        overflow-hidden
        bg-[#060816]
      "
    >
      {/* Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.12),transparent_35%)]" />

      {/* Grid */}
      <div
        className="
          absolute inset-0 opacity-[0.03]
          bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
          bg-[size:48px_48px]
        "
      />

      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h2
              className="
                text-4xl md:text-5xl
                font-black
                tracking-tight
                text-white
                mb-3
              "
            >
              Simulação de Golpes
            </h2>

            <p className="text-zinc-400 text-lg">
              Identifique ameaças digitais em um
              ambiente seguro de treinamento.
            </p>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">
                Cenário{" "}
                <span className="text-white font-semibold">
                  {currentScenario + 1}
                </span>{" "}
                de {scenarios.length}
              </span>

              <span className="text-sm text-primary font-semibold">
                {Math.round(
                  ((currentScenario +
                    (showFeedback ? 1 : 0)) /
                    scenarios.length) *
                    100
                )}
                %
              </span>
            </div>

            <div
              className="
                h-2
                rounded-full
                overflow-hidden
                bg-white/5
                border border-white/5
              "
            >
              <motion.div
                className="
                  h-full
                  rounded-full
                  bg-gradient-to-r
                  from-primary
                  via-violet-400
                  to-secondary
                "
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    ((currentScenario +
                      (showFeedback ? 1 : 0)) /
                      scenarios.length) *
                    100
                  }%`,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Disclaimer */}
          <div
            className="
              mb-6
              rounded-2xl
              border border-yellow-500/10
              bg-yellow-500/5
              px-4 py-3
              text-center
            "
          >
            <p className="text-xs text-yellow-200 font-medium">
              ⚠️ Simulação educativa — as mensagens
              abaixo são fictícias
            </p>
          </div>

          {/* Phone */}
          <div className="relative">
            {/* Glow */}
            <div
              className="
                absolute inset-0
                rounded-[40px]
                bg-gradient-to-br
                from-primary/20
                via-secondary/10
                to-transparent
                blur-3xl
                opacity-40
              "
            />

            <div
              className="
                relative
                overflow-hidden
                rounded-[38px]
                border border-white/10
                bg-[#0B1020]
                shadow-[0_30px_120px_rgba(0,0,0,0.45)]
              "
            >
              {/* Header */}
              <div
                className="
                  relative
                  px-5 py-4
                  flex items-center gap-3
                  border-b border-white/5
                  bg-[#111827]/80
                  backdrop-blur-xl
                "
              >
                <div
                  className="
                    w-11 h-11
                    rounded-2xl
                    bg-gradient-to-br
                    from-primary/20
                    to-secondary/20
                    border border-white/10
                    flex items-center justify-center
                    text-lg
                    shadow-lg
                  "
                >
                  {scenario.contactAvatar}
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    {scenario.contactName}
                  </p>

                  <p className="text-xs text-emerald-400">
                    online
                  </p>
                </div>

                <div className="ml-auto">
                  <div
                    className="
                      px-3 py-1
                      rounded-full
                      border border-red-500/20
                      bg-red-500/10
                    "
                  >
                    <span
                      className="
                        text-[11px]
                        font-semibold
                        tracking-wide
                        text-red-300
                        uppercase
                      "
                    >
                      {scenario.scamType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat */}
              <div
                className="
                  relative
                  min-h-[420px]
                  p-5
                  space-y-3
                  bg-[#0D1324]
                "
              >
                <AnimatePresence>
                  {scenario.messages
                    .slice(0, visibleMessages)
                    .map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{
                          opacity: 0,
                          y: 14,
                          scale: 0.96,
                          filter: "blur(6px)",
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                          filter: "blur(0px)",
                        }}
                        transition={{
                          duration: 0.35,
                        }}
                        className="flex"
                      >
                        <div
                          className="
                            relative
                            rounded-2xl
                            rounded-tl-md
                            px-4 py-3
                            max-w-[85%]
                            bg-[#1A2338]
                            border border-white/5
                            backdrop-blur-xl
                            shadow-lg
                          "
                        >
                          <p className="text-sm text-zinc-100 whitespace-pre-wrap break-all leading-relaxed">
                            {msg.text}
                          </p>

                          <div className="flex items-center justify-end gap-1 mt-2">
                            <span className="text-[10px] text-zinc-500">
                              {msg.time}
                            </span>

                            <CheckCheck className="w-3.5 h-3.5 text-secondary" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>

                {isTyping &&
                  visibleMessages <
                    scenario.messages.length && (
                    <TypingIndicator />
                  )}
              </div>
            </div>
          </div>

          {/* Options */}
          <AnimatePresence>
            {showOptions && !showFeedback && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mt-8 space-y-5"
              >
                <h3
                  className="
                    text-2xl
                    font-black
                    tracking-tight
                    text-center
                    text-white
                  "
                >
                  {scenario.question}
                </h3>

                <div className="space-y-3">
                  {scenario.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() =>
                        handleAnswer(option)
                      }
                      className="
                        group
                        relative
                        overflow-hidden
                        rounded-2xl
                        border border-white/10
                        bg-[#0B1020]
                        px-5 py-5
                        text-left
                        transition-all duration-300
                        hover:border-primary/30
                        hover:bg-white/[0.03]
                        hover:shadow-[0_10px_40px_rgba(124,58,237,0.12)]
                        w-full
                      "
                    >
                      <div
                        className="
                          absolute inset-0 opacity-0
                          group-hover:opacity-100
                          transition-opacity duration-500
                          bg-gradient-to-br
                          from-primary/10
                          via-secondary/5
                          to-transparent
                        "
                      />

                      <span className="relative z-10 text-sm text-zinc-200 font-medium leading-relaxed">
                        {option.text}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback */}
          <AnimatePresence>
            {showFeedback &&
              selectedAnswer && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mt-8 space-y-4"
                >
                  <div
                    className={`p-5 rounded-2xl border backdrop-blur-xl ${
                      selectedAnswer.isCorrect
                        ? "bg-emerald-500/10 border-emerald-400/20 shadow-[0_10px_40px_rgba(16,185,129,0.10)]"
                        : "bg-red-500/10 border-red-400/20 shadow-[0_10px_40px_rgba(239,68,68,0.10)]"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {selectedAnswer.isCorrect ? (
                        <Check className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <span className="text-red-400 text-lg">
                          ✗
                        </span>
                      )}

                      <span
                        className={`font-bold ${
                          selectedAnswer.isCorrect
                            ? "text-emerald-300"
                            : "text-red-300"
                        }`}
                      >
                        {selectedAnswer.isCorrect
                          ? "Resposta Correta"
                          : "Resposta Incorreta"}
                      </span>
                    </div>

                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {selectedAnswer.feedback}
                    </p>
                  </div>

                  <div
                    className="
                      rounded-2xl
                      border border-primary/10
                      bg-primary/5
                      p-5
                    "
                  >
                    <p className="text-sm font-semibold text-primary mb-2">
                      💡 Explicação
                    </p>

                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {scenario.explanation}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
                    <h3 className="flex items-center gap-2 text-white font-semibold mb-4">
                      <Search className="w-4 h-4 text-primary" />
                      O que indicava que era um golpe?
                    </h3>

                    <div className="space-y-4">
                      {scenario.warningSigns.map((item) => (
                        <div
                          key={item.title}
                          className="border-b border-white/5 pb-4 last:border-0"
                        >
                          <p className="font-medium text-red-300">
                            {item.title}
                          </p>

                          <p className="text-sm text-zinc-400 mt-1">
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-5">
                    <h3 className="flex items-center gap-2 text-white font-semibold mb-4">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      O que você deveria fazer?
                    </h3>

                    <div className="space-y-3">
                      {scenario.correctActions.map((action) => (
                        <div
                          key={action}
                          className="flex items-start gap-3"
                        >
                          <span className="text-emerald-400">•</span>

                          <p className="text-sm text-zinc-300">
                            {action}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-5">
                    <h3 className="flex items-center gap-2 text-white font-semibold mb-4">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      Dica para próximas simulações
                    </h3>

                    <ul className="space-y-2">
                      {scenario.nextTips.map((tip) => (
                        <li
                          key={tip}
                          className="flex items-start gap-3"
                        >
                          <span className="text-amber-400">•</span>

                          <p className="text-sm text-zinc-300">
                            {tip}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={handleNext}
                    className="
                      w-full
                      h-14
                      rounded-2xl
                      text-base
                      font-semibold
                      bg-gradient-to-r
                      from-primary
                      to-secondary
                      shadow-[0_10px_40px_rgba(124,58,237,0.35)]
                    "
                  >
                    {currentScenario + 1 >=
                    scenarios.length
                      ? "Ver Resultados"
                      : "Próximo Cenário"}

                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </motion.div>
              )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default WhatsAppSimulation;