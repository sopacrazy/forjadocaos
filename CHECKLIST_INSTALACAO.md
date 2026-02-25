# ✅ Checklist de Instalação - RPG Multiplayer

## 📋 Checklist Rápido

### 1. Configuração do Supabase

- [ ] Acessar https://supabase.com
- [ ] Fazer login no projeto
- [ ] Ir em **SQL Editor**
- [ ] Copiar conteúdo de `database/rpg_schema.sql`
- [ ] Colar no editor e executar (Run)
- [ ] Verificar se 4 tabelas foram criadas:
  - [ ] `rpg_users`
  - [ ] `rpg_characters`
  - [ ] `rpg_messages`
  - [ ] `rpg_channels`

### 2. Habilitar Realtime

- [ ] Ir em **Database** → **Replication**
- [ ] Habilitar replication para:
  - [ ] `rpg_messages`
  - [ ] `rpg_users`

### 3. Configurar Autenticação

- [ ] Ir em **Authentication** → **Providers**
- [ ] Verificar se **Email** está habilitado
- [ ] (Opcional) Desabilitar "Confirm email" para desenvolvimento

### 4. Verificar Configuração

- [ ] Abrir `lib/supabase.ts`
- [ ] Verificar se URL e Key estão corretos
- [ ] Se necessário, copiar novamente de **Settings** → **API**

### 5. Testar o Sistema

- [ ] Executar `npm run dev`
- [ ] Abrir http://localhost:5173
- [ ] Clicar em "🎲 RPG"
- [ ] Registrar primeiro usuário
- [ ] Criar personagem
- [ ] Enviar mensagem no chat

### 6. Testar Multiplayer

- [ ] Abrir nova aba anônima
- [ ] Registrar segundo usuário
- [ ] Criar segundo personagem
- [ ] Enviar mensagens
- [ ] Verificar se aparecem em tempo real nas duas janelas
- [ ] Verificar contador "2 online"

## 🎯 Verificação Final

### Banco de Dados
```sql
-- Execute no SQL Editor do Supabase

-- Deve retornar 4 tabelas
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'rpg_%';

-- Deve retornar 4 canais
SELECT * FROM rpg_channels;

-- Deve retornar os usuários criados
SELECT * FROM rpg_users;

-- Deve retornar os personagens criados
SELECT * FROM rpg_characters;

-- Deve retornar as mensagens enviadas
SELECT * FROM rpg_messages ORDER BY created_at DESC LIMIT 10;
```

### Realtime
- [ ] Mensagens aparecem instantaneamente
- [ ] Contador de usuários online atualiza
- [ ] Lista de usuários online atualiza
- [ ] Troca de canal funciona

### Autenticação
- [ ] Registro funciona
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Validações funcionam (email duplicado, etc.)

### Chat
- [ ] Enviar mensagem funciona
- [ ] Mensagens aparecem em tempo real
- [ ] Trocar de canal funciona
- [ ] Mensagens separadas por canal

## 🐛 Problemas Comuns

### ❌ Erro: "Failed to fetch"
**Solução:** Verificar URL e Key do Supabase em `lib/supabase.ts`

### ❌ Mensagens não aparecem em tempo real
**Solução:** Habilitar Realtime em Database → Replication

### ❌ Erro ao criar usuário
**Solução:** Verificar se Email provider está habilitado

### ❌ Erro de RLS
**Solução:** Executar novamente o schema SQL completo

## ✅ Tudo Funcionando?

Se todos os itens estão marcados:

🎉 **Parabéns! Seu sistema RPG multiplayer está funcionando!** 🎉

Próximos passos:
1. Implementar sistema de missões
2. Implementar sistema de batalhas
3. Adicionar mais funcionalidades

---

**Desenvolvido para Forja do Caos: Academia do Equilíbrio** 🔥
