/**
 * Serviço para integração com os endpoints de Tipos de Golpe, Opções e Respostas
 *
 * Endpoints:
 *   GET  /tipos-golpe  → lista de tipos de golpe com cenários embutidos
 *   GET  /opcoes       → lista de opções de resposta (linkadas por cenarioId)
 *   POST /respostas    → salvar respostas do colaborador
 */

// ─── Tipos da API ────────────────────────────────────────────────

export interface OpcaoAPI {
  id: number;
  texto_opcao: string;
  correta: boolean;
  cenarioId: number;
}

export interface CenarioGolpeAPI {
  id: number;
  titulo: string;
  mensagem_golpe: string;
  dificuldade: string;
  explicacao: string;
  ativo: boolean;
  tipoGolpeId: number;
}

export interface TipoGolpeAPI {
  id: number;
  nomeGolpe: string;
  descricao: string;
  nivelRisco: string;
  cenariosGolpes: CenarioGolpeAPI[];
}

// ─── Tipos mapeados para o front-end ─────────────────────────────

export interface TrainingOption {
  id: string;
  label: string;
  isCorrect: boolean;
  feedback: string;
  nextStepId?: string;
}

export interface TrainingStep {
  id: string;
  prompt: string;
  context?: string;
  options: TrainingOption[];
}

export interface TrainingFromAPI {
  id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  content: {
    steps: TrainingStep[];
  };
}

// ─── Payload para salvar respostas ───────────────────────────────

export interface RespostaPayload {
  acertou: boolean;
  opcaoRespostaId: number;
  cenarioGolpeId: number;
  resultadoTesteId: number;
}

export interface ResultadoPayload {
  colaboradorId: number;
  total_acertos?: number;
  total_erros?: number;
  score?: number;
  faixa_etaria?: string | null;
  conhecimento_ti?: string | null;
}


// ─── Constantes ──────────────────────────────────────────────────

const BASE_URL = "https://api-golpe-whatsapp.onrender.com";

// ─── Helpers ─────────────────────────────────────────────────────

function mapNivelRisco(nivel: string): string {
  const lower = nivel.toLowerCase();
  if (lower === "alto") return "avancado";
  if (lower === "médio" || lower === "medio") return "intermediario";
  return "iniciante";
}

