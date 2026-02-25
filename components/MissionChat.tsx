import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, MapPin, Skull, Coins, Star, Package, CheckCircle, Clock, Shield, RefreshCw } from 'lucide-react';
import { updateCharacter } from '../services/authService';

// Configuração de Imagens (Simulada - Substitua pelos caminhos reais)
const IMG_FOREST = '/missao_1_fundo.png';
const IMG_MONSTER = '/missao_1_monstro.png';
const IMG_VICTORY = '/missao_1_vitoria.png';

interface Mission {
    id: string;
    title: string;
    rank: 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
    location: string;
    description: string;
    objectives: string[];
    rewards: {
        xp: string;
        money: string;
        items: string[];
    };
    duration: number; // minutos
}

interface Message {
    id: string;
    sender: 'npc' | 'user' | 'system';
    content?: string;
    type: 'text' | 'mission_offer' | 'mission_active' | 'mission_complete';
    mission?: Mission;
    timestamp: Date;
}

interface MissionChatProps {
    currentUser: any;
    onUpdateUser: (updatedUser: any) => void;
}

const FIRST_MISSION: Mission = {
    id: 'mission_001',
    title: 'Ruídos na Floresta Próxima',
    rank: 'E',
    location: 'Floresta ao redor da Universidade',
    description: 'Sons estranhos foram ouvidos na floresta próxima à universidade. Pequenas criaturas selvagens estão se aproximando das muralhas.',
    objectives: [
        'Investigar a área',
        'Afastar ou eliminar as criaturas'
    ],
    rewards: {
        xp: '25-40',
        money: '15-30 PO',
        items: ['Couro simples', 'Carne de criatura']
    },
    duration: 1
};

