import React, { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, Sparkles, Shield, Sword, X } from 'lucide-react';
import RPGMessage from './RPGMessage';

interface BattleSystemProps {
  onClose: () => void;
}

type Message = {
  id: string;
  sender: 'player' | 'director' | 'system'; 
  name: string;
  avatar?: string;
  title?: string;
  content: string;
  mechanics?: {
    attack?: string;
    damage?: string;
    difficulty?: number;
  };
  reaction?: {
    damageApplied: number;
    defenseNeeded: number;
  };
  timestamp: string;
};

// Mock data for demonstration
const SCENARIOS = {
  training: '/forest-background.jpg', // Using existing forest background as placeholder
  forest: '/forest-background.jpg',
};

const CHARACTERS = {
  player: { name: 'Yorin Akash', title: 'Ceifador', avatar: '/character1.jpeg' }, // Using existing character
  enemy: { name: 'Valak', title: 'Senhor da Luz', avatar: '/missao_1_monstro.png' } // Using existing monster
};

const RPGBattleArena: React.FC<BattleSystemProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [actionText, setActionText] = useState('');
  const [speechText, setSpeechText] = useState('');
  const [currentImage, setCurrentImage] = useState<string>(SCENARIOS.forest);
  const [turn, setTurn] = useState<'player' | 'enemy'>('enemy');
  const [battleState, setBattleState] = useState<'idle' | 'reacting' | 'attacking'>('idle');
  /* AI Integration State */
  const [isThinking, setIsThinking] = useState(false);
  const [gameMode, setGameMode] = useState<'combat' | 'story'>('combat');
  const initializedMode = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load API Key safely
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const getAvatar = (sender: string) => {
      if (sender === 'player') return CHARACTERS.player.avatar;
      if (sender === 'director' || sender === 'enemy') return CHARACTERS.enemy.avatar;
      return undefined;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Initial Scenario Setup
  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (initializedMode.current === gameMode) return;
    
    // Only trigger if no messages yet (or after mode switch reset)
    if (messages.length === 0) {
        initializedMode.current = gameMode;
        
        if (gameMode === 'story') {
             triggerAIResponse([], 'story');
        } else {
             // Inicia com narrativa introdutória
             triggerAIResponse([], 'combat_intro');
        }
    }
  }, [gameMode]); 

  const triggerAIResponse = async (history: Message[], mode: 'combat' | 'story' | 'combat_intro') => {
    setIsThinking(true);
    
    const aiMessages = history.map(msg => ({
        role: msg.sender === 'player' ? 'user' : 'assistant',
        content: msg.content
    } as any));

    try {
        const { generateAIResponse } = await import('../services/ai');
        
        // Use 'combat' prompt logic for intro but with specific flag if needed, or mapped within service
        const response = await generateAIResponse({
            messages: aiMessages,
            mode: mode as any, 
            context: {
                playerName: CHARACTERS.player.name,
                enemyName: CHARACTERS.enemy.name,
                scenario: mode === 'story' ? 'Uma caverna antiga e úmida.' : 'Uma arena de gladiadores antiga sob o sol escaldante.'
            }
        });

        const newMsg: Message = {
            id: Date.now().toString(),
            sender: 'director',
            name: mode === 'story' ? 'Mestre (IA)' : CHARACTERS.enemy.name,
            title: mode === 'story' ? 'Narrador' : CHARACTERS.enemy.title,
            content: response.content || "...",
            mechanics: response.mechanics ? {
                attack: response.mechanics.attack,
                damage: response.mechanics.damage,
                difficulty: response.mechanics.difficulty || 10
            } : undefined,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, newMsg]);
        
        // Logic for turn and next actions
        if (mode === 'combat_intro') {
             // After intro, enemy immediately attacks!
             setTimeout(() => {
                 triggerAIResponse([...history, newMsg], 'combat');
             }, 2000); 
        } else {
             setTurn('player'); // Player gets to react
             if (mode === 'combat') {
                setBattleState('reacting');
             }
        }
        
        // Simple visual update
        if (response.content?.toLowerCase().includes('luz')) setCurrentImage('/efeito_esfera_luz.png');
        else if (response.content?.toLowerCase().includes('fogo')) setCurrentImage('/efeito_fogo.png');
        else setCurrentImage(mode === 'story' ? SCENARIOS.training : SCENARIOS.forest);

    } catch (error) {
        console.error("AI Error", error);
    } finally {
        setIsThinking(false);
    }
  };

  const handleEnemyAction = (mode: 'combat' | 'story' = 'combat') => {
    triggerAIResponse(messages, mode);
  };

  const handlePlayerAction = () => {
    if (!actionText.trim() && !speechText.trim()) return;

    const combinedContent = `${actionText.trim() ? `_${actionText.trim()}_` : ''}\n\n${speechText.trim() ? `**"${speechText.trim()}"**` : ''}`.trim();

    const playerMsg: Message = {
      id: Date.now().toString(),
      sender: 'player',
      name: CHARACTERS.player.name,
      avatar: CHARACTERS.player.avatar,
      title: CHARACTERS.player.title,
      content: combinedContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, playerMsg];
    setMessages(newHistory);
    setActionText('');
    setSpeechText('');
    setBattleState('idle');

    setTurn('enemy');
    setTimeout(() => {
        triggerAIResponse(newHistory, gameMode);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black text-slate-200 flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* LEFT PANEL - VISUALS */}
      <div className="w-full md:w-1/3 lg:w-2/5 h-1/3 md:h-full relative border-r border-slate-800 bg-slate-900">
        <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className={`relative w-full h-full max-h-[500px] rounded-lg overflow-hidden border-2 ${turn === 'enemy' ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.2)]'} transition-all duration-500`}>
                {/* Main Image */}
                <img 
                    src={currentImage} 
                    alt="Cena da Batalha" 
                    className="w-full h-full object-cover transition-opacity duration-500"
                    onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/600x400/1e293b/475569?text=Cena+Indisponivel';
                    }}
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>

                {/* Status Overlay */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        <span className="text-xs font-bold uppercase tracking-wider">Turno: {turn === 'player' ? 'Você' : 'Inimigo'}</span>
                    </div>
                </div>

                {/* Character Portraits (Bottom) */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div className={`transition-all duration-300 ${turn === 'player' ? 'scale-110 opacity-100' : 'scale-90 opacity-60 grayscale'}`}>
                        <div className="w-16 h-16 rounded-lg border-2 border-blue-500 overflow-hidden bg-slate-800">
                            <img src={CHARACTERS.player.avatar} alt="Player" className="w-full h-full object-cover" />
                        </div>
                        <div className="bg-black/80 text-[10px] text-center mt-1 rounded px-1 text-blue-300">Você</div>
                    </div>
                    <div className={`transition-all duration-300 ${turn === 'enemy' ? 'scale-110 opacity-100' : 'scale-90 opacity-60 grayscale'}`}>
                         <div className="w-16 h-16 rounded-lg border-2 border-red-500 overflow-hidden bg-slate-800">
                            <img src={CHARACTERS.enemy.avatar} alt="Enemy" className="w-full h-full object-cover" />
                        </div>
                        <div className="bg-black/80 text-[10px] text-center mt-1 rounded px-1 text-red-300">Inimigo</div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* RIGHT PANEL - CHAT & CONTROLS */}
      <div className="flex-1 flex flex-col h-2/3 md:h-full bg-slate-950 relative">
        
        {/* Header */}
        <div className="shrink-0 h-14 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 bg-slate-900/50 backdrop-blur">
            <h2 className="font-bold text-slate-200 flex items-center gap-2 text-sm md:text-base">
                <Sword className="w-4 h-4 text-purple-500" />
                {gameMode === 'story' ? 'Modo História (IA)' : 'Arena de Batalha (IA)'}
            </h2>
            <div className="flex items-center gap-3">
                 <button 
                    onClick={() => {
                        if (confirm('Trocar de modo irá reiniciar a sessão. Continuar?')) {
                            setGameMode(prev => prev === 'combat' ? 'story' : 'combat');
                            setMessages([]);
                            // Effect will trigger new AI start
                        }
                    }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] md:text-xs border border-slate-700 transition-colors text-slate-300"
                 >
                    Ir para {gameMode === 'combat' ? 'História' : 'Combate'}
                 </button>
                 <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                    <span className="sr-only">Fechar</span>
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {messages.length === 0 && (
                <div className="text-center text-slate-600 mt-10">
                    <p className="text-sm">Iniciando protocolo de combate...</p>
                </div>
            )}
            
            {messages.map((msg) => (
                <RPGMessage 
                    key={msg.id} 
                    {...msg} 
                    avatar={msg.avatar || getAvatar(msg.sender)}
                />
            ))}

            
            {isThinking && (
                 <div className="flex items-start gap-3 animate-pulse px-2">
                     <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden shrink-0 mt-1 border border-slate-700">
                        <img src={CHARACTERS.enemy.avatar} className="w-full h-full object-cover opacity-50" />
                     </div>
                     <div className="bg-slate-900/50 rounded-lg rounded-tl-none p-3 border border-slate-800 text-slate-500 text-xs italic flex items-center gap-2">
                         <Sparkles className="w-3 h-3 animate-spin" />
                         {gameMode === 'story' ? 'O Mestre está narrando...' : 'O inimigo está planejando...'}
                     </div>
                 </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="shrink-0 p-4 bg-slate-900 border-t border-slate-800">
            {battleState === 'reacting' && (
                <div className="mb-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-300 flex items-center justify-between animate-pulse">
                    <span className="flex items-center gap-2"><Shield className="w-3 h-3" /> Reação Necessária: Descreva sua defesa!</span>
                </div>
            )}

            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <div className="absolute top-[-18px] left-1 text-[10px] text-slate-500 font-bold uppercase">1. Descrição (Ação)</div>
                    <textarea
                        value={actionText}
                        onChange={(e) => setActionText(e.target.value)}
                        placeholder={battleState === 'reacting' ? "Como você tenta desviar..." : "Descreva o que seu personagem faz..."}
                        className="w-full bg-slate-950 border border-slate-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 transition-colors resize-none h-14 custom-scrollbar text-slate-300 placeholder:text-slate-600"
                    />
                </div>
                
                <div className="flex-1 relative">
                    <div className="absolute top-[-18px] left-1 text-[10px] text-slate-500 font-bold uppercase">2. Fala (Diálogo)</div>
                    <div className="relative h-14">
                        <textarea
                            value={speechText}
                            onChange={(e) => setSpeechText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handlePlayerAction();
                                }
                            }}
                            placeholder="O que ele diz..."
                            className="w-full h-full bg-slate-950 border border-slate-700/50 rounded-lg pl-3 pr-12 py-2 text-sm focus:outline-none focus:border-blue-500/50 transition-colors resize-none custom-scrollbar text-white font-semibold placeholder:text-slate-600 placeholder:font-normal"
                        />
                         <button 
                            onClick={handlePlayerAction}
                            disabled={!actionText.trim() || !speechText.trim()}
                            className="absolute right-1 top-1 bottom-1 aspect-square flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-md transition-all text-white shadow-lg shadow-blue-900/20"
                            title="Enviar Turno"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="mt-2 flex justify-between text-[10px] text-slate-500">
                <div className="flex gap-4 opacity-50">
                    <span>*Ação obrigatória*</span>
                    <span>*Fala obrigatória*</span>
                </div>
                <div>Formatação automática aplicada</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RPGBattleArena;