async function apiFetch<T>(path: string): Promise<T> {
  const url = `${BASE_URL}${path}`;
  console.log(`📡 Buscando dados em: ${url}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      mode: "cors",
      credentials: "omit",
    });

    clearTimeout(timeoutId);
    console.log(`📊 Status ${path}: ${res.status} ${res.statusText}`);

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`API retornou ${res.status}: ${errorBody}`);
    }

    const data = await res.json();
    console.log(`✅ Sucesso ${path}! ${Array.isArray(data) ? data.length + " itens" : "OK"}`);
    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    const errorMsg = error?.message || "Falha ao conectar à API";
    console.error(`❌ Erro ao buscar ${path}:`, errorMsg);
    throw new Error(errorMsg);
  }
}

// ─── Funções de busca ────────────────────────────────────────────

export async function fetchTiposGolpe(): Promise<TipoGolpeAPI[]> {
  return apiFetch<TipoGolpeAPI[]>("/tipos-golpe");
}

export async function fetchOpcoes(): Promise<OpcaoAPI[]> {
  return apiFetch<OpcaoAPI[]>("/opcoes");
}

/**
 * Busca tipos de golpe + opções em paralelo e mapeia para a estrutura
 * TrainingFromAPI usada pelo front-end (TrainingsList / TrainingPlayer).
 */
export async function fetchTrainingsFromAPI(): Promise<TrainingFromAPI[]> {
  const [tiposGolpe, opcoes] = await Promise.all([
    fetchTiposGolpe(),
    fetchOpcoes(),
  ]);

  // Agrupa opções por cenarioId
  const opcoesPorCenario = new Map<number, OpcaoAPI[]>();
  for (const op of opcoes) {
    const lista = opcoesPorCenario.get(op.cenarioId) ?? [];
    lista.push(op);
    opcoesPorCenario.set(op.cenarioId, lista);
  }

  // Mapeia cada TipoGolpe → TrainingFromAPI
  const trainings: TrainingFromAPI[] = tiposGolpe.map((tipo) => {
    // Filtra apenas cenários ativos
    const cenariosAtivos = tipo.cenariosGolpes.filter((c) => c.ativo);

    const steps: TrainingStep[] = cenariosAtivos.map((cenario) => {
      const opcoesDoStep = opcoesPorCenario.get(cenario.id) ?? [];

      const options: TrainingOption[] = opcoesDoStep.map((op) => ({
        id: String(op.id),
        label: op.texto_opcao,
        isCorrect: op.correta,
        feedback: op.correta
          ? "✅ Resposta correta!"
          : `❌ Resposta incorreta. ${cenario.explicacao}`,
      }));

      return {
        id: String(cenario.id),
        prompt: cenario.mensagem_golpe,
        context: cenario.titulo,
        options,
      };
    });

    return {
      id: String(tipo.id),
      title: tipo.nomeGolpe,
      description: tipo.descricao,
      level: mapNivelRisco(tipo.nivelRisco),
      category: tipo.nomeGolpe,
      content: { steps },
    };
  });

  // Filtra treinamentos que ficaram sem cenários (todos inativos)
  return trainings.filter((t) => t.content.steps.length > 0);
}

/**
 * Busca um treinamento específico por ID.
 * Reutiliza fetchTrainingsFromAPI (a API não tem rota individual por tipo).
 */
export async function getTrainingByIdFromAPI(
  id: string
): Promise<TrainingFromAPI | null> {
  const all = await fetchTrainingsFromAPI();
  return all.find((t) => t.id === id) ?? null;
}

// ─── Salvar e buscar resultados / respostas ───────────────────────

/**
 * Cria uma nova tentativa de treinamento (resultado) no endpoint POST /resultados.
 */
export async function createResultado(colaboradorId: number): Promise<number> {
  const url = `${BASE_URL}/resultados`;
  console.log(`📤 Criando resultado em: ${url}`, { colaboradorId });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ colaboradorId }),
      mode: "cors",
      credentials: "omit",
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Erro ao criar resultado (${res.status}): ${errorBody}`);
    }

    const data = await res.json();
    console.log("✅ Resultado criado com ID:", data.id);
    return data.id;
  } catch (error: any) {
    console.error("❌ Erro ao criar resultado:", error);
    throw error;
  }
}

/**
 * Atualiza o resultado final no endpoint PUT /resultados/:id.
 */
export async function updateResultado(
  id: number,
  payload: Partial<ResultadoPayload>
): Promise<void> {
  const url = `${BASE_URL}/resultados/${id}`;
  console.log(`📤 Atualizando resultado ID ${id} em: ${url}`, payload);

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      mode: "cors",
      credentials: "omit",
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Erro ao atualizar resultado (${res.status}): ${errorBody}`);
    }

    console.log("✅ Resultado atualizado com sucesso!");
  } catch (error: any) {
    console.error("❌ Erro ao atualizar resultado:", error);
    throw error;
  }
}

/**
 * Busca a lista completa de resultados do endpoint GET /resultados.
 */
export async function fetchResultados(): Promise<any[]> {
  return apiFetch<any[]>("/resultados");
}

/**
 * Busca a lista completa de respostas do endpoint GET /respostas.
 */
export async function fetchRespostas(): Promise<any[]> {
  return apiFetch<any[]>("/respostas");
}

/**
 * Envia a resposta do colaborador para o endpoint POST /respostas.
 */
export async function salvarResposta(payload: RespostaPayload): Promise<void> {
  const url = `${BASE_URL}/respostas`;
  console.log(`📤 Salvando resposta em: ${url}`, payload);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      mode: "cors",
      credentials: "omit",
    });

    clearTimeout(timeoutId);
    console.log(`📊 Resposta salva: ${res.status} ${res.statusText}`);

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Erro ${res.status}: ${errorBody}`);
    }

    console.log("✅ Resposta salva com sucesso!");
  } catch (error: any) {
    clearTimeout(timeoutId);
    const errorMsg = error?.message || "Falha ao salvar resposta";
    console.error("❌ Erro ao salvar resposta:", errorMsg);
    throw new Error(errorMsg);
  }
}

