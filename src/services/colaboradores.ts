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
 * Fetch all colaboradores from API with retry
 */
export async function fetchColaboradores(): Promise<Colaborador[]> {
  console.log(`📡 Buscando colaboradores em: ${COLABORADORES_API}`);
  
  const maxRetries = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Tentativa ${attempt}/${maxRetries}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

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
      lastError = error;
      const errorMsg = error?.message || String(error);
      console.warn(`❌ Tentativa ${attempt} falhou:`, errorMsg);
      
      if (attempt < maxRetries) {
        console.log(`⏳ Aguardando 2s antes de tentar novamente...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  // Se chegou aqui, todas as tentativas falharam
  const finalError = lastError?.message || "Falha ao conectar à API";
  console.error("❌ Todas as tentativas falharam:", finalError);
  throw new Error(finalError);
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
 * Update colaborador with nome and senha
 */
export async function updateColaborador(
  id: number,
  nome: string,
  senha: string
): Promise<Colaborador> {
  console.log(`📤 Atualizando colaborador ID ${id}:`, { nome });
  
  const payload = {
    nome,
    senha,
    ativo: true,
  };

  const maxRetries = 2;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Tentativa ${attempt}/${maxRetries}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const res = await fetch(`${COLABORADORES_API}/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
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
      return updated;
      
    } catch (error: any) {
      lastError = error;
      const errorMsg = error?.message || String(error);
      console.warn(`❌ Tentativa ${attempt} falhou:`, errorMsg);
      
      if (attempt < maxRetries) {
        console.log(`⏳ Aguardando 2s antes de tentar novamente...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  const finalError = lastError?.message || "Falha ao atualizar colaborador";
  console.error("❌ Todas as tentativas falharam:", finalError);
  throw new Error(finalError);
}

/**
 * Login do colaborador por nome e senha
 * Busca na API e valida credenciais
 */
export async function loginColaborador(
  nome: string,
  senha: string
): Promise<Colaborador | null> {
  console.log(`🔐 Tentando login para: ${nome}`);
  
  const maxRetries = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Tentativa ${attempt}/${maxRetries}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

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

      if (!res.ok) {
        throw new Error(`API retornou ${res.status}`);
      }

      const lista = await res.json();
      
      // Procura por nome ou código_colaborador
      const colaborador = lista.find((c: Colaborador) => {
        const nomeMatch = (c.nome || "").toLowerCase() === nome.toLowerCase();
        const codigoMatch = (c.codigo_colaborador || "").toUpperCase() === nome.toUpperCase();
        return nomeMatch || codigoMatch;
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
      lastError = error;
      const errorMsg = error?.message || String(error);
      console.warn(`❌ Tentativa ${attempt} falhou:`, errorMsg);
      
      if (attempt < maxRetries) {
        console.log(`⏳ Aguardando 2s antes de tentar novamente...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  const finalError = lastError?.message || "Falha ao fazer login";
  console.error("❌ Todas as tentativas falharam:", finalError);
  throw new Error(finalError);
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
