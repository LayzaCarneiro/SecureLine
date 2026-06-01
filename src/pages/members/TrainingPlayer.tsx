import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MembersLayout from "@/components/members/MembersLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, ArrowRight, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import type { TrainingStep, StepOption } from "@/data/advancedTrainings";

const TrainingPlayer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [training, setTraining] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [selected, setSelected] = useState<StepOption | null>(null);
  const [answers, setAnswers] = useState<{ stepId: string; optionId: string; isCorrect: boolean }[]>([]);
  const [done, setDone] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase.from("advanced_trainings").select("*").eq("id", id).maybeSingle();
      if (error || !data) {
        toast({ title: "Treinamento não encontrado", variant: "destructive" });
        navigate("/members/trainings");
        return;
      }
      setTraining(data);
      const c: any = data.content;
      setCurrentStepId(c?.steps?.[0]?.id ?? null);
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

  const steps: TrainingStep[] = (training.content as any)?.steps ?? [];
  const currentStep = steps.find((s) => s.id === currentStepId);

  const handleSelect = (opt: StepOption) => {
    if (selected) return;
    setSelected(opt);
  };

  const handleNext = async () => {
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
    const score = newAnswers.filter((a) => a.isCorrect).length;
    const total = newAnswers.length;
    const percentage = total > 0 ? (score / total) * 100 : 0;

    if (user && !saved) {
      const { error } = await supabase.from("training_attempts").insert({
        user_id: user.id,
        training_id: training.id,
        score,
        total,
        percentage,
        answers: newAnswers,
      });
      if (error) {
        toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      } else {
        setSaved(true);
      }
    }
    setDone(true);
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
            {currentStep.media && (
              <div className="rounded-lg overflow-hidden border border-border">
                {currentStep.media.type === "image" && (
                  <img src={currentStep.media.url} alt={currentStep.media.caption ?? ""} className="w-full" />
                )}
                {currentStep.media.type === "audio" && (
                  <audio controls src={currentStep.media.url} className="w-full p-2" />
                )}
                {currentStep.media.type === "video" && (
                  <video controls src={currentStep.media.url} className="w-full" />
                )}
                {currentStep.media.caption && (
                  <p className="text-xs text-muted-foreground p-2 bg-muted">{currentStep.media.caption}</p>
                )}
              </div>
            )}

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
