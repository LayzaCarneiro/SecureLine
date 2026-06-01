# 🐛 GUIA DE DEBUG - Problema ao Verificar Código

## ❌ Erro: "Não foi possível verificar o código"

Se você está vendo essa mensagem, use este guia para descobrir o problema.

## 🔧 PASSO 1: Abrir o Console de Debug

1. Abra o navegador na página de cadastro
2. Pressione **F12** (ou Ctrl+Shift+I no Windows)
3. Vá para a aba **Console**
4. Copie todo o código abaixo e cole no console:

```javascript
// ============================================
// TESTE RÁPIDO DA API
// ============================================

console.log("🔍 INICIANDO DEBUG DE CÓDIGO...\n");

// 1️⃣ Verificar se a API está online
console.log("📡 TESTE 1: Verificando se API está online...");
fetch("https://api-golpe-whatsapp.onrender.com/colaboradores")
  .then((res) => {
    console.log("✅ API respondeu com status:", res.status);
    console.log("📊 Headers:", {
      "content-type": res.headers.get("content-type"),
      "access-control": res.headers.get("access-control-allow-origin"),
    });
    return res.json();
  })
  .then((dados) => {
    console.log("✅ SUCESSO! Dados recebidos:");
    console.table(dados);
    console.log("\n📋 CÓDIGOS DISPONÍVEIS:");
    dados.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.codigo_colaborador} (ID: ${c.id}) - Senha: ${c.senha ? "SIM" : "NÃO"}`);
    });
  })
  .catch((err) => {
    console.error("❌ ERRO ao buscar API:");
    console.error("Mensagem:", err.message);
    
    if (err.message.includes("Failed to fetch")) {
      console.warn("\n⚠️ POSSÍVEIS CAUSAS:");
      console.warn("1. API está offline");
      console.warn("2. Problema de conexão");
      console.warn("3. Bloqueio de CORS");
    }
  });

// Espera um pouco e testa código específico
setTimeout(async () => {
  console.log("\n📝 TESTE 2: Procurando código 'TEST'...");
  try {
    const res = await fetch("https://api-golpe-whatsapp.onrender.com/colaboradores");
    const dados = await res.json();
    const teste = dados.find(c => c.codigo_colaborador === "TEST");
    
    if (teste) {
      console.log("✅ Encontrado!");
      console.table(teste);
    } else {
      console.warn("⚠️ Código TEST não existe");
    }
  } catch (e) {
    console.error("❌ Erro:", e.message);
  }
}, 1000);

// Função auxiliar
window.debugCode = async (codigo) => {
  console.log(`\n🔍 Procurando: ${codigo}`);
  try {
    const res = await fetch("https://api-golpe-whatsapp.onrender.com/colaboradores");
    const dados = await res.json();
    const encontrado = dados.find(c => c.codigo_colaborador.toUpperCase() === codigo.toUpperCase());
    
    if (encontrado) {
      console.log("✅ ENCONTRADO!");
      console.table(encontrado);
    } else {
      console.warn("❌ Código não encontrado");
      console.log("Códigos disponíveis:", dados.map(c => c.codigo_colaborador));
    }
  } catch (e) {
    console.error("❌ Erro:", e.message);
  }
};

console.log("\n💡 Use: window.debugCode('SEU_CODIGO')");
```

## 📋 O que Procurar nos Logs

### ✅ Se ver isso, está tudo OK:
```
✅ API respondeu com status: 200
✅ SUCESSO! Dados recebidos:
✅ Colaboradores recebidos: X registros
```

### ❌ Se ver isso, há um problema:

**Erro: "Failed to fetch"**
- API está offline ou inativa
- Problema de conexão de internet
- Firewall ou VPN bloqueando

**Erro: "CORS"**
- Problema de segurança entre domínios
- API não permite requisições do seu site

**Status: 404**
- URL da API está errada
- Endpoint não existe

**Status: 500**
- Erro interno do servidor
- API está com problema

## 🔍 PASSO 2: Verificar Códigos Disponíveis

Após executar o código acima, procure na tabela por:

```
codigo_colaborador | id | Senha
    TEST           | 3  | NÃO     ← ✅ Pode usar
    ADMIN          | 1  | SIM     ← ❌ Já tem senha
```

**Use um código que tenha "NÃO" na coluna Senha**

## 💡 PASSO 3: Testar Código Específico

No console, digite:
```javascript
window.debugCode('SEU_CODIGO')
```

Exemplo:
```javascript
window.debugCode('TEST')
```

Você verá:
- ✅ Se encontrou o código
- ❌ Se o código não existe
- ⚠️ Se o código já tem senha

## 🆘 Se AINDA Não Funcionar

### Verificar Aba Network
1. F12 → Network
2. Recarregue a página
3. Procure por requisições para `api-golpe-whatsapp.onrender.com`
4. Clique nela e veja:
   - Status (deve ser 200)
   - Response (dados em JSON)
   - Headers (verify Content-Type)

### Testar URL Diretamente
Abra em uma aba nova:
```
https://api-golpe-whatsapp.onrender.com/colaboradores
```

Se retornar dados em JSON ✅, a API está OK.

### Procurar por Erros de CORS
Se ver no console:
```
Access to fetch at 'https://api-golpe-whatsapp.onrender.com/colaboradores' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

Isso significa que a API não permite requisições do seu site. Você pode:
1. Usar um proxy/VPN
2. Contatar o admin da API
3. Adicionar seu domínio à whitelist da API

## 📞 Informações para Relatar Problema

Se precisar relatar o erro, copie e envie:

```
📋 INFORMAÇÕES DO ERRO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status da API: [ ]
Mensagem de erro: [ ]
Códigos disponíveis: [ ]
Código que testou: [ ]
URL do navegador: [ ]
Tipo de erro (CORS/timeout/404): [ ]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## ✅ Checklist Final

- [ ] Console aberto (F12)
- [ ] Código de debug executado
- [ ] API retornou dados
- [ ] Códigos aparecem na tabela
- [ ] Código testado não tem senha (coluna "Senha" = NÃO)
- [ ] Conexão de internet OK
- [ ] Sem erros de CORS no console
- [ ] Tenta usar um código válido

Se tudo passou ✅, o sistema deve funcionar!

---

**Última atualização**: 2026-06-01
