import { AnswerRecord } from "@/components/public/WhatsAppSimulation";

export interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  answers: AnswerRecord[];
  level: "excelente" | "bom" | "atencao";
  completedAt: Date;
}

export interface Training {
  id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  content: {
    steps: TrainingStep[];
  };
}

export interface TrainingStep {
  id: string;
  prompt: string;
  context?: string;
  media?: StepMedia;
  options: StepOption[];
}

export interface StepMedia {
  type: "image" | "audio" | "video";
  url: string;
  caption?: string;
}

export interface StepOption {
  id: string;
  label: string;
  isCorrect: boolean;
  feedback: string;
  nextStepId?: string;
}
