# 🔗 Integração Frontend ↔ Backend v2.0

## ✨ Melhorias Implementadas

### 1. **Retry Automático**
- Tenta 3 vezes para buscar colaboradores
- Tenta 2 vezes para atualizar
- Aguarda 2s entre tentativas
- Perfeito para APIs instáveis

### 2. **Timeout Configurável**
- Máximo 10 segundos por requisição
- Evita travar indefinidamente

### 3. **CORS Otimizado**
- `mode: 'cors'` configurado
- `credentials: 'omit'` para respostas abertas
- Headers explícitos

### 4. **Logs Detalhados**
Mostra em tempo real:
```
📡 Buscando colaboradores em: https://api-golpe-whatsapp.onrender.com/colaboradores
🔄 Tentativa 1/3
📊 Status: 200 OK
✅ Sucesso! 10 colaboradores recebidos
```

## 🎯 Como Testar Agora

### **1. Abra o console (F12)**

### **2. Cole este código:**
```javascript
// Teste a conexão
fetch("https://api-golpe-whatsapp.onrender.com/colaboradores", {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  mode: 'cors',
  credentials: 'omit'
})
.then(r => {
  console.log('Status:', r.status);
  return r.json();
})
.then(d => {
  console.log('✅ API Funcionando!');
  console.table(d);
})
.catch(e => console.error('❌ Erro:', e.message));
```

### **3. Pressione ENTER e aguarde**

Se funcionar, você verá:
```
✅ API Funcionando!
Tabela com todos os códigos
```

## 📋 Checklist

- [ ] API responde com Status 200
- [ ] Dados chegam em JSON
- [ ] Códigos aparecem na tabela
- [ ] Existe algum código sem senha (para cadastro)

## 🆘 Se der erro AINDA

**Causa 1: API está offline**
- Tente abrir direto: https://api-golpe-whatsapp.onrender.com/colaboradores
- Se não abrir, servidor está down

**Causa 2: CORS bloqueado**
- Backend precisa ter:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
  credentials: true
}));
```

**Causa 3: Firewall/VPN**
- Verifique se sua conexão está bloqueando

## 🚀 Próximo Passo

Uma vez confirmado que a API funciona, tente cadastrar:

1. Acesse http://localhost:5173 (seu frontend)
2. Vá para "Criar conta"
3. Insira um código válido (sem senha)
4. Se tudo der certo, você verá na aba "Network" a requisição GET funcionando

## 📊 Resumo das Mudanças

```typescript
// Antes:
fetch(URL) → 1 tentativa → Erro

// Agora:
fetch(URL) → Tentativa 1 → Falha?
           → Aguarda 2s
           → Tentativa 2 → Falha?
           → Aguarda 2s
           → Tentativa 3 → Falha?
           → Erro final
```

## 💡 Dica

Se a API do onrender.com estiver sleeping (sem uso), a primeira requisição vai ser lenta (~30s). As tentativas automáticas resolvem isso!

---

**Status**: ✅ Integração com Retry
**Build**: ✅ Passou
**Próximo**: Testar no navegador
