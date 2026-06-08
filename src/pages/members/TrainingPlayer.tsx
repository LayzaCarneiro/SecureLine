import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MembersLayout from "@/components/members/MembersLayout";
import { getTrainingByIdFromAPI, salvarResposta, createResultado, updateResultado } from "@/services/tiposGolpe";
import type { TrainingFromAPI, TrainingStep, TrainingOption } from "@/services/tiposGolpe";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, ArrowRight, Trophy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const TrainingPlayer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [training, setTraining] = useState<TrainingFromAPI | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [selected, setSelected] = useState<TrainingOption | null>(null);
  const [answers, setAnswers] = useState<{ stepId: string; optionId: string; isCorrect: boolean }[]>([]);
  const [done, setDone] = useState(false);
  const [resultadoTesteId, setResultadoTesteId] = useState<number | null>(null);

  // Recupera o ID do colaborador logado do localStorage
  const getColaboradorId = (): number | null => {
    try {
      const stored = localStorage.getItem("colaborador");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Estrutura da API: {sucesso, colaborador: {id, ...}}
        // Também tenta: {usuario: {id}}, ou objeto direto
        const userObj = parsed?.colaborador || parsed?.usuario || parsed;
        const id = userObj?.id ?? userObj?.colaboradorId ?? parsed?.id ?? parsed?.colaboradorId;
        if (id !== undefined && id !== null) {
          const num = Number(id);
          if (!isNaN(num) && num > 0) return num;
        }
      }
    } catch {
      // ignora erro de parsing
    }
    return null; // Sem fallback — retorna null se não encontrar
  };

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await getTrainingByIdFromAPI(id);
        if (!data) {
          toast({ title: "Treinamento não encontrado", variant: "destructive" });
          navigate("/members/trainings");
          return;
        }
        setTraining(data);
        setCurrentStepId(data.content?.steps?.[0]?.id ?? null);

        // Criar o resultado (sessão) no início
        const colaboradorId = getColaboradorId();
        if (colaboradorId) {
          try {
            const rId = await createResultado(colaboradorId);
            setResultadoTesteId(rId);
            localStorage.setItem(`training_id_for_result_${rId}`, id);
          } catch (createErr) {
            console.error("⚠️ Não foi possível criar resultado no backend:", createErr);
          }
        }
      } catch (error: any) {
        toast({
          title: "Erro ao carregar treinamento",
          description: error?.message || "Não foi possível conectar à API.",
          variant: "destructive",
        });
        navigate("/members/trainings");
      }
      setLoading(false);
    })();
  }, [id, navigate]);

  if (loading || !training) {
    return (
      <MembersLayout>
        <p className="text-muted-foreground">Carregando treinamento...</p>
      </MembersLayout>
    );
  }

  const steps: TrainingStep[] = training.content?.steps ?? [];
  const currentStep = steps.find((s) => s.id === currentStepId);

  const handleSelect = (opt: TrainingOption) => {
    if (selected) return;
    setSelected(opt);

    // Salva a resposta na API imediatamente
    const colaboradorId = getColaboradorId();
    if (colaboradorId && currentStep && resultadoTesteId) {
      salvarResposta({
        acertou: opt.isCorrect,
        opcaoRespostaId: Number(opt.id),
        cenarioGolpeId: Number(currentStep.id),
        resultadoTesteId: resultadoTesteId,
      }).catch((err) => {
        console.warn("⚠️ Erro ao salvar resposta (não bloqueia o fluxo):", err?.message);
      });
    } else {
      console.warn("⚠️ Não foi possível salvar resposta (resultadoTesteId ou colaboradorId faltando).");
    }
  };

  const handleNext = () => {
    if (!selected || !currentStep) return;
    const newAnswers = [...answers, { stepId: currentStep.id, optionId: selected.id, isCorrect: selected.isCorrect }];
    setAnswers(newAnswers);

    const nextId = selected.nextStepId;
    if (nextId && steps.find((s) => s.id === nextId)) {
      setCurrentStepId(nextId);
      setSelected(null);
      return;
    }

    // Sem próximo definido -> avança sequencialmente ou finaliza
    const idx = steps.findIndex((s) => s.id === currentStep.id);
    if (idx < steps.length - 1 && !selected.nextStepId) {
      setCurrentStepId(steps[idx + 1].id);
      setSelected(null);
      return;
    }

    // Finalizar
    setDone(true);

    // Atualiza o resultado final no backend
    if (resultadoTesteId) {
      const score = newAnswers.filter((a) => a.isCorrect).length;
      const pct = Math.round((score / steps.length) * 100);
      updateResultado(resultadoTesteId, {
        total_acertos: score,
        total_erros: steps.length - score,
        score: pct
      }).catch((err) => {
        console.error("❌ Erro ao atualizar resultado final no backend:", err);
      });
    }
  };

  if (done) {
    const score = answers.filter((a) => a.isCorrect).length;
    const pct = answers.length ? (score / answers.length) * 100 : 0;
    return (
      <MembersLayout>
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <Trophy className="w-12 h-12 mx-auto text-accent mb-2" />
            <CardTitle>Treinamento concluído!</CardTitle>
            <CardDescription>
              Você acertou {score} de {answers.length} ({pct.toFixed(0)}%)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2 justify-center">
            <Button asChild variant="outline">
              <Link to="/members/trainings">Outros treinamentos</Link>
            </Button>
            <Button asChild>
              <Link to="/members">Ver dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </MembersLayout>
    );
  }

  if (!currentStep) {
    return (
      <MembersLayout>
        <p className="text-muted-foreground">Etapa inválida.</p>
      </MembersLayout>
    );
  }

  const stepIndex = steps.findIndex((s) => s.id === currentStep.id);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  return (
    <MembersLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        <div>
          <Link to="/members/trainings" className="text-sm text-muted-foreground hover:text-foreground">
            ← Voltar
          </Link>
          <h1 className="text-2xl font-bold mt-2">{training.title}</h1>
          <Progress value={progress} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            Etapa {stepIndex + 1} de {steps.length}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{currentStep.prompt}</CardTitle>
            {currentStep.context && <CardDescription>{currentStep.context}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {currentStep.options.map((opt) => {
                const isSelected = selected?.id === opt.id;
                const showFeedback = !!selected;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(opt)}
                    disabled={!!selected}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      isSelected
                        ? opt.isCorrect
                          ? "border-success bg-success/10"
                          : "border-destructive bg-destructive/10"
                        : showFeedback && opt.isCorrect
                        ? "border-success/50 bg-success/5"
                        : "border-border hover:border-primary hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {showFeedback && (
                        opt.isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        ) : isSelected ? (
                          <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        ) : null
                      )}
                      <span>{opt.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {selected && (
              <div className={`p-4 rounded-lg ${selected.isCorrect ? "bg-success/10" : "bg-destructive/10"}`}>
                <p className="text-sm font-medium">{selected.feedback}</p>
              </div>
            )}

            {selected && (
              <Button onClick={handleNext} className="w-full">
                Próxima etapa <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </MembersLayout>
  );
};

export default TrainingPlayer;
