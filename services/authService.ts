import { supabase } from '../lib/supabase';

export interface RPGUser {
    id: string;
    auth_user_id: string;
    username: string;
    email: string;
    avatar_color: string;
    created_at: string;
    updated_at: string;
    last_seen: string;
    is_online: boolean;
}

export interface RPGCharacter {
    id: string;
    user_id: string;
    nome: string;
    sexo: string;
    idade?: number;
    raca: string;
    origem?: string;
    rank: string;
    nivel: number;
    xp_atual: number;
    xp_proximo: number;
    forca: number;
    destreza: number;
    inteligencia: number;
    velocidade: number;
    pontos_disponiveis: number;
    pe_base: number;
    pe_livre: number;
    pe_distribuir: number;
    pe_total: number;
    pv_maximo: number;
    pv_atual: number;
    dinheiro: number;
    historia?: string;
    observacoes?: string;
    habilidades: any[];
    created_at: string;
    updated_at: string;
}

const getRandomColor = () => {
    const colors = [
        '#8B5CF6', '#EC4899', '#10B981', '#F59E0B',
        '#3B82F6', '#EF4444', '#14B8A6', '#F97316'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Registrar novo usuário
 */
export const registerUser = async (email: string, password: string, username: string) => {
    try {
        // 1. Criar usuário no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Falha ao criar usuário');

        // 2. Criar registro na tabela rpg_users
        const { data: userData, error: userError } = await supabase
            .from('rpg_users')
            .insert({
                auth_user_id: authData.user.id,
                username,
                email,
                avatar_color: getRandomColor(),
                is_online: true
            })
            .select()
            .single();

        if (userError) throw userError;

        return { user: authData.user, rpgUser: userData };
    } catch (error: any) {
        console.error('Erro ao registrar:', error);
        throw error;
    }
};

/**
 * Login de usuário
 */
export const loginUser = async (email: string, password: string) => {
    try {
        // 1. Login no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Falha ao fazer login');

        // 2. Buscar dados do RPG user com maybeSingle para evitar erro se não existir
        let { data: rpgUser, error: userError } = await supabase
            .from('rpg_users')
            .select('*')
            .eq('auth_user_id', authData.user.id)
            .maybeSingle();

        if (userError) throw userError;

        // AUTO-RECUPERAÇÃO: Se não existir registro no banco (mas logou no Auth), cria agora
        if (!rpgUser) {
            console.log("Usuário logado sem registro em rpg_users. Criando...", authData.user.id);
            const { data: newUser, error: createError } = await supabase
                .from('rpg_users')
                .insert({
                    auth_user_id: authData.user.id,
                    username: authData.user.user_metadata?.username || authData.user.email?.split('@')[0] || `User_${Math.floor(Math.random() * 1000)}`,
                    email: authData.user.email,
                    avatar_color: getRandomColor(),
                    is_online: true
                })
                .select()
                .single();

            if (createError) throw createError;
            rpgUser = newUser;
        }

        // 3. Marcar como online
        await setUserOnline(authData.user.id);

        // 4. Buscar personagem se existir
        const { data: character } = await supabase
            .from('rpg_characters')
            .select('*')
            .eq('user_id', rpgUser.id)
            .maybeSingle();

        return {
            user: authData.user,
            rpgUser,
            character: character || null
        };
    } catch (error: any) {
        console.error('Erro ao fazer login:', error);
        throw error;
    }
};

/**
 * Logout de usuário
 */
export const logoutUser = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            await setUserOffline(user.id);
        }

        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    } catch (error: any) {
        console.error('Erro ao fazer logout:', error);
        throw error;
    }
};

/**
 * Obter usuário atual
 */
export const getCurrentUser = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return null;

        const { data: rpgUser } = await supabase
            .from('rpg_users')
            .select('*')
            .eq('auth_user_id', user.id)
            .maybeSingle();

        if (!rpgUser) return null;

        const { data: character } = await supabase
            .from('rpg_characters')
            .select('*')
            .eq('user_id', rpgUser.id)
            .maybeSingle();

        return {
            user,
            rpgUser,
            character: character || null
        };
    } catch (error: any) {
        console.error('Erro ao obter usuário atual:', error);
        return null;
    }
};

/**
 * Criar personagem
 */
export const createCharacter = async (userId: string, characterData: any) => {
    try {
        const { data, error } = await supabase
            .from('rpg_characters')
            .insert({
                user_id: userId,
                ...characterData
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error: any) {
        console.error('Erro ao criar personagem:', error);
        throw error;
    }
};

/**
 * Atualizar personagem
 */
export const updateCharacter = async (characterId: string, updates: Partial<RPGCharacter>) => {
    try {
        const { data, error } = await supabase
            .from('rpg_characters')
            .update(updates)
            .eq('id', characterId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error: any) {
        console.error('Erro ao atualizar personagem:', error);
        throw error;
    }
};

/**
 * Marcar usuário como online
 */
export const setUserOnline = async (authUserId: string) => {
    try {
        const { error } = await supabase
            .from('rpg_users')
            .update({
                is_online: true,
                last_seen: new Date().toISOString()
            })
            .eq('auth_user_id', authUserId);

        if (error) throw error;
    } catch (error: any) {
        console.error('Erro ao marcar usuário como online:', error);
    }
};

/**
 * Marcar usuário como offline
 */
export const setUserOffline = async (authUserId: string) => {
    try {
        const { error } = await supabase
            .from('rpg_users')
            .update({
                is_online: false,
                last_seen: new Date().toISOString()
            })
            .eq('auth_user_id', authUserId);

        if (error) throw error;
    } catch (error: any) {
        console.error('Erro ao marcar usuário como offline:', error);
    }
};

/**
 * Obter usuários online
 */
export const getOnlineUsers = async () => {
    try {
        const { data, error } = await supabase
            .from('rpg_users')
            .select(`
                *,
                rpg_characters (*)
            `)
            .eq('is_online', true)
            .order('last_seen', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error: any) {
        console.error('Erro ao obter usuários online:', error);
        return [];
    }
};

/**
 * Verificar se username já existe
 */
export const checkUsernameExists = async (username: string) => {
    try {
        const { data, error } = await supabase
            .from('rpg_users')
            .select('id')
            .eq('username', username)
            .eq('username', username)
            .maybeSingle();

        return !!data;
    } catch (error: any) {
        return false;
    }
};
