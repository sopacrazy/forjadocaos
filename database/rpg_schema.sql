-- ============================================
-- FORJA DO CAOS - RPG DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: rpg_users
-- Armazena informações dos jogadores
-- ============================================
CREATE TABLE IF NOT EXISTS rpg_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_color TEXT NOT NULL DEFAULT '#8B5CF6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_online BOOLEAN DEFAULT FALSE
);

-- ============================================
-- TABELA: rpg_characters
-- Armazena as fichas de personagens
-- ============================================
CREATE TABLE IF NOT EXISTS rpg_characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES rpg_users(id) ON DELETE CASCADE NOT NULL,
    
    -- Informações Básicas
    nome TEXT NOT NULL,
    sexo TEXT NOT NULL,
    idade INTEGER,
    raca TEXT NOT NULL,
    origem TEXT,
    
    -- Progressão
    rank TEXT NOT NULL DEFAULT 'E',
    nivel INTEGER NOT NULL DEFAULT 1,
    xp_atual INTEGER NOT NULL DEFAULT 0,
    xp_proximo INTEGER NOT NULL DEFAULT 100,
    
    -- Atributos
    forca INTEGER NOT NULL DEFAULT 0,
    destreza INTEGER NOT NULL DEFAULT 0,
    inteligencia INTEGER NOT NULL DEFAULT 0,
    velocidade INTEGER NOT NULL DEFAULT 0,
    pontos_disponiveis INTEGER NOT NULL DEFAULT 10,
    
    -- Energia (PE)
    pe_base INTEGER NOT NULL DEFAULT 10,
    pe_livre INTEGER NOT NULL DEFAULT 0,
    pe_distribuir INTEGER NOT NULL DEFAULT 0,
    pe_total INTEGER NOT NULL DEFAULT 10,
    
    -- Vida (PV)
    pv_maximo INTEGER NOT NULL DEFAULT 10,
    pv_atual INTEGER NOT NULL DEFAULT 10,
    
    -- Recursos
    dinheiro INTEGER NOT NULL DEFAULT 0,
    
    -- História
    historia TEXT,
    observacoes TEXT,
    
    -- Habilidades (JSON)
    habilidades JSONB DEFAULT '[]'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- ============================================
-- TABELA: rpg_messages
-- Armazena mensagens do chat
-- ============================================
CREATE TABLE IF NOT EXISTS rpg_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES rpg_users(id) ON DELETE CASCADE NOT NULL,
    channel TEXT NOT NULL DEFAULT 'geral',
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índice para busca rápida por canal
    CONSTRAINT check_content_length CHECK (char_length(content) > 0 AND char_length(content) <= 1000)
);

-- ============================================
-- TABELA: rpg_channels
-- Define os canais disponíveis
-- ============================================
CREATE TABLE IF NOT EXISTS rpg_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    icon TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES para Performance
-- ============================================

-- Índices para rpg_users
CREATE INDEX IF NOT EXISTS idx_rpg_users_auth_user_id ON rpg_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_rpg_users_username ON rpg_users(username);
CREATE INDEX IF NOT EXISTS idx_rpg_users_is_online ON rpg_users(is_online);

-- Índices para rpg_characters
CREATE INDEX IF NOT EXISTS idx_rpg_characters_user_id ON rpg_characters(user_id);
CREATE INDEX IF NOT EXISTS idx_rpg_characters_rank ON rpg_characters(rank);
CREATE INDEX IF NOT EXISTS idx_rpg_characters_nivel ON rpg_characters(nivel);

-- Índices para rpg_messages
CREATE INDEX IF NOT EXISTS idx_rpg_messages_channel ON rpg_messages(channel);
CREATE INDEX IF NOT EXISTS idx_rpg_messages_created_at ON rpg_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rpg_messages_user_id ON rpg_messages(user_id);

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para rpg_users
DROP TRIGGER IF EXISTS update_rpg_users_updated_at ON rpg_users;
CREATE TRIGGER update_rpg_users_updated_at
    BEFORE UPDATE ON rpg_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para rpg_characters
DROP TRIGGER IF EXISTS update_rpg_characters_updated_at ON rpg_characters;
CREATE TRIGGER update_rpg_characters_updated_at
    BEFORE UPDATE ON rpg_characters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular PV máximo baseado em FOR
CREATE OR REPLACE FUNCTION calculate_pv_maximo()
RETURNS TRIGGER AS $$
BEGIN
    NEW.pv_maximo = 10 + NEW.forca;
    -- Se PV atual for maior que o novo máximo, ajustar
    IF NEW.pv_atual > NEW.pv_maximo THEN
        NEW.pv_atual = NEW.pv_maximo;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular PV automaticamente
