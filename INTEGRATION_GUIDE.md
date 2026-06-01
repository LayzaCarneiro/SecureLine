# Integração Frontend com API de Colaboradores

## 📋 Visão Geral

O sistema de autenticação foi integrado com a API de colaboradores (`https://api-golpe-whatsapp.onrender.com/colaboradores`). O fluxo permite que usuários usem um código gerado para criar suas contas.

## 🔄 Fluxo de Cadastro

### Estrutura da API
Cada colaborador na API tem a seguinte estrutura:
```json
{
  "id": 3,
  "nome": null,
  "senha": "x",
  "codigo_colaborador": "TEST",
  "apelido": null,
  "setor": null,
  "created_at": "2026-06-01T09:52:58.213Z",
  "empresaId": null,
  "triked": false,
  "ativo": false,
  "empresa": null,
  "telefones": [],
  "resultadosTestes": []
}
```

### Passos do Cadastro

1. **Usuário fornece código de colaborador**
   - Campo: `accessCode`
   - Validação: Mínimo 3 caracteres

2. **Sistema busca na API**
   - GET `/colaboradores`
   - Encontra o colaborador pelo `codigo_colaborador`

3. **Validações**
   - ✅ Código existe?
   - ✅ Ainda não tem senha definida?

4. **Atualiza dados no colaborador**
   - PUT `/colaboradores/{id}`
   - Define: `nome`, `senha`, `ativo: true`

5. **Cria conta no Supabase**
   - Email: Fornecido pelo usuário
   - Senha: Confirmada anteriormente
   - Metadados: `role: "subscriber"`, `codigo_colaborador`

## 📁 Arquivos Principais

### `src/services/colaboradores.ts`
Serviço centralizado para operações com a API de colaboradores:

```typescript
// Buscar todos
fetchColaboradores(): Promise<Colaborador[]>

// Buscar por código
findColaboradorByCodigo(codigo: string): Promise<Colaborador | null>

// Atualizar
updateColaborador(id: number, nome: string, senha: string): Promise<Colaborador>

// Validações
hasPasswordSet(colaborador: Colaborador): boolean
isActive(colaborador: Colaborador): boolean
```

### `src/pages/Auth.tsx`
Página de autenticação atualizada para usar o novo serviço:
- ✅ Importa funções de `colaboradores.ts`
- ✅ Integra validação de código
- ✅ Atualiza colaborador na API
- ✅ Cria conta no Supabase

## 🛠️ Como Funciona

### Fluxo Visual
```
┌─────────────────────────────────────────┐
│  Usuário insere Código de Colaborador   │
└─────────────────────┬───────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────┐
│  Valida Schema (Zod)                    │
│  - Nome (2-100 caracteres)              │
│  - Email (válido)                       │
│  - Senha (8-72 caracteres)              │
│  - Código (3+ caracteres)               │
└─────────────────────┬───────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────┐
│  É código ADMIN?                        │
│  AdminSecureL1n&                        │
└──┬──────────────────────────────────────┘
   │ SIM                    NÃO
   │                        │
   ▼                        ▼
┌──────────────┐   ┌──────────────────────┐
│ Cria Admin   │   │ Busca Colaborador    │
│ no Supabase  │   │ na API               │
└──────────────┘   └─────┬────────────────┘
                          │
                    Encontrado?
                      │    │
                    SIM   NÃO
                      │    │
                      ▼    ▼
                    ┌─┐  ┌──────────┐
                    │✓│  │ Erro ❌  │
                    └─┘  └──────────┘
                      │
                      ▼
            ┌──────────────────────┐
            │ Já tem senha?        │
            └──┬──────────────────┘
               │ SIM              NÃO
               │                  │
               ▼                  ▼
            ┌──────┐   ┌──────────────────────┐
            │Erro❌│   │ Atualiza na API      │
            └──────┘   │ - nome               │
                       │ - senha              │
                       │ - ativo: true        │
                       └──────┬───────────────┘
                              │
                              ▼
                       ┌──────────────────────┐
                       │ Cria no Supabase     │
                       │ role: "subscriber"   │
                       │ codigo_colaborador   │
                       └──────┬───────────────┘
                              │
                              ▼
                       ┌──────────────────────┐
                       │ Sucesso ✅           │
                       │ Redireciona para     │
                       │ /members             │
                       └──────────────────────┘
```

## 🧪 Teste

Para testar a integração:

1. **Verifique se a API está acessível:**
   ```bash
   curl https://api-golpe-whatsapp.onrender.com/colaboradores
   ```

2. **No console do navegador, teste:**
   ```typescript
   import { findColaboradorByCodigo } from "@/services/colaboradores"
   
   findColaboradorByCodigo("TEST").then(c => console.log(c))
   ```

3. **Teste completo:**
   ```typescript
   import { testSignUpFlow } from "@/services/colaboradores.test"
   
   testSignUpFlow()
   ```

## ⚠️ Pontos Importantes

1. **Email não é usado da API**: O email vem do usuário durante o cadastro no Supabase
2. **Senha é duplicada**: Armazenada na API e no Supabase para segurança
3. **Código é único**: Cada colaborador tem um `codigo_colaborador` único
4. **Status de ativação**: O colaborador é ativado (`ativo: true`) quando define a senha

## 🔐 Segurança

- ✅ Validação com Zod em todos os formulários
- ✅ Senhas com mínimo 8 caracteres
- ✅ Email validado
- ✅ Código deve existir na API
- ✅ Proteção contra reregistro (verifica se já tem senha)

## 📞 Suporte

Para problemas com a integração:
1. Verifique se a API está online
2. Valide a estrutura dos dados retornados
3. Procure por erros no console do navegador
4. Verifique os logs do Supabase

