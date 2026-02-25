import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Users, BookOpen, Sword, Shield, LogOut } from 'lucide-react';
import CharacterRegistrationModal from '../components/CharacterRegistrationModal';
import RPGAuthOffline from './RPGAuthOffline';
import MissionsBoard from './MissionsBoard';

interface Message {
    id: string;
    userId: string;
    username: string;
    content: string;
    timestamp: Date;
    userColor: string;
}

interface RPGRoomProps {
    isOpen: boolean;
    onClose: () => void;
}

const RPGRoom: React.FC<RPGRoomProps> = ({ isOpen, onClose }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showAuth, setShowAuth] = useState(true);
    const [showRegistration, setShowRegistration] = useState(false);
    const [hasCharacter, setHasCharacter] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [currentView, setCurrentView] = useState<'chat' | 'missions' | 'battles' | 'guild'>('chat');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Cores para avatares dos usuários
    const userColors = [
        '#8B5CF6', '#EC4899', '#10B981', '#F59E0B',
        '#3B82F6', '#EF4444', '#14B8A6', '#F97316'
    ];

    const getRandomColor = () => {
        return userColors[Math.floor(Math.random() * userColors.length)];
    };

    // Login Automático
    useEffect(() => {
        const savedUser = localStorage.getItem('rpg_auto_login');
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                console.log('Login automático recuperado:', userData);

                // Verificar se o usuário persistido tem dados válidos
                if (userData && userData.email) {
                    setCurrentUser(userData);
                    setIsAuthenticated(true);
                    setShowAuth(false);

                    if (userData.hasCharacter && userData.character) {
                        setHasCharacter(true);
                    } else {
                        setShowRegistration(true);
                    }
                }
            } catch (e) {
                console.error('Erro ao recuperar login:', e);
                localStorage.removeItem('rpg_auto_login');
            }
        }
    }, []);

    // Scroll automático para última mensagem
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Simular mensagem de boas-vindas do bot
    useEffect(() => {
        if (hasCharacter && messages.length === 0) {
            const charName = currentUser?.character?.nome || currentUser?.username || 'Aventureiro';
            const welcomeMessage: Message = {
                id: 'welcome',
                userId: 'bot',
                username: 'Mestre do RPG',
                content: `🎲 Bem-vindo(a) à sala de RPG, ${charName}! Aqui você pode interagir com outros jogadores, participar de missões e evoluir seu personagem. Boa sorte em sua jornada!`,
                timestamp: new Date(),
                userColor: '#FFD700'
            };
            setMessages([welcomeMessage]);
        }
    }, [hasCharacter]);

    const handleLoginSuccess = (userData: any) => {
        setCurrentUser(userData);
        setIsAuthenticated(true);
        setShowAuth(false);

        // Salvar para login automático
        localStorage.setItem('rpg_auto_login', JSON.stringify(userData));

        // Verificar se já tem personagem criado
        if (userData.hasCharacter && userData.character) {
            setHasCharacter(true);
        } else {
            // Se não tem personagem, mostrar modal de criação
            setShowRegistration(true);
        }
    };

    const handleRegisterSuccess = (userData: any) => {
        setCurrentUser(userData);
        setIsAuthenticated(true);
        setShowAuth(false);
        // Após registro, sempre mostrar criação de personagem
        setShowRegistration(true);

        // Salvar parcial
        localStorage.setItem('rpg_auto_login', JSON.stringify(userData));
    };

    const handleRegistrationComplete = (characterData: any) => {
        const updatedUser = {
            ...currentUser,
            character: characterData,
            hasCharacter: true,
            color: currentUser.color || getRandomColor()
        };

        setCurrentUser(updatedUser);
        setHasCharacter(true);
        setShowRegistration(false);

        // Atualizar login automático
        localStorage.setItem('rpg_auto_login', JSON.stringify(updatedUser));

        // Salvar no banco de usuários (localStorage)
        try {
            const users = JSON.parse(localStorage.getItem('rpg_users') || '[]');
            const userIndex = users.findIndex((u: any) => u.email === currentUser.email);

            if (userIndex !== -1) {
                // Atualizar usuário existente
                users[userIndex] = updatedUser;
                localStorage.setItem('rpg_users', JSON.stringify(users));
                console.log('Personagem salvo com sucesso!', updatedUser);
            } else {
                console.error('Usuário não encontrado no localStorage');
            }
        } catch (error) {
            console.error('Erro ao salvar personagem:', error);
        }
    };

    const handleUpdateUser = (updatedUser: any) => {
        setCurrentUser(updatedUser);
        // Atualizar persistência automática
        localStorage.setItem('rpg_auto_login', JSON.stringify(updatedUser));

        // Atualizar lista geral de usuários
        try {
            const users = JSON.parse(localStorage.getItem('rpg_users') || '[]');
            const userIndex = users.findIndex((u: any) => u.email === updatedUser.email);
            if (userIndex !== -1) {
                users[userIndex] = updatedUser;
                localStorage.setItem('rpg_users', JSON.stringify(users));
            }
        } catch (e) {
            console.error('Erro ao atualizar usuário após missão:', e);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('rpg_auto_login');
        setIsAuthenticated(false);
        setCurrentUser(null);
        setHasCharacter(false);
        setShowAuth(true);
        // Opcional: Recarregar a página para limpar estados profundos
        // window.location.reload(); 
    };

    const handleSendMessage = () => {
        if (newMessage.trim() && currentUser) {
            const charName = currentUser.character?.nome || currentUser.username;
            const message: Message = {
                id: Date.now().toString(),
                userId: currentUser.id,
                username: charName,
                content: newMessage.trim(),
                timestamp: new Date(),
                userColor: currentUser.color
            };

            setMessages(prev => [...prev, message]);
            setNewMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm">
            {/* Modal de Autenticação */}
            {showAuth && !isAuthenticated && (
                <RPGAuthOffline
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

            {/* Sala Principal - Estilo Discord */}
            {hasCharacter && (
                <div className="h-full flex flex-col md:flex-row">
                    {/* Sidebar - Lista de Canais/Opções */}
                    <div className="hidden md:flex md:w-64 bg-slate-900 border-r border-slate-800 flex-col">
                        {/* Header da Sidebar */}
                        <div className="p-4 border-b border-slate-800">
                            <h2 className="font-epic text-xl font-black gold-gradient">FORJA RPG</h2>
                            <p className="text-xs text-slate-400 mt-1">Academia do Equilíbrio</p>
                        </div>

                        {/* Canais */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Canais de Texto</div>

                            <button
                                onClick={() => setCurrentView('chat')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentView === 'chat' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
                            >
                                <span className="text-slate-400">#</span>
                                <span className="text-sm font-semibold">geral</span>
                            </button>

                            <button
                                onClick={() => setCurrentView('missions')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentView === 'missions' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
                            >
                                <BookOpen className="w-4 h-4" />
                                <span className="text-sm font-semibold">missões</span>
                            </button>

                            <button
                                onClick={() => setCurrentView('battles')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentView === 'battles' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
                            >
                                <Sword className="w-4 h-4" />
                                <span className="text-sm font-semibold">batalhas</span>
                            </button>

                            <button
                                onClick={() => setCurrentView('guild')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentView === 'guild' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
                            >
                                <Shield className="w-4 h-4" />
                                <span className="text-sm font-semibold">guilda</span>
                            </button>
                        </div>

                        {/* User Info */}
                        <div className="p-3 border-t border-slate-800 bg-slate-950">
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                    style={{ backgroundColor: currentUser?.color }}
                                >
                                    {(currentUser?.character?.nome || currentUser?.username)?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-white truncate">
                                        {currentUser?.character?.nome || currentUser?.username}
                                    </div>
                                    <div className="text-xs text-slate-400">Rank {currentUser?.character?.rank || 'E'}</div>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 py-2 rounded bg-red-900/20 hover:bg-red-900/40 text-red-400 text-xs font-bold transition-colors"
                            >
                                <LogOut className="w-3 h-3" />
                                Sair / Trocar Conta
                            </button>
                        </div>
                    </div>

                    {/* Área Principal */}
                    <div className="flex-1 flex flex-col bg-slate-950">
                        {currentView === 'chat' && (
                            <>
                                {/* Header do Chat */}
                                <div className="h-14 md:h-16 px-4 md:px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-400 hidden md:inline">#</span>
                                        <h3 className="font-bold text-white text-sm md:text-base">geral</h3>
                                        <div className="hidden md:flex items-center gap-2 ml-4 px-2 py-1 bg-slate-800/50 rounded text-xs text-slate-400">
                                            <Users className="w-3 h-3" />
                                            <span>1 online</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={onClose}
                                        className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-slate-800/50 hover:bg-red-600/50 border border-slate-700/50 hover:border-red-500/50 transition-all group"
                                    >
                                        <X className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-white" />
                                    </button>
                                </div>

                                {/* Mensagens */}
                                <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
                                    {messages.map((message) => (
                                        <div key={message.id} className="flex gap-3 hover:bg-slate-900/30 p-2 rounded-lg transition-colors">
                                            <div
                                                className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm flex-shrink-0"
                                                style={{ backgroundColor: message.userColor }}
                                            >
                                                {message.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <span className="font-bold text-white text-sm md:text-base">{message.username}</span>
                                                    <span className="text-xs text-slate-500">
                                                        {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-slate-300 text-sm md:text-base break-words">{message.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input de Mensagem */}
                                <div className="p-3 md:p-4 border-t border-slate-800 bg-slate-900/50">
                                    <div className="flex gap-2 md:gap-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder={`Mensagem em #geral`}
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
                            <>
                                <div className="h-14 md:h-16 px-4 md:px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
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
                                <MissionsBoard
                                    currentUser={currentUser}
                                    onUpdateUser={handleUpdateUser} // Passando a função de callback
                                />
                            </>
                        )}

                        {(currentView === 'battles' || currentView === 'guild') && (
                            <div className="flex-1 p-8 text-center flex flex-col items-center justify-center">
                                <h2 className="text-2xl font-bold text-white mb-2 capitalize">{currentView}</h2>
                                <p className="text-slate-400">Funcionalidade em desenvolvimento.</p>
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800/50 hover:bg-red-600/50 border border-slate-700/50 hover:border-red-500/50 transition-all group"
                                >
                                    <X className="w-5 h-5 text-slate-400 group-hover:text-white" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Direita - Info do Personagem (Desktop) */}
                    <div className="hidden lg:flex lg:w-72 bg-slate-900 border-l border-slate-800 flex-col">
                        <div className="p-4 border-b border-slate-800">
                            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Seu Personagem</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* Card do Personagem */}
                            <div className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border border-purple-500/30 rounded-xl p-4">
                                <div className="text-center mb-3">
                                    <div
                                        className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-black text-2xl"
                                        style={{ backgroundColor: currentUser?.color }}
                                    >
                                        {(currentUser?.character?.nome || currentUser?.username)?.charAt(0).toUpperCase()}
                                    </div>
                                    <h4 className="font-bold text-white text-lg">
                                        {currentUser?.character?.nome || currentUser?.username}
                                    </h4>
                                    <p className="text-xs text-slate-400">
                                        {currentUser?.character?.raca || 'Desconhecido'} • {currentUser?.character?.sexo || 'Desconhecido'}
                                    </p>
                                </div>

                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Rank:</span>
                                        <span className="font-bold text-yellow-400">{currentUser?.character?.rank || 'E'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Nível:</span>
                                        <span className="font-bold text-white">{currentUser?.character?.nivel || 1}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">XP:</span>
                                        <span className="font-bold text-blue-400">
                                            {currentUser?.character?.xpAtual || 0}/{currentUser?.character?.xpProximo || 1000}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Ouro:</span>
                                        <span className="font-bold text-yellow-500">{currentUser?.character?.dinheiro || 0} PO</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">PV:</span>
                                        <span className="font-bold text-green-400">
                                            {currentUser?.character?.pvAtual || 10}/{currentUser?.character?.pvMaximo || 10}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Atributos */}
                            <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
                                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">Atributos</h4>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">💪 Força:</span>
                                        <span className="font-bold text-white">{currentUser?.character?.forca || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">🎯 Destreza:</span>
                                        <span className="font-bold text-white">{currentUser?.character?.destreza || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">🧠 Inteligência:</span>
                                        <span className="font-bold text-white">{currentUser?.character?.inteligencia || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">⚡ Velocidade:</span>
                                        <span className="font-bold text-white">{currentUser?.character?.velocidade || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RPGRoom;
