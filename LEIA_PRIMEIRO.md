# ⚠️ ATENÇÃO - LEIA ANTES DE USAR O SISTEMA RPG

## 🚨 Erro Atual

Você está vendo erros porque o **Supabase ainda não foi configurado**.

O sistema RPG multiplayer precisa do banco de dados Supabase para funcionar.

## ✅ Solução Rápida - 2 Opções:

### Opção 1: Configurar Supabase (Recomendado - 5 minutos)

**Siga estes passos:**

1. **Acesse https://supabase.com**
2. **Faça login** no seu projeto
3. **Vá em SQL Editor** (menu lateral)
4. **Copie TODO o conteúdo** do arquivo `database/rpg_schema.sql`
5. **Cole no editor SQL** e clique em **Run**
6. **Aguarde** a execução (deve aparecer "Success")
7. **Vá em Database → Replication**
8. **Habilite replication** para:
   - `rpg_messages`
   - `rpg_users`
9. **Recarregue a página** do navegador

**Pronto! O sistema vai funcionar.**

### Opção 2: Usar Versão Offline (Temporário)

Se você quer testar sem configurar o Supabase agora:

1. **Abra** `App.tsx`
2. **Mude a linha 21** de:
   ```tsx
   import RPGRoom from './components/RPGRoomSupabase';
   ```
   Para:
   ```tsx
   import RPGRoom from './components/RPGRoom';
   ```
3. **Salve o arquivo**
4. **Recarregue a página**

**Nota:** A versão offline usa localStorage e NÃO tem:
- ❌ Chat em tempo real
- ❌ Múltiplos usuários
- ❌ Sincronização
- ❌ Persistência no banco

## 📋 Checklist de Configuração

Marque conforme for fazendo:

- [ ] Acessei https://supabase.com
- [ ] Fiz login no projeto
- [ ] Abri o SQL Editor
- [ ] Copiei o conteúdo de `database/rpg_schema.sql`
- [ ] Colei e executei no SQL Editor
- [ ] Vi mensagem de sucesso
- [ ] Habilitei Realtime em `rpg_messages`
- [ ] Habilitei Realtime em `rpg_users`
- [ ] Recarreguei a página do navegador
- [ ] Testei registrar um usuário
- [ ] Testei criar um personagem
- [ ] Testei enviar uma mensagem

## 🐛 Erros Comuns

### "Failed to load resource: 404"
**Causa:** Supabase não configurado  
**Solução:** Siga a Opção 1 acima

### "Erro ao criar personagem: Object"
**Causa:** Tabelas não criadas no Supabase  
**Solução:** Execute o schema SQL completo

### "Failed to load resource: 400"
**Causa:** RLS (Row Level Security) não configurado  
**Solução:** Execute o schema SQL completo (ele já inclui RLS)

## 📚 Documentação Completa

- `INSTALACAO_RPG.md` - Guia detalhado
- `CHECKLIST_INSTALACAO.md` - Checklist passo a passo
- `RESUMO_RPG_MULTIPLAYER.md` - Visão geral do sistema

## 🆘 Precisa de Ajuda?

1. Verifique se executou o schema SQL completo
2. Verifique se habilitou o Realtime
3. Verifique o console do navegador (F12)
4. Verifique os logs do Supabase

---

**Após configurar o Supabase, o sistema funcionará perfeitamente!** 🚀