DROP TRIGGER IF EXISTS calculate_pv_on_character_change ON rpg_characters;
CREATE TRIGGER calculate_pv_on_character_change
    BEFORE INSERT OR UPDATE OF forca ON rpg_characters
    FOR EACH ROW
    EXECUTE FUNCTION calculate_pv_maximo();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE rpg_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rpg_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE rpg_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE rpg_channels ENABLE ROW LEVEL SECURITY;

-- Políticas para rpg_users
-- Todos podem ver usuários online
CREATE POLICY "Usuários podem ver outros usuários"
    ON rpg_users FOR SELECT
    USING (true);

-- Usuários podem atualizar apenas seus próprios dados
CREATE POLICY "Usuários podem atualizar próprio perfil"
    ON rpg_users FOR UPDATE
    USING (auth.uid() = auth_user_id);

-- Usuários podem inserir seu próprio registro
CREATE POLICY "Usuários podem criar próprio perfil"
    ON rpg_users FOR INSERT
    WITH CHECK (auth.uid() = auth_user_id);

-- Políticas para rpg_characters
-- Todos podem ver personagens
CREATE POLICY "Todos podem ver personagens"
    ON rpg_characters FOR SELECT
    USING (true);

-- Usuários podem criar/atualizar apenas seu próprio personagem
CREATE POLICY "Usuários podem gerenciar próprio personagem"
    ON rpg_characters FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM rpg_users
            WHERE rpg_users.id = rpg_characters.user_id
            AND rpg_users.auth_user_id = auth.uid()
        )
    );

-- Políticas para rpg_messages
-- Todos podem ver mensagens
CREATE POLICY "Todos podem ver mensagens"
    ON rpg_messages FOR SELECT
    USING (true);

-- Usuários autenticados podem enviar mensagens
CREATE POLICY "Usuários podem enviar mensagens"
    ON rpg_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM rpg_users
            WHERE rpg_users.id = rpg_messages.user_id
            AND rpg_users.auth_user_id = auth.uid()
        )
    );

-- Usuários podem deletar apenas suas próprias mensagens
CREATE POLICY "Usuários podem deletar próprias mensagens"
    ON rpg_messages FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM rpg_users
            WHERE rpg_users.id = rpg_messages.user_id
            AND rpg_users.auth_user_id = auth.uid()
        )
    );

-- Políticas para rpg_channels
-- Todos podem ver canais
CREATE POLICY "Todos podem ver canais"
    ON rpg_channels FOR SELECT
    USING (is_active = true);

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Inserir canais padrão
INSERT INTO rpg_channels (name, display_name, icon, description, order_index) VALUES
    ('geral', 'geral', '#', 'Canal geral para conversas', 1),
    ('missoes', 'missões', '📖', 'Discussões sobre missões e quests', 2),
    ('batalhas', 'batalhas', '⚔️', 'Organização de batalhas e combates', 3),
    ('guilda', 'guilda', '🛡️', 'Chat da guilda', 4)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View para ver usuários online com seus personagens
CREATE OR REPLACE VIEW rpg_online_players AS
SELECT 
    u.id as user_id,
    u.username,
    u.avatar_color,
    u.is_online,
    u.last_seen,
    c.nome as character_name,
    c.rank,
    c.nivel,
    c.raca
FROM rpg_users u
LEFT JOIN rpg_characters c ON c.user_id = u.id
WHERE u.is_online = true
ORDER BY u.last_seen DESC;

-- View para mensagens recentes com informações do usuário
CREATE OR REPLACE VIEW rpg_recent_messages AS
SELECT 
    m.id,
    m.content,
    m.channel,
    m.created_at,
    u.username,
    u.avatar_color,
    c.nome as character_name
FROM rpg_messages m
JOIN rpg_users u ON u.id = m.user_id
LEFT JOIN rpg_characters c ON c.user_id = u.id
ORDER BY m.created_at DESC
LIMIT 100;

-- ============================================
-- FUNÇÕES ÚTEIS
-- ============================================

-- Função para marcar usuário como online
CREATE OR REPLACE FUNCTION set_user_online(user_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE rpg_users
    SET is_online = true, last_seen = NOW()
    WHERE auth_user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para marcar usuário como offline
CREATE OR REPLACE FUNCTION set_user_offline(user_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE rpg_users
    SET is_online = false, last_seen = NOW()
    WHERE auth_user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON TABLE rpg_users IS 'Armazena informações dos jogadores do RPG';
COMMENT ON TABLE rpg_characters IS 'Armazena as fichas de personagens dos jogadores';
COMMENT ON TABLE rpg_messages IS 'Armazena mensagens do chat em tempo real';
COMMENT ON TABLE rpg_channels IS 'Define os canais de chat disponíveis';
