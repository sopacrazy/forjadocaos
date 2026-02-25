import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatMessage {
    id: string;
    user_id: string;
    channel: string;
    content: string;
    created_at: string;
    username?: string;
    avatar_color?: string;
    character_name?: string;
}

export interface Channel {
    id: string;
    name: string;
    display_name: string;
    icon?: string;
    description?: string;
    is_active: boolean;
    order_index: number;
}

/**
 * Obter canais disponíveis
 */
export const getChannels = async (): Promise<Channel[]> => {
    try {
        const { data, error } = await supabase
            .from('rpg_channels')
            .select('*')
            .eq('is_active', true)
            .order('order_index', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error: any) {
        console.error('Erro ao obter canais:', error);
        return [];
    }
};

/**
 * Obter mensagens de um canal
 */
export const getChannelMessages = async (
    channelName: string,
    limit: number = 50
): Promise<ChatMessage[]> => {
    try {
        // 1. Buscar mensagens e dados básicos do usuário
        const { data: messagesData, error: messagesError } = await supabase
            .from('rpg_messages')
            .select(`
                *,
                rpg_users!inner (
                    id,
                    username,
                    avatar_color
                )
            `)
            .eq('channel', channelName)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (messagesError) throw messagesError;

        const messages = messagesData || [];
        if (messages.length === 0) return [];

        // 2. Extrair IDs de usuários únicos para buscar personagens
        const userIds = Array.from(new Set(messages.map((m: any) => m.user_id)));

        // 3. Buscar personagens desses usuários
        const { data: charactersData, error: charactersError } = await supabase
            .from('rpg_characters')
            .select('user_id, nome')
            .in('user_id', userIds);

        if (charactersError) {
            console.error('Erro ao buscar personagens:', charactersError);
            // Não vamos falhar tudo se apenas os personagens falharem
        }

        // Criar mapa de user_id -> character_name
        const characterMap = new Map();
        if (charactersData) {
            charactersData.forEach((char: any) => {
                characterMap.set(char.user_id, char.nome);
            });
        }

        // 4. Combinar dados
        const formattedMessages = messages.map((msg: any) => ({
            id: msg.id,
            user_id: msg.user_id,
            channel: msg.channel,
            content: msg.content,
            created_at: msg.created_at,
            username: msg.rpg_users?.username,
            avatar_color: msg.rpg_users?.avatar_color,
            character_name: characterMap.get(msg.user_id)
        }));

        return formattedMessages.reverse(); // Mais antigas primeiro
    } catch (error: any) {
        console.error('Erro ao obter mensagens:', error);
        return [];
    }
};

/**
 * Enviar mensagem
 */
export const sendMessage = async (
    userId: string,
    channelName: string,
    content: string
): Promise<ChatMessage | null> => {
    try {
        if (!content.trim()) {
            throw new Error('Mensagem vazia');
        }

        if (content.length > 1000) {
            throw new Error('Mensagem muito longa (máximo 1000 caracteres)');
        }

        // 1. Inserir mensagem
        const { data: msgData, error: msgError } = await supabase
            .from('rpg_messages')
            .insert({
                user_id: userId,
                channel: channelName,
                content: content.trim()
            })
            .select(`
                *,
                rpg_users!inner (
                    id,
                    username,
                    avatar_color
                )
            `)
            .single();

        if (msgError) throw msgError;

        // 2. Buscar nome do personagem separadamente
        let characterName = undefined;
        try {
            const { data: charData } = await supabase
                .from('rpg_characters')
                .select('nome')
                .eq('user_id', userId)
                .single();

            if (charData) {
                characterName = charData.nome;
            }
        } catch (err) {
            console.warn('Erro ao buscar personagem para mensagem:', err);
        }

        return {
            id: msgData.id,
            user_id: msgData.user_id,
            channel: msgData.channel,
            content: msgData.content,
            created_at: msgData.created_at,
            username: msgData.rpg_users?.username,
            avatar_color: msgData.rpg_users?.avatar_color,
            character_name: characterName
        };
    } catch (error: any) {
        console.error('Erro ao enviar mensagem:', error);
        throw error;
    }
};

/**
 * Deletar mensagem (apenas próprias mensagens)
 */
export const deleteMessage = async (messageId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('rpg_messages')
            .delete()
            .eq('id', messageId);

        if (error) throw error;
        return true;
    } catch (error: any) {
        console.error('Erro ao deletar mensagem:', error);
        return false;
    }
};

