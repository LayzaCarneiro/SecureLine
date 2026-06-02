/**
 * Colaborador structure from API
 */
export interface Colaborador {
  id: number;
  nome: string | null;
  senha: string;
  codigo_colaborador: string;
  apelido: string | null;
  setor: string | null;
  created_at: string;
  empresaId: number | null;
  triked: boolean;
  ativo: boolean;
  empresa: any;
  telefones: any[];
  resultadosTestes: any[];
}

const COLABORADORES_API = "https://api-golpe-whatsapp.onrender.com/colaboradores";

/**
 * Fetch all colaboradores from API (single request, no retries)
 */
export async function fetchColaboradores(): Promise<Colaborador[]> {
  console.log(`📡 Buscando colaboradores em: ${COLABORADORES_API}`);

  try {
    const controller = new AbortController();
    // 30 seconds timeout to allow Render free tier instance to spin up without timeout
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(COLABORADORES_API, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit'
    });

    clearTimeout(timeoutId);
    console.log(`📊 Status: ${res.status} ${res.statusText}`);

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`API retornou ${res.status}: ${errorBody}`);
    }

    const data = await res.json();
    console.log(`✅ Sucesso! ${data.length} colaboradores recebidos`);
    return data;

  } catch (error: any) {
    const errorMsg = error?.message || "Falha ao conectar à API";
    console.error("❌ Erro ao buscar colaboradores:", errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Find colaborador by codigo
 */
export async function findColaboradorByCodigo(codigo: string): Promise<Colaborador | null> {
  console.log(`🔍 Procurando colaborador com código: ${codigo}`);

  try {
    const lista = await fetchColaboradores();

    const encontrado = lista.find(
      (c) =>
        (c.codigo_colaborador || "").trim().toUpperCase() ===
        codigo.trim().toUpperCase()
    );

    if (encontrado) {
      console.log(`✅ Colaborador encontrado:`, encontrado);
    } else {
      console.warn(`⚠️ Código não encontrado. Códigos disponíveis:`,
        lista.map(c => c.codigo_colaborador).join(', ')
      );
    }

    return encontrado || null;
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    console.error("❌ Erro ao buscar colaborador:", errorMsg);
    throw error;
  }
}

/**
 * Update colaborador with nome, senha and apelido (single request, no retries)
 */
export async function updateColaborador(
  id: number,
  nome: string,
  senha: string,
  apelido?: string
): Promise<Colaborador> {
  console.log(`📤 Atualizando colaborador ID ${id}:`, { nome, apelido });

  // Tenta primeiro sem apelido (compatível com APIs mais antigas)
  const payloadBase = {
    nome,
    senha,
    ativo: true,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(`${COLABORADORES_API}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(payloadBase),
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit'
    });

    clearTimeout(timeoutId);
    console.log(`📊 Resposta: ${res.status} ${res.statusText}`);

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Erro ${res.status}: ${errorBody}`);
    }

    const updated = await res.json();
    console.log("✅ Atualizado com sucesso:", updated);

    // Tenta salvar apelido separadamente se fornecido (ignora erros silenciosamente)
    if (apelido) {
      try {
        const ctrl2 = new AbortController();
        const t2 = setTimeout(() => ctrl2.abort(), 10000);
        await fetch(`${COLABORADORES_API}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ ...updated, apelido }),
          signal: ctrl2.signal,
          mode: 'cors',
          credentials: 'omit'
        });
        clearTimeout(t2);
        console.log(`✅ Apelido "${apelido}" salvo com sucesso`);
      } catch (apelidoErr) {
        console.warn("⚠️ Não foi possível salvar apelido (ignorado):", apelidoErr);
      }
    }

    return updated;

  } catch (error: any) {
    const errorMsg = error?.message || "Falha ao atualizar colaborador";
    console.error("❌ Erro ao atualizar colaborador:", errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Login do colaborador por nome e senha (apelido/código/nome)
 * Busca na API e valida credenciais (single request, no retries)
 */
export async function loginColaborador(
  nome: string,
  senha: string
): Promise<Colaborador | null> {
  console.log(`🔐 Tentando login para: ${nome}`);

  try {
    // Reutiliza fetchColaboradores que faz apenas uma requisição
    const lista = await fetchColaboradores();

    // Procura por apelido, nome ou código_colaborador
    const colaborador = lista.find((c: Colaborador) => {
      const apelidoMatch = (c.apelido || "").toLowerCase() === nome.toLowerCase();
      const nomeMatch = (c.nome || "").toLowerCase() === nome.toLowerCase();
      const codigoMatch = (c.codigo_colaborador || "").toUpperCase() === nome.toUpperCase();
      return apelidoMatch || nomeMatch || codigoMatch;
    });

    if (!colaborador) {
      console.warn(`⚠️ Usuário "${nome}" não encontrado`);
      return null;
    }

    // Valida senha
    if (colaborador.senha !== senha) {
      console.warn(`⚠️ Senha incorreta para "${nome}"`);
      return null;
    }

    console.log(`✅ Login bem-sucedido:`, colaborador);
    return colaborador;

  } catch (error: any) {
    const errorMsg = error?.message || "Falha ao fazer login";
    console.error("❌ Erro no login:", errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Check if colaborador already has password set
 */
export function hasPasswordSet(colaborador: Colaborador): boolean {
  return !!colaborador.senha;
}

/**
 * Check if colaborador is active
 */
export function isActive(colaborador: Colaborador): boolean {
  return colaborador.ativo;
}
