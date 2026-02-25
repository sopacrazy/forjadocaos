import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Users, BookOpen, Sword, Shield, LogOut, Menu, Lock, ArrowLeft } from 'lucide-react';
import CharacterRegistrationModal from '../components/CharacterRegistrationModal';
import RPGAuth from './RPGAuth';
import MissionChat from './MissionChat';
import RPGBattleArena from './RPGBattleArena';
import ForestBattle from './ForestBattle';
import {
    createCharacter,
    logoutUser,
    setUserOnline
} from '../services/authService';
import {
    getChannelMessages,
    sendMessage,
    subscribeToChannel,
    subscribeToOnlineUsers,
    unsubscribeFromChannel,
    type ChatMessage,
} from '../services/chatService';
import { RealtimeChannel } from '@supabase/supabase-js';

interface RPGRoomProps {
    isOpen: boolean;
    onClose: () => void;
}

const RPGRoom: React.FC<RPGRoomProps> = ({ isOpen, onClose }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showAuth, setShowAuth] = useState(true);
    const [showRegistration, setShowRegistration] = useState(false);
    const [hasCharacter, setHasCharacter] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Novo Estado de View e Canal
    const [currentView, setCurrentView] = useState<'chat' | 'missions' | 'battles' | 'guild'>('chat');
    const [currentChannel, setCurrentChannel] = useState('geral');
    const [showSidebar, setShowSidebar] = useState(true);
    const [activeBattle, setActiveBattle] = useState<string | null>(null);

    // Estado Bloqueio da Sala
    const [isRoomLocked, setIsRoomLocked] = useState(true);
    const [roomPasswordInput, setRoomPasswordInput] = useState('');
    const [roomPasswordError, setRoomPasswordError] = useState('');

    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatChannelRef = useRef<RealtimeChannel | null>(null);
    const onlineChannelRef = useRef<RealtimeChannel | null>(null);

    // Scroll automático para última mensagem
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (currentView === 'chat') {
            scrollToBottom();
        }
    }, [messages, currentView]);

    // Carregar mensagens do canal atual
    useEffect(() => {
        if (hasCharacter && currentUser && currentView === 'chat') {
            loadChannelMessages();
            setupRealtimeSubscription();
        }

        return () => {
            if (chatChannelRef.current) {
                unsubscribeFromChannel(chatChannelRef.current);
            }
        };
    }, [currentChannel, hasCharacter, currentView]);

    // Subscrever a usuários online
    useEffect(() => {
        if (hasCharacter && currentUser) {
            setupOnlineUsersSubscription();
        }

        return () => {
            if (onlineChannelRef.current) {
                unsubscribeFromChannel(onlineChannelRef.current);
            }
        };
    }, [hasCharacter]);

    const loadChannelMessages = async () => {
        try {
            const msgs = await getChannelMessages(currentChannel, 50);
            setMessages(msgs);
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
        }
    };

    const setupRealtimeSubscription = () => {
        if (chatChannelRef.current) {
            unsubscribeFromChannel(chatChannelRef.current);
        }

        chatChannelRef.current = subscribeToChannel(
            currentChannel,
            (newMessage) => {
                setMessages(prev => {
                    // Evitar duplicatas (caso já tenha sido adicionada localmente ou recebida 2x)
                    if (prev.some(msg => msg.id === newMessage.id)) {
                        return prev;
                    }
                    return [...prev, newMessage];
                });
            },
            (messageId) => {
                setMessages(prev => prev.filter(msg => msg.id !== messageId));
            }
        );
    };

    const setupOnlineUsersSubscription = () => {
        if (onlineChannelRef.current) {
            unsubscribeFromChannel(onlineChannelRef.current);
        }

        onlineChannelRef.current = subscribeToOnlineUsers((users) => {
            setOnlineUsers(users);
        });
    };

    const handleLoginSuccess = async (userData: any) => {
        setCurrentUser(userData);
        setIsAuthenticated(true);
        setShowAuth(false);

        if (userData.character) {
            setHasCharacter(true);
            await setUserOnline(userData.user.id);
        } else {
            setShowRegistration(true);
        }
    };

    const handleRegisterSuccess = (userData: any) => {
        setCurrentUser(userData);
        setIsAuthenticated(true);
        setShowAuth(false);
        setShowRegistration(true);
    };

    const handleRegistrationComplete = async (characterData: any) => {
        try {
            setLoading(true);
            const character = await createCharacter(currentUser.rpgUser.id, characterData);

            const updatedUser = {
                ...currentUser,
                character
            };

            setCurrentUser(updatedUser);
            setHasCharacter(true);
            setShowRegistration(false);

            await setUserOnline(currentUser.user.id);

            setTimeout(async () => {
                try {
                    const welcomeMsg = await sendMessage(
                        currentUser.rpgUser.id,
                        'geral',
                        `🎉 ${characterData.nome} entrou na sala! Bem-vindo(a) à Forja do Caos!`
                    );
                    if (welcomeMsg) {
                        setMessages(prev => [...prev, welcomeMsg]);
                    }
                } catch (error) {
                    console.error('Erro ao enviar mensagem de boas-vindas:', error);
                }
            }, 500);
        } catch (error) {
            console.error('Erro ao criar personagem:', error);
            alert('Erro ao criar personagem. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() && currentUser) {
            try {
                // Limpar input imediatamente para melhor UX
                const msgContent = newMessage.trim();
                setNewMessage('');

                const sentMsg = await sendMessage(currentUser.rpgUser.id, currentChannel, msgContent);

                if (sentMsg) {
                    setMessages(prev => {
                        // Evitar duplicatas
                        if (prev.some(msg => msg.id === sentMsg.id)) return prev;
                        return [...prev, sentMsg];
                    });
                    scrollToBottom();
                }
            } catch (error: any) {
                console.error('Erro ao enviar mensagem:', error);
                alert(error.message || 'Erro ao enviar mensagem');
                setNewMessage(newMessage); // Restaurar se falhar
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleLogout = async () => {
        try {
            await logoutUser();
            onClose();
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    const handleUpdateUser = (updatedUser: any) => {
        console.log("Usuário atualizado após missão:", updatedUser);
        setCurrentUser(updatedUser);
    };

    const handleNavigation = (view: 'chat' | 'missions' | 'battles' | 'guild') => {
        setCurrentView(view);
        if (window.innerWidth < 768) {
            setShowSidebar(false);
        }
    };

    const handleVerifyRoomPassword = () => {
        if (roomPasswordInput === '!@FF2020') {
            setIsRoomLocked(false);
            setRoomPasswordError('');
        } else {
            setRoomPasswordError('Senha incorreta. Tente novamente.');
        }
    };

    if (!isOpen) return null;

    if (isRoomLocked) {
        return (
            <div className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-purple-500/30 p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl shadow-purple-900/20">
                    <div className="w-16 h-16 bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
                        <Lock className="w-8 h-8 text-purple-400" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2 font-epic">Área Restrita</h2>
                    <p className="text-slate-400 mb-6 text-sm">Esta sessão é privada. Digite a senha de acesso da Forja.</p>

                    <div className="space-y-4">
                        <input
                            type="password"
                            value={roomPasswordInput}
                            onChange={(e) => {
                                setRoomPasswordInput(e.target.value);
                                setRoomPasswordError('');
                            }}
                            onKeyPress={(e) => e.key === 'Enter' && handleVerifyRoomPassword()}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors text-center tracking-widest placeholder:tracking-normal"
                            placeholder="Senha da Sala"
                            autoFocus
                        />

                        {roomPasswordError && (
                            <p className="text-red-400 text-xs font-bold animate-pulse">{roomPasswordError}</p>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-semibold text-sm"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={handleVerifyRoomPassword}
                                className="flex-1 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors shadow-lg shadow-purple-900/20 text-sm"
                            >
                                Acessar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm h-[100dvh]">
            {/* Modal de Autenticação */}
            {showAuth && !isAuthenticated && (
                <RPGAuth
                    isOpen={showAuth}
                    onClose={onClose}
                    onLoginSuccess={handleLoginSuccess}
                    onRegisterSuccess={handleRegisterSuccess}
                />
            )}

            {/* Modal de Registro de Personagem */}
            {showRegistration && !hasCharacter && isAuthenticated && (
                <CharacterRegistrationModal
                    isOpen={showRegistration}
                    onClose={onClose}
                    onComplete={handleRegistrationComplete}
                />
            )}

            {/* Sala Principal */}
            {hasCharacter && (
                <div className="h-full flex flex-col md:flex-row">
                    {/* Sidebar Esquerda - Controlada por showSidebar */}
                    <div className={`${showSidebar ? 'flex fixed inset-0 z-50 w-full md:static md:w-64' : 'hidden'} bg-slate-900 border-r border-slate-800 flex-col transition-all duration-300 ease-in-out`}>
                        <div className="p-4 border-b border-slate-800 flex justify-between items-start">
                            <div>
                                <h2 className="font-epic text-xl font-black gold-gradient">FORJA RPG</h2>
                                <p className="text-xs text-slate-400 mt-1">Academia do Equilíbrio (Online)</p>
                            </div>
                            <button onClick={() => setShowSidebar(false)} className="md:hidden p-1 text-slate-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Menu</div>

                            <button
                                onClick={() => handleNavigation('chat')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentView === 'chat' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
                            >
                                <span className="text-slate-400">#</span>
                                <span className="text-sm font-semibold">geral</span>
                            </button>

                            <button
                                onClick={() => handleNavigation('missions')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentView === 'missions' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
                            >
                                <BookOpen className="w-4 h-4" />
                                <span className="text-sm font-semibold">missões</span>
                            </button>

                            <button
                                onClick={() => handleNavigation('battles')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentView === 'battles' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
                            >
                                <Sword className="w-4 h-4" />
                                <span className="text-sm font-semibold">batalhas</span>
                            </button>

                            <button
                                onClick={() => handleNavigation('guild')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentView === 'guild' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
                            >
                                <Shield className="w-4 h-4" />
                                <span className="text-sm font-semibold">guilda</span>
                            </button>
                        </div>

                        <div className="p-3 border-t border-slate-800 bg-slate-950">
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                    style={{ backgroundColor: currentUser?.rpgUser?.avatar_color }}
                                >
                                    {currentUser?.rpgUser?.username?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-white truncate">{currentUser?.rpgUser?.username}</div>
                                    <div className="text-xs text-slate-400">Rank {currentUser?.character?.rank || 'E'}</div>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 transition-colors text-sm font-semibold"
                            >
                                <LogOut className="w-4 h-4" />
                                Sair
                            </button>
                        </div>
                    </div>

                    {/* Área Principal */}
                    <div className="flex-1 flex flex-col bg-slate-950">
                        {currentView === 'chat' && (
                            <>
                                <div className="h-14 md:h-16 px-4 md:px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setShowSidebar(!showSidebar)}
                                            className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors mr-2"
                                            title="Alternar Menu"
                                        >
                                            <Menu className="w-5 h-5" />
                                        </button>
                                        <span className="text-slate-400 hidden md:inline">#</span>
                                        <h3 className="font-bold text-white text-sm md:text-base">{currentChannel}</h3>
                                        <div className="hidden md:flex items-center gap-2 ml-4 px-2 py-1 bg-slate-800/50 rounded text-xs text-slate-400">
                                            <Users className="w-3 h-3" />
                                            <span>{onlineUsers.length} online</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={onClose}
                                        className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-slate-800/50 hover:bg-red-600/50 border border-slate-700/50 hover:border-red-500/50 transition-all group"
                                    >
                                        <X className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-white" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
                                    {messages.map((message) => (
                                        <div key={message.id} className="flex gap-3 hover:bg-slate-900/30 p-2 rounded-lg transition-colors">
                                            <div
                                                className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm flex-shrink-0"
                                                style={{ backgroundColor: message.avatar_color }}
                                            >
                                                {message.username?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <span className="font-bold text-white text-sm md:text-base">
                                                        {message.character_name || message.username}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {new Date(message.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-slate-300 text-sm md:text-base break-words">{message.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className="p-3 md:p-4 border-t border-slate-800 bg-slate-900/50">
                                    <div className="flex gap-2 md:gap-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder={`Mensagem em #${currentChannel}`}
                                            maxLength={1000}
                                            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 md:px-4 py-2 md:py-3 text-white text-sm md:text-base placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim()}
                                            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                                        >
                                            <Send className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2 hidden md:block">
                                        Pressione Enter para enviar • Shift + Enter para nova linha
                                    </p>
                                </div>
                            </>
                        )}

                        {currentView === 'missions' && (
                            <div className="flex-1 flex flex-col h-full bg-slate-950">
                                <div className="h-14 md:h-16 px-4 md:px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setShowSidebar(!showSidebar)}
                                            className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors mr-2"
                                            title="Alternar Menu"
                                        >
                                            <Menu className="w-5 h-5" />
                                        </button>
                                        <BookOpen className="w-5 h-5 text-purple-400" />
                                        <h3 className="font-bold text-white text-base">Missões</h3>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-slate-800/50 hover:bg-red-600/50 border border-slate-700/50 hover:border-red-500/50 transition-all group"
                                    >
                                        <X className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-white" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-hidden relative">
                                    <MissionChat
                                        currentUser={currentUser}
                                        onUpdateUser={handleUpdateUser}
                                    />
                                </div>
                            </div>
                        )}

                        {(currentView === 'battles' || currentView === 'guild') && (
                            <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden relative">
                                <div className="h-14 md:h-16 px-4 md:px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-sm z-10 shrink-0">
                                    <div className="flex items-center gap-3">
                                        {currentView === 'battles' && activeBattle ? (
                                            <button
                                                onClick={() => setActiveBattle(null)}
                                                className="p-2 -ml-2 text-white hover:bg-slate-800 rounded-lg transition-colors mr-2"
                                                title="Voltar para Seleção"
                                            >
                                                <ArrowLeft className="w-5 h-5" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setShowSidebar(!showSidebar)}
                                                className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors mr-2"
                                                title="Alternar Menu"
                                            >
                                                <Menu className="w-5 h-5" />
                                            </button>
                                        )}

                                        {!(currentView === 'battles' && activeBattle) && <Sword className="w-5 h-5 text-slate-400" />}

                                        <h3 className="font-bold text-white text-base capitalize">
                                            {currentView === 'guild' ? 'Guilda' : (activeBattle === 'forest' ? 'Floresta Mística' : 'Batalhas')}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-slate-800/50 hover:bg-red-600/50 border border-slate-700/50 hover:border-red-500/50 transition-all group"
                                    >
                                        <X className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-white" />
                                    </button>
                                </div>

                                {currentView === 'battles' ? (
                                    <div className="flex-1 w-full h-full relative bg-slate-950">
                                        {activeBattle?.startsWith('forest') ? (
                                            <ForestBattle 
                                                currentUser={currentUser} 
                                            />
                                        ) : activeBattle === 'arena' ? (
                                            <RPGBattleArena onClose={() => setActiveBattle(null)} />
                                        ) : (
                                            <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto h-full content-start">
                                                {/* Card Floresta */}
                                                <div
                                                    onClick={() => setActiveBattle('forest')}
                                                    className="group relative bg-slate-900 border border-green-900/50 hover:border-green-500 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-green-900/20 active:scale-95"
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className="relative z-10 flex flex-col items-center text-center gap-4">
                                                        <div className="w-16 h-16 rounded-full bg-green-900/30 border border-green-500/30 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-lg shadow-green-900/30">
                                                            🌲
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">Floresta Mística</h3>
                                                            <p className="text-sm text-slate-400 mt-2">Explore a floresta antiga e descubra seus segredos perdidos.</p>
                                                        </div>
                                                        <div className="flex gap-2 mt-2">
                                                            <span className="text-xs font-bold text-green-500 bg-green-900/20 px-3 py-1 rounded-full border border-green-900/50">
                                                                Nível 1-10
                                                            </span>
                                                            <span className="text-xs font-bold text-white bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                                                                1 Jogador
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Card Arena PvP */}
                                                <div
                                                    onClick={() => setActiveBattle('arena')}
                                                    className="group relative bg-slate-900 border border-red-900/50 hover:border-red-500 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-red-900/20 active:scale-95"
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className="relative z-10 flex flex-col items-center text-center gap-4">
                                                        <div className="w-16 h-16 rounded-full bg-red-900/30 border border-red-500/30 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-lg shadow-red-900/30">
                                                            ⚔️
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">Arena de Batalha</h3>
                                                            <p className="text-sm text-slate-400 mt-2">Desafie outros jogadores ou enfrente monstros em combates por turno.</p>
                                                        </div>
                                                        <div className="flex gap-2 mt-2">
                                                            <span className="text-xs font-bold text-red-500 bg-red-900/20 px-3 py-1 rounded-full border border-red-900/50">
                                                                PvP / PvE
                                                            </span>
                                                            <span className="text-xs font-bold text-white bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                                                                Turnos
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Card Dragão (Bloqueado) */}
                                                <div className="relative bg-slate-900/40 border border-slate-800/50 rounded-xl p-6 opacity-50 cursor-not-allowed grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 group">
                                                    <div className="absolute top-4 right-4 z-20">
                                                        <Lock className="w-4 h-4 text-slate-500 group-hover:text-red-500 transition-colors" />
                                                    </div>
                                                    <div className="flex flex-col items-center text-center gap-4">
                                                        <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl group-hover:bg-red-900/20 group-hover:border-red-500/30 transition-colors">
                                                            🌋
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-bold text-slate-500 group-hover:text-red-400 transition-colors">Caverna do Dragão</h3>
                                                            <p className="text-sm text-slate-600 mt-2">Um desafio ardente para heróis experientes.</p>
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-600 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                                                            Em Breve
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Card Torre (Bloqueado) */}
                                                <div className="relative bg-slate-900/40 border border-slate-800/50 rounded-xl p-6 opacity-50 cursor-not-allowed grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 group">
                                                    <div className="absolute top-4 right-4 z-20">
                                                        <Lock className="w-4 h-4 text-slate-500 group-hover:text-purple-500 transition-colors" />
                                                    </div>
                                                    <div className="flex flex-col items-center text-center gap-4">
                                                        <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl group-hover:bg-purple-900/20 group-hover:border-purple-500/30 transition-colors">
                                                            🏰
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-bold text-slate-500 group-hover:text-purple-400 transition-colors">Torre Arcana</h3>
                                                            <p className="text-sm text-slate-600 mt-2">Segredos mágicos aguardam no topo.</p>
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-600 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                                                            Em Breve
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex-1 p-8 text-center flex flex-col items-center justify-center">
                                        <h2 className="text-2xl font-bold text-white mb-2 capitalize">Guilda</h2>
                                        <p className="text-slate-400">Funcionalidade em desenvolvimento.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RPGRoom;