/**
 * Subscrever a um canal para receber mensagens em tempo real
 */
export const subscribeToChannel = (
    channelName: string,
    onNewMessage: (message: ChatMessage) => void,
    onDeleteMessage?: (messageId: string) => void
): RealtimeChannel => {
    const channel = supabase
        .channel(`rpg-chat-${channelName}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'rpg_messages',
                filter: `channel=eq.${channelName}`
            },
            async (payload) => {
                // Buscar informações completas da mensagem
                const { data: msgData } = await supabase
                    .from('rpg_messages')
                    .select(`
                        *,
                        rpg_users!inner (
                            username,
                            avatar_color
                        )
                    `)
                    .eq('id', payload.new.id)
                    .single();

                if (msgData) {
                    let characterName = undefined;
                    try {
                        const { data: charData } = await supabase
                            .from('rpg_characters')
                            .select('nome')
                            .eq('user_id', msgData.user_id)
                            .single();

                        if (charData) {
                            characterName = charData.nome;
                        }
                    } catch (err) {
                        console.warn('Erro ao buscar personagem para mensagem realtime:', err);
                    }

                    const message: ChatMessage = {
                        id: msgData.id,
                        user_id: msgData.user_id,
                        channel: msgData.channel,
                        content: msgData.content,
                        created_at: msgData.created_at,
                        username: msgData.rpg_users?.username,
                        avatar_color: msgData.rpg_users?.avatar_color,
                        character_name: characterName
                    };
                    onNewMessage(message);
                }
            }
        )
        .on(
            'postgres_changes',
            {
                event: 'DELETE',
                schema: 'public',
                table: 'rpg_messages',
                filter: `channel=eq.${channelName}`
            },
            (payload) => {
                if (onDeleteMessage) {
                    onDeleteMessage(payload.old.id);
                }
            }
        )
        .subscribe();

    return channel;
};

/**
 * Subscrever a presença de usuários online
 */
export const subscribeToOnlineUsers = (
    onUserChange: (users: any[]) => void
): RealtimeChannel => {
    const channel = supabase
        .channel('rpg-online-users')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'rpg_users'
            },
            async () => {
                // Buscar todos os usuários online
                const { data } = await supabase
                    .from('rpg_users')
                    .select(`
                        *,
                        rpg_characters (*)
                    `)
                    .eq('is_online', true)
                    .order('last_seen', { ascending: false });

                if (data) {
                    onUserChange(data);
                }
            }
        )
        .subscribe();

    return channel;
};

/**
 * Cancelar subscrição de um canal
 */
export const unsubscribeFromChannel = async (channel: RealtimeChannel) => {
    await supabase.removeChannel(channel);
};

/**
 * Limpar mensagens antigas (função administrativa)
 */
export const cleanOldMessages = async (daysOld: number = 30): Promise<number> => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const { data, error } = await supabase
            .from('rpg_messages')
            .delete()
            .lt('created_at', cutoffDate.toISOString())
            .select();

        if (error) throw error;
        return data?.length || 0;
    } catch (error: any) {
        console.error('Erro ao limpar mensagens antigas:', error);
        return 0;
    }
};

/**
 * Obter estatísticas do chat
 */
export const getChatStats = async () => {
    try {
        // Total de mensagens
        const { count: totalMessages } = await supabase
            .from('rpg_messages')
            .select('*', { count: 'exact', head: true });

        // Mensagens por canal
        const { data: messagesByChannel } = await supabase
            .from('rpg_messages')
            .select('channel')
            .order('channel');

        // Usuários mais ativos
        const { data: activeUsers } = await supabase
            .from('rpg_messages')
            .select('user_id, rpg_users(username)')
            .limit(10);

        return {
            totalMessages: totalMessages || 0,
            messagesByChannel: messagesByChannel || [],
            activeUsers: activeUsers || []
        };
    } catch (error: any) {
        console.error('Erro ao obter estatísticas:', error);
        return {
            totalMessages: 0,
            messagesByChannel: [],
            activeUsers: []
        };
    }
};
