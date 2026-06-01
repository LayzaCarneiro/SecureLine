# 🧪 Teste Final de Integração

## ✅ Passo 1: Verificar API (já fez?)

Cole no console:
```javascript
fetch("https://api-golpe-whatsapp.onrender.com/colaboradores", {
  method: 'GET',
  headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
  mode: 'cors',
  credentials: 'omit'
})
.then(r => r.json())
.then(d => console.table(d))
.catch(e => console.error('❌ Erro:', e.message));
```

Resultado esperado:
```
✅ Tabela com colaboradores
Colunas: id | nome | senha | codigo_colaborador | ativo
```

## 🎯 Passo 2: Teste de Cadastro

### Abra dois painéis:
1. **Painel A**: Seu site em http://localhost:5173
2. **Painel B**: Console do DevTools (F12 → Console)

### Preenccha o formulário:
- Nome: "Teste da Integração"
- Email: "teste@seu-email.com"
- Senha: "Senha123456"
- Código: **Use um código SEM SENHA**

### Procure na tabela do passo 1 qual código tem:
```
senha: null  ← Este pode usar!
```

### Clique em "Criar Conta"

### Procure no Console por:
```
📡 Buscando colaboradores em: https://api-golpe-whatsapp.onrender.com/colaboradores
🔄 Tentativa 1/3
📊 Status: 200 OK
✅ Sucesso! X colaboradores recebidos
```

Se vir isso ✅ = **Integração funcionando!**

## ❌ Se der erro, procure por:

```
❌ Tentativa 1 falhou: Failed to fetch
⏳ Aguardando 2s antes de tentar novamente...
🔄 Tentativa 2/3
```

Se ver isso, a API está temporariamente indisponível (espere e tente novamente).

## 🔍 Aba Network para Monitorar

1. F12 → Network
2. Limpe (Ctrl+L)
3. Tente cadastrar
4. Procure por requisições para `api-golpe-whatsapp.onrender.com`:
   - GET /colaboradores → Status 200 ✅
   - PUT /colaboradores/X → Status 200 ✅

## 📊 Fluxo Esperado

```
User: Clica "Criar Conta"
     ↓
Frontend: Valida formulário (Zod)
     ↓
Frontend: GET /colaboradores (com retry)
     ↓
Backend: Retorna lista
     ↓
Frontend: Procura pelo código
     ↓
Frontend: PUT /colaboradores/{id} (com retry)
     ↓
Backend: Atualiza nome + senha
     ↓
Frontend: POST /auth/signup (Supabase)
     ↓
Supabase: Cria usuário
     ↓
Frontend: Redireciona para /members ✅
```

## 🆘 Troubleshooting Rápido

| Erro | Causa | Solução |
|------|-------|---------|
| Failed to fetch | API offline | Aguarde ou testar em outro momento |
| 404 | Endpoint errado | Verificar URL da API |
| 500 | Erro no backend | Ver logs do servidor |
| CORS | Backend não permite | Adicionar CORS no backend |
| Status 200 mas erro | Resposta inválida | Ver o JSON retornado |

## 💡 Dicas

1. **Primeira requisição lenta?** Render.com faz sleep após inatividade. Primeira requisição acorda (~30s). Use retry automático.

2. **Quer ver todos os logs?** Procure no console por emojis:
   - 📡 = Iniciando
   - 🔄 = Retry
   - 📊 = Status
   - ✅ = Sucesso
   - ❌ = Erro

3. **Código não encontrado?** Veja qual código tem `"senha": null` no passo 1.

4. **"Cadastro já realizado"?** Significa que o código já tem senha. Use outro código.

---

**Pronto para testar?** Siga os passos acima e me diga qual foi o resultado! 🚀
