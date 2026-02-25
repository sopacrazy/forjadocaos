# 🚀 Guia de Instalação - Sistema RPG Multiplayer

## 📋 Pré-requisitos

- Conta no Supabase (https://supabase.com)
- Node.js instalado
- Projeto já configurado com Supabase

## 🗄️ Passo 1: Configurar Banco de Dados

### 1.1 Acessar o Painel do Supabase

1. Acesse https://supabase.com
2. Faça login na sua conta
3. Selecione seu projeto

### 1.2 Executar o Schema SQL

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Copie todo o conteúdo do arquivo `database/rpg_schema.sql`
4. Cole no editor SQL
5. Clique em **Run** (ou pressione Ctrl+Enter)

Aguarde a execução. Você deverá ver mensagens de sucesso.

### 1.3 Verificar Tabelas Criadas

1. Vá em **Table Editor** no menu lateral
2. Você deverá ver as seguintes tabelas:
   - `rpg_users`
   - `rpg_characters`
   - `rpg_messages`
   - `rpg_channels`

## 🔐 Passo 2: Configurar Autenticação

### 2.1 Habilitar Email Authentication

1. No painel do Supabase, vá em **Authentication** → **Providers**
2. Certifique-se de que **Email** está habilitado
3. Configure as opções:
   - ✅ Enable Email provider
   - ✅ Confirm email (opcional - desabilite para desenvolvimento)
   - ✅ Secure email change (recomendado)

### 2.2 Configurar Email Templates (Opcional)

Se quiser personalizar os emails de confirmação:

1. Vá em **Authentication** → **Email Templates**
2. Personalize os templates de:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

## ⚡ Passo 3: Habilitar Realtime

### 3.1 Ativar Realtime nas Tabelas

1. Vá em **Database** → **Replication**
2. Encontre as tabelas:
   - `rpg_messages`
   - `rpg_users`
3. Para cada tabela, clique no switch para **habilitar replication**

### 3.2 Verificar Configuração

Execute este SQL para verificar:

\`\`\`sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('rpg_users', 'rpg_characters', 'rpg_messages', 'rpg_channels');
\`\`\`

Todas as tabelas devem ter `rowsecurity = true`.

## 🔧 Passo 4: Atualizar Código da Aplicação

### 4.1 Atualizar App.tsx

Substitua a importação do RPGRoom:

\`\`\`tsx
// ANTES:
import RPGRoom from './components/RPGRoom';

// DEPOIS:
import RPGRoom from './components/RPGRoomSupabase';
\`\`\`

### 4.2 Verificar Configuração do Supabase

Verifique se o arquivo `lib/supabase.ts` está correto:

\`\`\`typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'SUA_URL_AQUI';
const supabaseKey = 'SUA_CHAVE_PUBLICA_AQUI';

export const supabase = createClient(supabaseUrl, supabaseKey);
\`\`\`

## 🧪 Passo 5: Testar o Sistema

### 5.1 Iniciar o Servidor

\`\`\`bash
npm run dev
\`\`\`

### 5.2 Testar Registro

1. Abra http://localhost:5173
2. Clique em "🎲 RPG"
3. Clique em "Registre-se"
4. Preencha:
   - Username: `teste1`
   - Email: `teste1@example.com`
   - Senha: `123456`
   - Confirmar Senha: `123456`
5. Clique em "Criar Conta"

### 5.3 Criar Personagem

1. Preencha a ficha do personagem
2. Distribua os pontos de atributos
3. Confirme

### 5.4 Testar Chat

1. Digite uma mensagem no chat
2. Pressione Enter
3. A mensagem deve aparecer instantaneamente

### 5.5 Testar Multiplayer

**Em outra aba/janela anônima:**

1. Abra http://localhost:5173
2. Clique em "🎲 RPG"
3. Registre outro usuário:
   - Username: `teste2`
   - Email: `teste2@example.com`
   - Senha: `123456`
4. Crie outro personagem
5. Digite mensagens

**Resultado esperado:**
- As mensagens devem aparecer em tempo real nas duas janelas
- Você deve ver "2 online" no contador
- Os usuários devem aparecer na lista de online

## 🔍 Passo 6: Verificar Dados no Banco

### 6.1 Verificar Usuários

\`\`\`sql
SELECT * FROM rpg_users;
\`\`\`

Você deve ver os usuários criados.

### 6.2 Verificar Personagens

\`\`\`sql
SELECT * FROM rpg_characters;
\`\`\`

Você deve ver os personagens criados.

### 6.3 Verificar Mensagens

\`\`\`sql
SELECT 
    m.*,
    u.username,
    c.nome as character_name
FROM rpg_messages m
JOIN rpg_users u ON u.id = m.user_id
LEFT JOIN rpg_characters c ON c.user_id = u.id
ORDER BY m.created_at DESC
LIMIT 20;
\`\`\`

Você deve ver as mensagens enviadas.

## 🐛 Solução de Problemas

### Erro: "Failed to fetch"

**Causa:** Supabase URL ou Key incorretos

**Solução:**
1. Verifique `lib/supabase.ts`
2. Copie novamente a URL e Key do painel do Supabase
3. Vá em **Settings** → **API**

### Erro: "Row Level Security"

**Causa:** RLS não configurado corretamente

**Solução:**
1. Execute novamente o schema SQL completo
2. Verifique se as políticas foram criadas:

\`\`\`sql
SELECT * FROM pg_policies WHERE tablename IN ('rpg_users', 'rpg_characters', 'rpg_messages');
\`\`\`

### Mensagens não aparecem em tempo real

**Causa:** Realtime não habilitado

**Solução:**
1. Vá em **Database** → **Replication**
2. Habilite replication para `rpg_messages` e `rpg_users`

### Erro ao criar usuário: "Email already registered"

**Causa:** Email já existe no banco

**Solução:**
1. Use outro email
2. Ou delete o usuário existente:

\`\`\`sql
-- Cuidado! Isso deleta TODOS os dados relacionados
DELETE FROM rpg_users WHERE email = 'teste1@example.com';
\`\`\`

### Usuários não aparecem como online

**Causa:** Função de presença não executada

**Solução:**
1. Verifique se as funções foram criadas:

\`\`\`sql
SELECT * FROM pg_proc WHERE proname IN ('set_user_online', 'set_user_offline');
\`\`\`

2. Se não existirem, execute novamente a parte de funções do schema

## 📊 Monitoramento

### Ver Logs em Tempo Real

No painel do Supabase:
1. Vá em **Logs** → **Postgres Logs**
2. Filtre por `rpg_` para ver apenas logs do RPG

### Ver Conexões Ativas

\`\`\`sql
SELECT * FROM pg_stat_activity WHERE datname = current_database();
\`\`\`

### Ver Estatísticas de Uso

\`\`\`sql
-- Total de usuários
SELECT COUNT(*) as total_users FROM rpg_users;

-- Usuários online
SELECT COUNT(*) as online_users FROM rpg_users WHERE is_online = true;

-- Total de mensagens
SELECT COUNT(*) as total_messages FROM rpg_messages;

-- Mensagens por canal
SELECT channel, COUNT(*) as message_count 
FROM rpg_messages 
GROUP BY channel 
ORDER BY message_count DESC;
\`\`\`

## 🎯 Próximos Passos

Após a instalação bem-sucedida:

1. ✅ Testar com múltiplos usuários
2. ✅ Implementar sistema de missões
3. ✅ Implementar sistema de batalhas
4. ✅ Adicionar sistema de inventário
5. ✅ Implementar sistema de guilda
6. ✅ Adicionar notificações push
7. ✅ Implementar sistema de níveis/XP

## 📚 Recursos Adicionais

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs do navegador (F12 → Console)
2. Verifique os logs do Supabase
3. Revise este guia passo a passo
4. Verifique se todas as tabelas foram criadas
5. Verifique se o Realtime está habilitado

---

**Desenvolvido para Forja do Caos: Academia do Equilíbrio** 🔥
