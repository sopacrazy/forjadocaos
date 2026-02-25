-- Script para corrigir permissões de envio de mensagem
-- Execute no SQL Editor do Supabase

-- 1. Remover política RLS antiga e restritiva
DROP POLICY IF EXISTS "Usuários podem enviar mensagens" ON rpg_messages;

-- 2. Criar nova política permitindo inserção para qualquer usuário logado
-- Isso resolve o erro "new row violates row-level security policy"
CREATE POLICY "Qualquer usuário logado pode enviar"
ON rpg_messages FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 3. Garantir que todos podem ler as mensagens
DROP POLICY IF EXISTS "Todos podem ver mensagens" ON rpg_messages;
CREATE POLICY "Todos podem ver mensagens"
ON rpg_messages FOR SELECT
USING (true);
