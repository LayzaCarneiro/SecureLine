export interface QuizMessage {
  id: string;
  sender: "scammer" | "system";
  text: string;
  time: string;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
}

export interface LearningPoint {
  title: string;
  description: string;
}

export interface QuizScenario {
  id: number;
  title: string;
  scamType: string;
  contactName: string;
  contactAvatar: string;
  messages: QuizMessage[];
  question: string;
  options: QuizOption[];
  explanation: string;

  warningSigns: LearningPoint[];
  correctActions: string[];
  nextTips: string[];
}

const scenarios: QuizScenario[] = [
  {
    id: 1,
    title: "Mensagem do banco",
    scamType: "Phishing",
    contactName: "Banco Seguro",
    contactAvatar: "🏦",
    messages: [
      {
        id: "1a",
        sender: "scammer",
        text: "⚠️ URGENTE: Detectamos uma atividade suspeita na sua conta. Clique no link abaixo para verificar imediatamente ou sua conta será bloqueada em 2 horas!",
        time: "10:32",
      },
      {
        id: "1b",
        sender: "scammer",
        text: "https://banco-seguroo.verify-conta.xyz/login",
        time: "10:32",
      },
    ],
    question: "O que você faria ao receber essa mensagem?",
    options: [
      {
        id: "1a",
        text: "Clicar no link para verificar minha conta",
        isCorrect: false,
        feedback: "Nunca clique em links recebidos por mensagem! Bancos não enviam links para verificação por WhatsApp.",
      },
      {
        id: "1b",
        text: "Ignorar e ligar diretamente para o banco",
        isCorrect: true,
        feedback: "Correto! Sempre confirme diretamente com seu banco usando o número oficial.",
      },
      {
        id: "1c",
        text: "Responder pedindo mais informações",
        isCorrect: false,
        feedback: "Responder confirma que seu número está ativo e pode gerar mais golpes.",
      },
    ],
    explanation: "Bancos nunca pedem dados pessoais ou enviam links por WhatsApp. Note o domínio suspeito 'verify-conta.xyz' e o senso de urgência — sinais clássicos de phishing.",
    // Cenário 1
    warningSigns: [
      {
        title: "Senso de urgência",
        description:
          'A frase "sua conta será bloqueada em 2 horas" tenta pressionar você a agir sem pensar.',
      },
      {
        title: "Link suspeito",
        description:
          "O domínio verify-conta.xyz não pertence ao banco oficial.",
      },
      {
        title: "Solicitação incomum",
        description:
          "Bancos normalmente não enviam links de validação por WhatsApp.",
      },
    ],

    correctActions: [
      "Ignorar o link recebido.",
      "Não informar dados pessoais.",
      "Abrir o aplicativo oficial do banco.",
      "Entrar em contato com o banco pelos canais oficiais.",
    ],

    nextTips: [
      "Verifique sempre o domínio do link.",
      "Desconfie de mensagens urgentes.",
      "Confirme informações diretamente com a instituição.",
    ],
  },
  {
    id: 2,
    title: "Amigo pedindo dinheiro",
    scamType: "Clonagem de WhatsApp",
    contactName: "Carlos (Trabalho)",
    contactAvatar: "👤",
    messages: [
      {
        id: "2a",
        sender: "scammer",
        text: "Oi! Tudo bem? Troquei de número, salva aí o novo",
        time: "14:15",
      },
      {
        id: "2b",
        sender: "scammer",
        text: "Preciso de um favor urgente. Pode me fazer um Pix de R$ 950? Meu app do banco tá dando problema. Devolvo amanhã sem falta!",
        time: "14:16",
      },
      {
        id: "2c",
        sender: "scammer",
        text: "Chave Pix: 11999887766",
        time: "14:16",
      },
    ],
    question: "Seu colega de trabalho pede dinheiro por um número novo. O que fazer?",
    options: [
      {
        id: "2a",
        text: "Fazer o Pix, afinal é meu colega",
        isCorrect: false,
        feedback: "Nunca transfira dinheiro sem confirmar a identidade da pessoa por outro meio!",
      },
      {
        id: "2b",
        text: "Ligar para o número antigo do Carlos para confirmar",
        isCorrect: true,
        feedback: "Correto! Sempre confirme a identidade ligando para o número que você já tem salvo.",
      },
      {
        id: "2c",
        text: "Pedir uma selfie para confirmar",
        isCorrect: false,
        feedback: "Golpistas podem usar fotos roubadas. A ligação é a forma mais segura de verificar.",
      },
    ],
    explanation: "Na clonagem de WhatsApp, criminosos usam a foto e nome de conhecidos. A melhor defesa é confirmar por ligação no número antigo.",
    // Cenário 2
    warningSigns: [
      {
        title: "Número desconhecido",
        description:
          "A mensagem veio de um número diferente do contato que você já conhece.",
      },
      {
        title: "Pedido de dinheiro",
        description:
          "Solicitações de Pix devem sempre ser confirmadas por outro canal.",
      },
      {
        title: "Pressão emocional",
        description:
          "O pedido urgente tenta fazer você agir rapidamente sem verificar.",
      },
    ],

    correctActions: [
      "Ligar para o número antigo do contato.",
      "Confirmar a identidade da pessoa.",
      "Desconfiar de pedidos financeiros inesperados.",
      "Só realizar transferências após confirmação.",
    ],

    nextTips: [
      "Desconfie de contatos que mudam de número repentinamente.",
      "Confirme pedidos de dinheiro por ligação.",
      "Nunca tome decisões financeiras apenas por mensagem.",
    ],
  },
  {
    id: 3,
    title: "Promoção imperdível",
    scamType: "Links Maliciosos",
    contactName: "Promoções TOP 🔥",
    contactAvatar: "🎁",
    messages: [
      {
        id: "3a",
        sender: "scammer",
        text: "🎉 PARABÉNS! Você foi selecionado para ganhar um iPhone 15 Pro! É só preencher o formulário rápido 👇",
        time: "09:45",
      },
      {
        id: "3b",
        sender: "scammer",
        text: "https://promo-iphone15gratis.com/formulario\n\n⏰ Oferta válida por apenas 30 minutos!",
        time: "09:45",
      },
    ],
    question: "Você recebeu uma promoção de um número desconhecido. Qual sua reação?",
    options: [
      {
        id: "3a",
        text: "Preencher o formulário rápido, antes que acabe!",
        isCorrect: false,
        feedback: "Formulários falsos coletam seus dados pessoais para uso em fraudes.",
      },
      {
        id: "3b",
        text: "Encaminhar para amigos para que também ganhem",
        isCorrect: false,
        feedback: "Ao encaminhar, você ajuda a espalhar o golpe e coloca seus contatos em risco.",
      },
      {
        id: "3c",
        text: "Deletar a mensagem e bloquear o contato",
        isCorrect: true,
        feedback: "Correto! Promoções legítimas não chegam por WhatsApp de números desconhecidos.",
      },
    ],
    explanation: "Promoções 'boas demais para ser verdade' são armadilhas. O prazo curto é uma tática para impedir que você pense com calma.",
    // Cenário 3
    warningSigns: [
      {
        title: "Oferta boa demais para ser verdade",
        description:
          "Ganhar um produto caro sem participar de nenhuma promoção é suspeito.",
      },
      {
        title: "Prazo artificial",
        description:
          "A oferta válida por poucos minutos serve para gerar pressão.",
      },
      {
        title: "Link desconhecido",
        description:
          "O site não possui relação com uma empresa confiável.",
      },
    ],

    correctActions: [
      "Não clicar no link.",
      "Não preencher formulários desconhecidos.",
      "Bloquear ou denunciar o contato.",
      "Ignorar promoções suspeitas.",
    ],

    nextTips: [
      "Desconfie de prêmios inesperados.",
      "Pesquise a empresa antes de fornecer dados.",
      "Nunca informe dados pessoais em links recebidos por mensagem.",
    ],
  },
  {
    id: 4,
    title: "Código de verificação",
    scamType: "Roubo de Conta",
    contactName: "+55 11 9876-5432",
    contactAvatar: "📱",
    messages: [
      {
        id: "4a",
        sender: "scammer",
        text: "Olá! Sou do suporte do WhatsApp. Detectamos uma tentativa de invasão na sua conta.",
        time: "16:20",
      },
      {
        id: "4b",
        sender: "scammer",
        text: "Para proteger sua conta, precisamos que nos envie o código de 6 dígitos que você vai receber por SMS agora.",
        time: "16:21",
      },
    ],
    question: "Alguém pedindo seu código de verificação. O que fazer?",
    options: [
      {
        id: "4a",
        text: "Enviar o código para proteger minha conta",
        isCorrect: false,
        feedback: "Ao enviar o código, você dá acesso total à sua conta ao golpista!",
      },
      {
        id: "4b",
        text: "Ignorar completamente e nunca compartilhar o código",
        isCorrect: true,
        feedback: "Correto! O WhatsApp NUNCA pede códigos de verificação por mensagem.",
      },
      {
        id: "4c",
        text: "Pedir o nome completo do atendente para verificar",
        isCorrect: false,
        feedback: "O golpista inventará um nome falso. O WhatsApp não entra em contato dessa forma.",
      },
    ],
    explanation: "O código de verificação é a chave da sua conta. O WhatsApp nunca solicita esse código. Com ele, golpistas assumem total controle do seu WhatsApp.",
    // Cenário 4
    warningSigns: [
      {
        title: "Falso suporte técnico",
        description:
          "Empresas não entram em contato pedindo códigos de verificação.",
      },
      {
        title: "Pedido de código",
        description:
          "O código recebido por SMS é pessoal e intransferível.",
      },
      {
        title: "Uso de autoridade",
        description:
          'O golpista se apresenta como "suporte" para ganhar confiança.',
      },
    ],

    correctActions: [
      "Nunca compartilhar códigos recebidos por SMS.",
      "Ignorar a solicitação.",
      "Ativar a verificação em duas etapas.",
      "Bloquear o contato suspeito.",
    ],

    nextTips: [
      "Códigos de verificação são secretos.",
      "Nenhuma empresa legítima pede esses códigos.",
      "Desconfie de mensagens alegando invasão da conta.",
    ],
  },
  {
    id: 5,
    title: "Falso fornecedor",
    scamType: "Falso Suporte",
    contactName: "Fornecedor Silva LTDA",
    contactAvatar: "🏢",
    messages: [
      {
        id: "5a",
        sender: "scammer",
        text: "Bom dia! Aqui é da Silva Materiais. Mudamos nossos dados bancários.",
        time: "08:10",
      },
      {
        id: "5b",
        sender: "scammer",
        text: "O boleto do mês que vem já deve ser pago na nova conta:\n\nBanco: 000\nAg: 1234\nConta: 56789-0\nCNPJ: 12.345.678/0001-99",
        time: "08:11",
      },
      {
        id: "5c",
        sender: "scammer",
        text: "Favor confirmar o recebimento 🙏",
        time: "08:11",
      },
    ],
    question: "Um fornecedor avisa que mudou os dados bancários. Qual a melhor atitude?",
    options: [
      {
        id: "5a",
        text: "Anotar os novos dados e pagar na nova conta",
        isCorrect: false,
        feedback: "Golpistas se passam por fornecedores para desviar pagamentos. Sempre confirme por outro canal!",
      },
      {
        id: "5b",
        text: "Ligar para o fornecedor no telefone que você já tem",
        isCorrect: true,
        feedback: "Correto! Mudanças de dados bancários devem ser confirmadas por telefone ou presencialmente.",
      },
      {
        id: "5c",
        text: "Responder confirmando o recebimento",
        isCorrect: false,
        feedback: "Confirmar sem verificar pode resultar em pagamentos desviados.",
      },
    ],
    explanation: "Golpes de falso fornecedor são comuns em empresas. Sempre confirme alterações bancárias por telefone ou pessoalmente, usando contatos que você já possui.",
    // Cenário 5
    warningSigns: [
      {
        title: "Mudança bancária inesperada",
        description:
          "Alterações de conta para pagamento exigem validação adicional.",
      },
      {
        title: "Solicitação por mensagem",
        description:
          "Dados bancários enviados apenas por mensagem podem ser falsos.",
      },
      {
        title: "Ausência de confirmação formal",
        description:
          "Mudanças financeiras importantes normalmente seguem processos formais.",
      },
    ],

    correctActions: [
      "Ligar para o fornecedor usando um contato já conhecido.",
      "Confirmar os novos dados bancários.",
      "Validar a solicitação com outro responsável.",
      "Não realizar pagamentos sem confirmação.",
    ],

    nextTips: [
      "Sempre confirme alterações bancárias por outro canal.",
      "Desconfie de mudanças repentinas de conta.",
      "Valide informações financeiras antes de efetuar pagamentos.",
    ],
  },
];

export default scenarios;
