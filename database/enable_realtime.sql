-- Execute este script no SQL Editor do Supabase para ativar o Realtime no Chat

-- 1. Habilitar replicação na tabela rpg_messages
ALTER TABLE rpg_messages REPLICA IDENTITY FULL;

-- 2. Adicionar a tabela à publicação do supabase_realtime
BEGIN;
  -- Removemos a tabela da publicação caso já exista (para evitar erros)
  -- ALTER PUBLICATION supabase_realtime DROP TABLE rpg_messages;
  
  -- Adicionamos a tabela à publicação
  ALTER PUBLICATION supabase_realtime ADD TABLE rpg_messages;
COMMIT;

-- 3. (Opcional) Verificar se está ativo
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- 4. Habilitar também para rpg_users (para ver quem está online)
ALTER TABLE rpg_users REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE rpg_users;
