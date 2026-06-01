# 🧪 Guia de Testes - Integração Frontend

## 1️⃣ Teste Local (Browser Console)

### Verificar se o serviço está carregando
```javascript
import { findColaboradorByCodigo } from '@/services/colaboradores'
// Se não der erro, está funcionando ✅
```

### Buscar um colaborador
```javascript
import { findColaboradorByCodigo } from '@/services/colaboradores'

findColaboradorByCodigo('TEST')
  .then(c => console.log('Colaborador:', c))
  .catch(e => console.error('Erro:', e))
```

### Testar o fluxo completo
```javascript
import { testSignUpFlow } from '@/services/colaboradores.test'
testSignUpFlow()
```

## 2️⃣ Teste de UI (No Navegador)

### Pré-requisitos
- [ ] Servidor de dev rodando: `npm run dev`
- [ ] Navegador aberto em `http://localhost:5173`

### Passos para testar signup
1. Clique em "Criar conta"
2. Preencha com dados válidos:
   - Nome: "João Silva"
   - Email: "joao@test.com"
   - Senha: "Senha123456"
   - Código: "TEST" (ou outro código que tenha na API)
3. Clique em "Criar Conta"
4. Observe:
   - [ ] Validação de campos
   - [ ] Comunicação com API
   - [ ] Toast com mensagem de sucesso
   - [ ] Redirecionamento para /members

### Teste de erro - Código inválido
1. Insira um código que não existe
2. Deve mostrar: "O código de acesso informado não foi encontrado"

### Teste de erro - Código já tem senha
1. Insira um código que já foi registrado
2. Deve mostrar: "Este código já possui uma senha definida. Faça login na aba Entrar"

## 3️⃣ Teste via cURL (Terminal)

### Listar todos os colaboradores
```bash
curl -X GET "https://api-golpe-whatsapp.onrender.com/colaboradores"
```

### Buscar um colaborador específico
```bash
curl -X GET "https://api-golpe-whatsapp.onrender.com/colaboradores" \
  | grep -i "TEST"
```

### Atualizar um colaborador
```bash
curl -X PUT "https://api-golpe-whatsapp.onrender.com/colaboradores/3" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "senha": "senha123456",
    "ativo": true
  }'
```

## 4️⃣ Teste de Build

### Compilar o projeto
```bash
npm run build
```

### Verificar se há erros
```bash
npm run build 2>&1 | grep -i "error"
```

### Preview do build
```bash
npm run preview
```

## 5️⃣ Teste de Login

### Após criar conta, teste login
1. Vá para "Entrar"
2. Use o email que cadastrou
3. Use a senha que definiu
4. Deve redirecionar para /members

## 📋 Checklist de Teste

### Validação de Inputs
- [ ] Nome vazio → Erro "Nome muito curto"
- [ ] Email inválido → Erro "E-mail inválido"
- [ ] Senha < 8 chars → Erro "Mínimo 8 caracteres"
- [ ] Código vazio → Erro "Código inválido"

### API Integration
- [ ] API online e respondendo
- [ ] Código válido encontrado
- [ ] Código inválido gera erro
- [ ] Código com senha gera erro
- [ ] Atualização salva corretamente

### Supabase Integration
- [ ] Conta criada no Supabase
- [ ] Email confirmado (opcional)
- [ ] Role "subscriber" atribuído
- [ ] codigo_colaborador salvo nos metadados

### Navigation & UX
- [ ] Sucesso redireciona para /members
- [ ] Erro mostra toast apropriado
- [ ] Loading state funciona
- [ ] Campos do formulário limpam após sucesso

## 🐛 Debug

### Ver requisições de rede
1. F12 → Network
2. Procure por requisições para `api-golpe-whatsapp.onrender.com`
3. Verifique status (200, 404, 500)

### Ver logs do Supabase
1. Vá para [Supabase Dashboard](https://supabase.com)
2. Seu projeto
3. Authentication → Users
4. Procure pelo email que cadastrou

### Ver console errors
1. F12 → Console
2. Procure por erros em vermelho
3. Click para expandir e ver detalhes

## 📊 Dados de Teste

Se a API usa dados mockados, use:

```json
{
  "codigo_colaborador": "TEST",
  "id": 3,
  "nome": null,
  "senha": "x",
  "email": null,
  "ativo": false
}
```

### Para testes sem API real
Crie um ambiente de testes sem dependência da API:

```typescript
// Mock service para testes
export const mockColaboradores = [
  { id: 1, codigo_colaborador: "DEV1", nome: null, senha: null },
  { id: 2, codigo_colaborador: "DEV2", nome: null, senha: null },
  { id: 3, codigo_colaborador: "TEST", nome: null, senha: "x" },
]
```

## ✅ Teste Completo

Se passar em todos os testes:

- [ ] Validações funcionam
- [ ] API responde
- [ ] Dados atualizam na API
- [ ] Supabase cria conta
- [ ] Login funciona
- [ ] Redirecionamento funciona
- [ ] Build sem erros

🎉 **Integração está pronta para produção!**

## 🆘 Se algo não funcionar

1. **Verifique a API**
   ```bash
   curl https://api-golpe-whatsapp.onrender.com/colaboradores
   ```
   Se retornar erro → API pode estar offline

2. **Verifique Supabase**
   - Credenciais corretas em `.env`
   - URL da API
   - Chave pública

3. **Verifique o console**
   - Procure por CORS errors
   - Procure por falhas de autenticação
   - Procure por timeouts

4. **Teste isolado**
   ```javascript
   // Teste apenas a API
   fetch('https://api-golpe-whatsapp.onrender.com/colaboradores')
     .then(r => r.json())
     .then(d => console.log(d))
   ```

---

**Última atualização**: 2026-06-01
