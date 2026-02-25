# 🎲 Sistema RPG - Forja do Caos

## 📋 Descrição

Sistema completo de RPG integrado ao projeto Forja do Caos, com sala de chat estilo Discord e sistema de criação de personagens baseado em fichas completas.

## ✨ Funcionalidades Implementadas

### 1. **Acesso RPG**
- Botão "🎲 RPG" adicionado na navegação principal
- Acesso rápido e intuitivo para entrar na sala

### 2. **Sistema de Autenticação**
Sistema completo de Login e Registro:

#### **Login**
- Email
- Senha
- Validação de credenciais
- Recuperação de personagem existente

#### **Registro**
- Nome de usuário
- Email (com validação)
- Senha (mínimo 6 caracteres)
- Confirmação de senha
- Verificação de email duplicado

### 3. **Modal de Inscrição de Personagem**
Sistema de criação de personagem em 4 etapas (após autenticação):

#### **Passo 1: Informações Básicas**
- Nome (obrigatório)
- Sexo (obrigatório)
- Idade
- Raça/Espécie (obrigatório)
- Origem (Deus, Religião, Entidade)

#### **Passo 2: Progressão e Atributos**
- Seleção de Rank (E, D, C, B, A, S, SS)
- Sistema de distribuição de pontos de atributos (10 pontos iniciais):
  - 💪 Força (FOR)
  - 🎯 Destreza (DES)
  - 🧠 Inteligência (INT)
  - ⚡ Velocidade (VEL)
- Cálculo automático de PV (10 + FOR)

#### **Passo 3: História e Habilidades**
- Campo de história do personagem
- 3 slots de habilidades iniciais com custo de PE
- Campo de observações (bênçãos, maldições, etc.)

#### **Passo 4: Revisão Final**
- Visualização completa dos dados antes de confirmar
- Confirmação e entrada automática na sala

### 3. **Sala RPG - Estilo Discord**

#### **Layout Responsivo**
- Design adaptado para desktop e mobile
- Interface moderna e intuitiva

#### **Sidebar Esquerda (Desktop)**
- Header com logo "FORJA RPG"
- Canais de texto:
  - # geral (ativo)
  - 📖 missões
  - ⚔️ batalhas
  - 🛡️ guilda
- Informações do usuário logado (avatar, nome, rank)

#### **Área Central - Chat**
- Header com nome do canal e contador de usuários online
- Sistema de mensagens em tempo real
- Avatares coloridos únicos para cada usuário
- Timestamp nas mensagens
- Input de mensagem com botão de envio
- Suporte para Enter (enviar) e Shift+Enter (nova linha)
- Mensagem de boas-vindas automática do "Mestre do RPG"

#### **Sidebar Direita (Desktop)**
- Card do personagem com:
  - Avatar colorido
  - Nome, raça e sexo
  - Rank e nível
  - PV atual/máximo
- Painel de atributos (FOR, DES, INT, VEL)

## 🎨 Design

### Paleta de Cores
- Background principal: Slate 950/900
- Destaques: Purple 500/600
- Texto: White/Slate 300
- Avatares: 8 cores vibrantes aleatórias

### Componentes Visuais
- Bordas arredondadas
- Efeitos de hover suaves
- Gradientes sutis
- Backdrop blur para profundidade
- Animações de transição

## 📱 Responsividade

### Mobile
- Sidebar esquerda oculta em telas pequenas
- Sidebar direita oculta (apenas desktop)
- Chat em tela cheia
- Botões e inputs otimizados para toque
- Texto e espaçamentos ajustados

### Desktop
- Layout de 3 colunas
- Todas as sidebars visíveis
- Experiência completa

## 🔧 Arquivos Criados

1. **`components/RPGAuth.tsx`**
   - Sistema de Login e Registro
   - Validação de email e senha
   - Integração com localStorage
   - Toggle entre login e registro

2. **`components/RPGRoom.tsx`**
   - Componente principal da sala RPG
   - Gerenciamento de autenticação e fluxo
   - Interface estilo Discord

3. **`components/CharacterRegistrationModal.tsx`**
   - Modal de criação de personagem
   - Sistema de 4 etapas
   - Validação de dados
   - Distribuição de pontos de atributos

4. **Modificações em `App.tsx`**
   - Import dos novos componentes
   - Estado `isRPGRoomOpen`
   - Botão RPG na navegação
   - Renderização do componente RPGRoom

## 🚀 Como Usar

### Fluxo Completo:

1. **Acessar a Sala RPG**
   - Clique no botão "🎲 RPG" na navegação superior

2. **Autenticação**
   
   **Novo Usuário (Registro):**
   - Clique em "Registre-se"
   - Preencha: Nome de usuário, Email, Senha, Confirmar senha
   - Clique em "Criar Conta"
   - Você será direcionado para criar seu personagem
   
   **Usuário Existente (Login):**
   - Digite seu Email e Senha
   - Clique em "Entrar"
   - Se já tiver personagem, vai direto para a sala
   - Se não tiver, vai para criação de personagem

3. **Criar Personagem** (apenas na primeira vez ou após registro)
   - **Passo 1:** Preencha Nome, Sexo, Raça (obrigatórios)
   - **Passo 2:** Distribua seus 10 pontos de atributos
   - **Passo 3:** Adicione história e habilidades (opcional)
   - **Passo 4:** Revise e confirme

4. **Interagir na Sala**
   - Digite mensagens no chat
   - Veja informações do seu personagem na sidebar direita
   - Explore os diferentes canais (em breve)

## 📝 Próximas Melhorias

- [ ] Integração com backend (Supabase)
- [ ] Persistência de personagens
- [ ] Sistema de múltiplos canais funcionais
- [ ] Sistema de missões integrado
- [ ] Sistema de batalhas
- [ ] Sistema de guilda
- [ ] Notificações em tempo real
- [ ] Sistema de níveis e XP
- [ ] Inventário de itens
- [ ] Sistema de economia (dinheiro)

## 🎮 Controles

- **Enter**: Enviar mensagem
- **Shift + Enter**: Nova linha (desktop)
- **Botão Enviar**: Enviar mensagem (mobile)

## 💡 Observações

- **Autenticação**: Sistema usa localStorage para armazenar usuários e personagens
- **Persistência**: Dados de login e personagens persistem entre sessões (localStorage)
- **Mensagens**: Armazenadas apenas no estado local (não persistem após reload)
- **Cores**: Cada usuário recebe uma cor aleatória ao criar personagem
- **Validação**: Sistema valida email, senha e campos obrigatórios
- **Segurança**: Senhas são armazenadas em texto simples no localStorage (apenas para desenvolvimento)
  - ⚠️ **IMPORTANTE**: Em produção, usar backend com hash de senhas (bcrypt) e autenticação JWT

---

**Desenvolvido para o projeto Forja do Caos: Academia do Equilíbrio** 🔥