const MissionChat: React.FC<MissionChatProps> = ({ currentUser, onUpdateUser }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [missionState, setMissionState] = useState<'idle' | 'offered' | 'accepted' | 'completed'>('idle');
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [activeMissionStart, setActiveMissionStart] = useState<number | null>(null);
    const [imageError, setImageError] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const hasStartedRef = useRef(false);
    const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

    // Estados de Combate e Cena
    const [scene, setScene] = useState<'exploration' | 'encounter' | 'combat' | 'victory' | 'defeat'>('exploration');
    const [playerHp, setPlayerHp] = useState(100);
    const [playerMaxHp, setPlayerMaxHp] = useState(100);
    const [monsterHp, setMonsterHp] = useState(100);
    const [monsterMaxHp, setMonsterMaxHp] = useState(100);
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [damageNumber, setDamageNumber] = useState<number | null>(null);
    const [isShaking, setIsShaking] = useState(false);

    // Input state
    const [newMessage, setNewMessage] = useState('');

    // Carregar estado inicial
    useEffect(() => {
        if (!currentUser?.character?.id) return;
        if (hasStartedRef.current) return;
        hasStartedRef.current = true;

        const savedKey = `mission_state_${currentUser.character.id}`;
        const savedState = localStorage.getItem(savedKey);

        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                const parsedMessages = parsed.messages.map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                }));

                if (parsedMessages.length > 0) {
                    setMessages(parsedMessages);
                    setMissionState(parsed.missionState);
                    setActiveMissionStart(parsed.activeMissionStart);

                    // Restaurar ou resetar cena se estava em missão
                    if (parsed.missionState === 'accepted') {
                        setScene('exploration');
                    }
                    return;
                }
            } catch (e) {
                console.error("Erro ao carregar estado da missão", e);
                localStorage.removeItem(savedKey);
            }
        }

        startConversation();

        return () => {
            timeoutsRef.current.forEach(clearTimeout);
        };
    }, [currentUser?.character?.id]);

    // Salvar estado
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(`mission_state_${currentUser.character.id}`, JSON.stringify({
                messages,
                missionState,
                activeMissionStart
            }));
        }
    }, [messages, missionState, activeMissionStart]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, scene]); // Scroll também quando a cena muda

    const addMessage = (msg: Message) => {
        setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
        });
    };

    const startConversation = () => {
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];

        const t1 = setTimeout(() => {
            addMessage({
                id: 'intro_001',
                sender: 'npc',
                content: `Saudações, ${currentUser.character.nome}. Sou Argus, o coordenador das missões locais.`,
                type: 'text',
                timestamp: new Date()
            });

            const t2 = setTimeout(() => {
                addMessage({
                    id: 'intro_002',
                    sender: 'npc',
                    content: 'Chegaram relatos preocupantes dos arredores. Tenho um trabalho para alguém do seu nível.',
                    type: 'text',
                    timestamp: new Date()
                });

                const t3 = setTimeout(() => {
                    addMessage({
                        id: 'mission_offer_001',
                        sender: 'npc',
                        type: 'mission_offer',
                        mission: FIRST_MISSION,
                        timestamp: new Date()
                    });
                    setMissionState('offered');
                }, 1500);
                timeoutsRef.current.push(t3);

            }, 1000);
            timeoutsRef.current.push(t2);

        }, 500);
        timeoutsRef.current.push(t1);
    };

    const handleAcceptMission = () => {
        addMessage({
            id: Date.now().toString(),
            sender: 'user',
            content: 'Aceito a missão. Iniciando investigação.',
            type: 'text',
            timestamp: new Date()
        });

        setMissionState('accepted');
        setActiveMissionStart(Date.now());
        setScene('exploration');

        setTimeout(() => {
            addMessage({
                id: (Date.now() + 1).toString(),
                sender: 'npc',
                content: 'Cuidado. A floresta está silenciosa demais...',
                type: 'text',
                timestamp: new Date()
            });
        }, 1000);
    };

    // --- Lógica de Combate e Cena ---

    const handleInvestigate = () => {
        addMessage({ id: Date.now().toString(), sender: 'user', content: '*Investigando os arbustos...*', type: 'text', timestamp: new Date() });

        setTimeout(() => {
            setScene('encounter');
            addMessage({ id: (Date.now() + 1).toString(), sender: 'npc', content: 'GRRAAAWR! Uma Besta da Floresta surge das sombras!', type: 'text', timestamp: new Date() });
        }, 1500);
    };

    const handleStartCombat = () => {
        setScene('combat');
        setPlayerMaxHp(100);
        setPlayerHp(100);
        setMonsterMaxHp(80);
        setMonsterHp(80);
        setIsPlayerTurn(true);
        addMessage({ id: Date.now().toString(), sender: 'system', content: '⚔️ COMBATE INICIADO!', type: 'text', timestamp: new Date() });
    };

    const handleAttack = (type: 'physical' | 'skill') => {
        if (!isPlayerTurn) return;

        let damage = 0;
        let logMsg = '';

        if (type === 'physical') {
            damage = Math.floor(Math.random() * (15 - 10 + 1)) + 10;
            logMsg = `Você atacou a besta com sua espada! Causou ${damage} de dano.`;
        } else {
            damage = Math.floor(Math.random() * (25 - 15 + 1)) + 15;
            logMsg = `Você usou uma habilidade especial! Causou ${damage} de dano.`;
        }

        setMonsterHp(prev => Math.max(0, prev - damage));
        setDamageNumber(damage);
        setIsShaking(true);
        setTimeout(() => { setIsShaking(false); setDamageNumber(null); }, 500);

        addMessage({ id: Date.now().toString(), sender: 'user', content: logMsg, type: 'text', timestamp: new Date() });

        if (monsterHp - damage <= 0) {
            setTimeout(() => handleVictory(), 1000);
        } else {
            setIsPlayerTurn(false);
            setTimeout(() => monsterTurn(), 1500);
        }
    };

    const monsterTurn = () => {
        const damage = Math.floor(Math.random() * (12 - 5 + 1)) + 5;
        setPlayerHp(prev => Math.max(0, prev - damage));

        addMessage({ id: Date.now().toString(), sender: 'npc', content: `A besta revida! Você sofreu ${damage} de dano.`, type: 'text', timestamp: new Date() });

        if (playerHp - damage <= 0) {
            setScene('defeat');
            addMessage({ id: Date.now().toString(), sender: 'system', content: '💀 Você foi derrotado...', type: 'text', timestamp: new Date() });
        } else {
            setIsPlayerTurn(true);
        }
    };

    const handleVictory = () => {
        setScene('victory');
        completeMission();
    };

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        addMessage({
            id: Date.now().toString(),
            sender: 'user',
            content: newMessage,
            type: 'text',
            timestamp: new Date()
        });

        const userText = newMessage;
        setNewMessage('');

        setTimeout(() => {
            let reply = "Hum...";
            const lowerText = userText.toLowerCase();

            if (missionState === 'idle') reply = "Estou ocupado organizando os registros.";
            else if (missionState === 'offered') reply = "Ainda não decidiu? O tempo urge.";
            else if (missionState === 'accepted') reply = "Concentre-se na batalha!";
            else if (missionState === 'completed') reply = "Descanse, guerreiro.";

            if (lowerText.includes('olá')) reply = "Saudações.";
            if (lowerText.includes('ajuda')) reply = "Use os botões na tela para interagir.";

            addMessage({
                id: (Date.now() + 1).toString(),
                sender: 'npc',
                content: reply,
                type: 'text',
                timestamp: new Date()
            });
        }, 1000 + Math.random() * 1000);
    };

    const completeMission = async () => {
        const xpReward = 50;
        const goldReward = 25;

        try {
            const currentCharacter = currentUser.character;
            const updates = {
                xp_atual: (currentCharacter.xp_atual || 0) + xpReward,
                dinheiro: (currentCharacter.dinheiro || 0) + goldReward
            };

            if (updates.xp_atual >= currentCharacter.xp_proximo) {
                updates.xp_atual -= currentCharacter.xp_proximo;
            }

            await updateCharacter(currentCharacter.id, updates);

            onUpdateUser({
                ...currentUser,
                character: { ...currentCharacter, ...updates }
            });

            setMissionState('completed');

            addMessage({
                id: Date.now().toString(),
                sender: 'npc',
                content: 'Impressionante. Você limpou a área.',
                type: 'text',
                timestamp: new Date()
            });

            addMessage({
                id: (Date.now() + 1).toString(),
                sender: 'system',
                content: `Você recebeu: ${xpReward} XP e ${goldReward} PO.`,
                type: 'mission_complete',
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Erro ao completar missão:', error);
        }
    };

    const resetChat = () => {
        if (window.confirm('Deseja reiniciar a conversa e o progresso desta missão?')) {
            localStorage.removeItem(`mission_state_${currentUser.character.id}`);
            setMessages([]);
            setMissionState('idle');
            setActiveMissionStart(null);
            setTimeLeft('');
            setScene('exploration');
            hasStartedRef.current = false;
            setTimeout(() => startConversation(), 100);
        }
    };

    return (
        <div className="relative w-full h-full bg-slate-950 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="h-16 shrink-0 md:px-6 px-4 border-b border-purple-900/30 bg-slate-900/80 flex items-center justify-between shadow-lg z-20 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-purple-900 border-2 border-purple-500 flex items-center justify-center overflow-hidden">
                            {!imageError ? (
                                <img
                                    src="/images/npcs/argus.png"
                                    alt="Argus"
                                    className="w-full h-full object-cover"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <Bot className="w-6 h-6 text-purple-200" />
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">Argus</h3>
                        <p className="text-xs text-purple-300 font-medium">Coordenador de Missões</p>
                    </div>
                </div>
                <button
                    onClick={resetChat}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    title="Reiniciar"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Stage Area - VISUALIZADOR DE CENA */}
            {missionState === 'accepted' && (
                <div className="relative w-full h-64 md:h-80 bg-black border-b border-slate-800 shrink-0 overflow-hidden group transition-all duration-500">
                    <div
                        className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 transform ${isShaking ? 'translate-x-1' : ''}`}
                        style={{
                            backgroundImage: `url(${IMG_FOREST})`,
                            filter: scene === 'encounter' || scene === 'combat' ? 'brightness(0.6) contrast(1.1)' : 'brightness(0.5)'
                        }}
                    >
                        {/* Fallback Color */}
                        <div className="absolute inset-0 bg-slate-900/60 -z-10" />
                    </div>

                    {/* Victory Overlay */}
                    {scene === 'victory' && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-40 animate-fade-in">
                            <img src={IMG_VICTORY} className="w-24 h-24 mb-4 drop-shadow-[0_0_20px_rgba(255,215,0,0.5)] animate-bounce" alt="Victory" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                            <h2 className="text-3xl font-black text-yellow-400 mb-2 uppercase tracking-widest">Vitória!</h2>
                            <p className="text-white text-sm">Missão Cumprida</p>
                        </div>
                    )}

                    {/* Defeat Overlay */}
                    {scene === 'defeat' && (
                        <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center z-40">
                            <h2 className="text-4xl font-black text-red-500 mb-2 uppercase tracking-widest">Derrota</h2>
                            <button onClick={handleStartCombat} className="px-6 py-2 bg-slate-800 text-white rounded mt-4 hover:bg-slate-700 font-bold border border-slate-600">
                                Tentar Novamente
                            </button>
                        </div>
                    )}

                    {/* Monster Layer */}
                    {(scene === 'encounter' || scene === 'combat') && (
                        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-48 md:w-64 md:h-64 transition-transform duration-100 flex items-end justify-center ${isShaking ? 'translate-x-[10px]' : ''}`}>
                            <div className="relative w-full h-full flex items-end justify-center">
                                <img
                                    src={IMG_MONSTER}
                                    alt="Monstro"
                                    className="max-w-full max-h-full object-contain drop-shadow-[0_0_10px_rgba(255,50,50,0.4)]"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        if (!(e.target as HTMLElement).parentElement?.querySelector('.fallback-monster')) {
                                            const fb = document.createElement('div');
                                            fb.className = 'fallback-monster text-6xl animate-bounce';
                                            fb.innerText = '🐺';
                                            (e.target as HTMLElement).parentElement?.appendChild(fb);
                                        }
                                    }}
                                />
                                {damageNumber && (
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-5xl font-black text-red-500 animate-bounce drop-shadow-md z-50">
                                        -{damageNumber}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* HUD & Controls Layer */}
                    <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 pointer-events-none">
                        {/* Top HUD */}
                        <div className="flex justify-between items-start w-full">
                            {scene === 'combat' && (
                                <>
                                    <div className="w-[45%] bg-slate-900/80 rounded-lg p-2 border border-slate-700">
                                        <div className="flex justify-between text-xs text-white mb-1 font-bold"><span>VOCÊ</span> <span>{playerHp} HP</span></div>
                                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
                                            <div style={{ width: `${(playerHp / playerMaxHp) * 100}%` }} className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-300" />
                                        </div>
                                    </div>
                                    <div className="w-[45%] bg-slate-900/80 rounded-lg p-2 border border-slate-700">
                                        <div className="flex justify-between text-xs text-red-300 mb-1 font-bold"><span>BESTA SAVAGEM</span> <span>{monsterHp} HP</span></div>
                                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
                                            <div style={{ width: `${(monsterHp / monsterMaxHp) * 100}%` }} className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300 ml-auto" />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Bottom Action Bar */}
                        <div className="flex justify-center gap-4 mt-auto pointer-events-auto">
                            {scene === 'exploration' && (
                                <button
                                    onClick={handleInvestigate}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all flex items-center gap-2"
                                >
                                    🔍 Investigar Área
                                </button>
                            )}

                            {scene === 'encounter' && (
                                <button
                                    onClick={handleStartCombat}
                                    className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-lg border-b-4 border-red-800 active:border-b-0 active:translate-y-1 animate-pulse flex items-center gap-2 transform hover:scale-105 transition-all"
                                >
                                    ⚔️ ATACAR AGORA!
                                </button>
                            )}

                            {scene === 'combat' && isPlayerTurn && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleAttack('physical')}
                                        className="px-5 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all shadow-lg"
                                    >
                                        🗡️ Ataque Físico
                                    </button>
                                    <button
                                        onClick={() => handleAttack('skill')}
                                        className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 transition-all shadow-lg"
                                    >
                                        ✨ Habilidade
                                    </button>
                                </div>
                            )}
                            {scene === 'combat' && !isPlayerTurn && (
                                <div className="px-6 py-2 bg-black/60 backdrop-blur text-white rounded-full text-sm font-bold animate-pulse border border-white/20">
                                    Aguardando turno inimigo...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950 scroll-smooth">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className="flex-shrink-0 mt-1">
                                {msg.sender === 'npc' ? (
                                    <div className="w-8 h-8 rounded-full bg-purple-900/50 border border-purple-500/30 flex items-center justify-center overflow-hidden">
                                        {!imageError ? <img src="/images/npcs/argus.png" className="w-full h-full object-cover" onError={() => setImageError(true)} /> : <Bot className="w-4 h-4 text-purple-300" />}
                                    </div>
                                ) : msg.sender === 'system' ? (
                                    <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center">
                                        <Shield className="w-4 h-4 text-slate-300" />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: currentUser.rpgUser.avatar_color }}>
                                        {currentUser.character.nome.charAt(0)}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-1 w-full">
                                <span className={`text-xs text-slate-500 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                    {msg.sender === 'npc' ? 'Argus' : msg.sender === 'system' ? 'Sistema' : 'Você'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>

                                {msg.type === 'text' && (
                                    <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm ${msg.sender === 'user' ? 'bg-purple-600 text-white rounded-tr-none' :
                                            msg.sender === 'system' ? 'bg-slate-800 text-slate-300 border border-slate-700 font-mono text-xs' :
                                                'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                                        }`}>
                                        {msg.content}
                                    </div>
                                )}

                                {msg.type === 'mission_offer' && msg.mission && (
                                    <div className="bg-slate-900 border border-purple-500/50 rounded-xl overflow-hidden shadow-lg w-full md:w-[400px]">
                                        <div className="bg-gradient-to-r from-purple-900/50 to-slate-900 p-4 border-b border-purple-500/30">
                                            <h4 className="font-bold text-white mb-1">📜 {msg.mission.title}</h4>
                                            <p className="text-xs text-purple-300">{msg.mission.location}</p>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            <p className="text-slate-300 text-sm italic">"{msg.mission.description}"</p>
                                            <ul className="text-sm text-slate-400 space-y-1">
                                                {msg.mission.objectives.map((obj, i) => <li key={i}>• {obj}</li>)}
                                            </ul>
                                            {missionState === 'offered' && (
                                                <button onClick={handleAcceptMission} className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-lg">Aceitar Missão</button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {msg.type === 'mission_complete' && (
                                    <div className="px-4 py-3 rounded-2xl bg-slate-800 border border-green-900/50 text-slate-200">
                                        <div className="flex items-center gap-2 mb-1 text-green-400 font-bold text-xs uppercase">
                                            <CheckCircle className="w-4 h-4" /> Missão Cumprida
                                        </div>
                                        <p>{msg.content}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="h-[72px] shrink-0 p-4 border-t border-slate-800 bg-slate-900 flex items-center gap-3 z-20">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Mensagem para Argus..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors shadow-lg"
                >
                    <Send className="w-4 h-4 text-white" />
                </button>
            </div>
        </div>
    );
};

export default MissionChat;
