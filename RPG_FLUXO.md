# 🎮 Fluxo do Sistema RPG - Guia Visual

```
┌─────────────────────────────────────────────────────────────────┐
│                    USUÁRIO CLICA EM "🎲 RPG"                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     TELA DE AUTENTICAÇÃO                        │
│                                                                 │
│  ┌──────────────┐              ┌──────────────┐                │
│  │    LOGIN     │              │   REGISTRO   │                │
│  ├──────────────┤              ├──────────────┤                │
│  │ • Email      │              │ • Username   │                │
│  │ • Senha      │              │ • Email      │                │
│  │              │              │ • Senha      │                │
│  │ [Entrar]     │              │ • Confirmar  │                │
│  │              │              │ [Criar Conta]│                │
│  └──────────────┘              └──────────────┘                │
└─────────────────────────────────────────────────────────────────┘
           ↓                                ↓
    ┌──────────────┐                 ┌──────────────┐
    │ Tem Personagem?│                │ Novo Usuário │
    └──────────────┘                 └──────────────┘
           ↓                                ↓
      ┌────┴────┐                          │
      │         │                          │
    SIM        NÃO ←────────────────────────┘
      │         │
      │         ↓
      │  ┌─────────────────────────────────────────────────────┐
      │  │        CRIAÇÃO DE PERSONAGEM (4 ETAPAS)             │
      │  │                                                     │
      │  │  ETAPA 1: Informações Básicas                      │
      │  │  • Nome, Sexo, Idade, Raça, Origem                 │
      │  │                                                     │
      │  │  ETAPA 2: Atributos                                │
      │  │  • Distribuir 10 pontos (FOR, DES, INT, VEL)       │
      │  │  • Rank (E, D, C, B, A, S, SS)                     │
      │  │                                                     │
      │  │  ETAPA 3: História e Habilidades                   │
      │  │  • História do personagem                          │
      │  │  • 3 Habilidades iniciais                          │
      │  │                                                     │
      │  │  ETAPA 4: Revisão                                  │
      │  │  • Confirmar dados                                 │
      │  │                                                     │
      │  └─────────────────────────────────────────────────────┘
      │                       ↓
      └───────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SALA RPG (ESTILO DISCORD)                    │
│                                                                 │
│  ┌──────────┐  ┌─────────────────────┐  ┌─────────────────┐   │
│  │ SIDEBAR  │  │    CHAT PRINCIPAL   │  │   PERSONAGEM    │   │
│  │ ESQUERDA │  │                     │  │   (SIDEBAR)     │   │
│  ├──────────┤  ├─────────────────────┤  ├─────────────────┤   │
│  │ FORJA RPG│  │ # geral             │  │ [Avatar]        │   │
│  │          │  │                     │  │ Nome            │   │
│  │ Canais:  │  │ Mensagens:          │  │ Raça • Sexo     │   │
│  │ # geral  │  │ ┌─────────────────┐ │  │                 │   │
│  │ 📖 missões│  │ │ Mestre do RPG   │ │  │ Rank: E         │   │
│  │ ⚔️ batalhas│ │ │ Bem-vindo!      │ │  │ Nível: 1        │   │
│  │ 🛡️ guilda │  │ └─────────────────┘ │  │ PV: 10/10       │   │
│  │          │  │                     │  │                 │   │
│  │ ────────│  │ [Input mensagem]    │  │ Atributos:      │   │
│  │ [Avatar] │  │ [Enviar]            │  │ 💪 FOR: 3       │   │
│  │ Username │  │                     │  │ 🎯 DES: 2       │   │
│  │ Rank E   │  │                     │  │ 🧠 INT: 3       │   │
│  └──────────┘  └─────────────────────┘  │ ⚡ VEL: 2       │   │
│                                         └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Armazenamento de Dados (localStorage)

```javascript
// Estrutura de dados armazenada:

rpg_users: [
  {
    id: "1234567890",
    email: "usuario@email.com",
    password: "senha123",
    username: "Aventureiro",
    createdAt: "2026-02-11T15:00:00.000Z",
    hasCharacter: true,
    character: {
      nome: "Thorin",
      sexo: "Masculino",
      idade: "25",
      raca: "Anão",
      origem: "Montanhas do Norte",
      rank: "E",
      nivel: 1,
      forca: 5,
      destreza: 2,
      inteligencia: 1,
      velocidade: 2,
      pvMaximo: 15,
      pvAtual: 15,
      // ... outros dados
    },
    color: "#8B5CF6"
  }
]
```

## 🔄 Fluxo de Estados (React)

```
RPGRoom Component
├── isAuthenticated (false → true após login/registro)
├── showAuth (true → false após autenticação)
├── showRegistration (false → true se não tiver personagem)
├── hasCharacter (false → true após criar personagem)
└── currentUser (null → objeto com dados do usuário)

Fluxo:
1. showAuth = true → Mostra RPGAuth
2. Login/Registro → isAuthenticated = true, showAuth = false
3. Se !hasCharacter → showRegistration = true
4. Criar personagem → hasCharacter = true, showRegistration = false
5. Mostra sala de chat
```

## 🎯 Validações Implementadas

### Login:
- ✅ Email não vazio
- ✅ Senha não vazia
- ✅ Email válido (regex)
- ✅ Credenciais corretas (verificação no localStorage)

### Registro:
- ✅ Todos os campos preenchidos
- ✅ Email válido (regex)
- ✅ Senha mínimo 6 caracteres
- ✅ Senhas coincidem
- ✅ Email não duplicado

### Criação de Personagem:
- ✅ Nome obrigatório
- ✅ Sexo obrigatório
- ✅ Raça obrigatória
- ✅ Distribuição correta de pontos (máximo 10)
- ✅ Valores de atributos não negativos

## 🚀 Próximos Passos Recomendados

1. **Integração com Supabase**
   - Substituir localStorage por banco de dados real
   - Implementar autenticação segura (JWT)
   - Hash de senhas (bcrypt)

2. **Chat em Tempo Real**
   - WebSockets ou Supabase Realtime
   - Múltiplos usuários simultâneos
   - Notificações de mensagens

3. **Sistema de Canais**
   - Implementar troca de canais
   - Mensagens separadas por canal
   - Permissões de acesso

4. **Sistema de Missões**
   - Criar/aceitar missões
   - Recompensas (XP, dinheiro)
   - Progresso de missões

5. **Sistema de Batalhas**
   - Combate por turnos
   - Uso de habilidades
   - Cálculo de dano baseado em atributos
