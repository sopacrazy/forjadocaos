import React, { useState, useEffect } from 'react';
import { Scroll, Clock, Coins, Star, Swords, CheckCircle, XCircle } from 'lucide-react';
import { updateCharacter } from '../services/authService';

interface Mission {
    id: string;
    title: string;
    description: string;
    rank: 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
    xpReward: number;
    goldReward: number;
    duration: number; // em minutos
    status: 'available' | 'active' | 'completed' | 'failed';
    startTime?: number; // timestamp
}

interface MissionsBoardSupabaseProps {
    currentUser: any;
    onUpdateUser: (updatedUser: any) => void;
}

const INITIAL_MISSIONS: Mission[] = [
    {
        id: '1',
        title: 'Limpeza no Porão',
        description: 'A Taverna do Javalianco precisa de ajuda para limpar ratos gigantes do porão. Trabalho sujo, mas honesto.',
        rank: 'E',
        xpReward: 100,
        goldReward: 50,
        duration: 1, // 1 minuto para teste rápido
        status: 'available'
    },
    {
        id: '2',
        title: 'Entrega Urgente',
        description: 'Leve um pacote de ervas medicinais para a Curandeira na orla da floresta. Cuidado com os lobos.',
        rank: 'E',
        xpReward: 150,
        goldReward: 80,
        duration: 15, // minutos
        status: 'available'
    },
    {
        id: '3',
        title: 'Patrulha Noturna',
        description: 'A guarda da cidade precisa de voluntários para vigiar os portões durante a noite.',
        rank: 'D',
        xpReward: 300,
        goldReward: 200,
        duration: 30, // minutos
        status: 'available'
    },
    {
        id: '4',
        title: 'A Fera da Caverna',
        description: 'Um urso-coruja está aterrorizando os viajantes. Precisamos de alguém corajoso para lidar com ele.',
        rank: 'C',
        xpReward: 800,
        goldReward: 1000,
        duration: 60, // minutos
        status: 'available'
    }
];

const MissionsBoardSupabase: React.FC<MissionsBoardSupabaseProps> = ({ currentUser, onUpdateUser }) => {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [activeMission, setActiveMission] = useState<Mission | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // Carregar missões (estado local para as missões)
    useEffect(() => {
        if (!currentUser?.character?.id) return;

        const key = `rpg_missions_${currentUser.character.id}`;
        const savedMissions = localStorage.getItem(key);

        if (savedMissions) {
            const parsedMissions = JSON.parse(savedMissions);
            setMissions(parsedMissions);

            // Verificar se tem missão ativa
            const active = parsedMissions.find((m: Mission) => m.status === 'active');
            if (active) {
                setActiveMission(active);
            }
        } else {
            setMissions(INITIAL_MISSIONS);
        }
    }, [currentUser]);

    const saveMissionsLocal = (updatedMissions: Mission[]) => {
        if (!currentUser?.character?.id) return;
        setMissions(updatedMissions);
        localStorage.setItem(`rpg_missions_${currentUser.character.id}`, JSON.stringify(updatedMissions));
    };

    const startMission = (missionId: string) => {
        if (activeMission) {
            alert('Você já tem uma missão em andamento!');
            return;
        }

        const updatedMissions = missions.map(m => {
            if (m.id === missionId) {
                const updated = {
                    ...m,
                    status: 'active' as const,
                    startTime: Date.now()
                };
                setActiveMission(updated);
                return updated;
            }
            return m;
        });

        saveMissionsLocal(updatedMissions);
    };

    const completeMission = async (mission: Mission) => {
        setLoading(true);
        try {
            // 1. Atualizar estado local das missões
            const updatedMissions = missions.map(m => {
                if (m.id === mission.id) {
                    return { ...m, status: 'completed' as const };
                }
                return m;
            });

            setActiveMission(null);
            saveMissionsLocal(updatedMissions);

            // 2. Calcular novos stats
            const currentCharacter = currentUser.character;
            let novoXp = (currentCharacter.xp_atual || 0) + mission.xpReward;
            let novoOuro = (currentCharacter.dinheiro || 0) + mission.goldReward;
            let novoNivel = currentCharacter.nivel || 1;
            let xpProximo = currentCharacter.xp_proximo || 1000;

            // Level Up Logic
            if (novoXp >= xpProximo) {
                novoNivel += 1;
                novoXp = novoXp - xpProximo;
                xpProximo = Math.floor(xpProximo * 1.5);
                alert(`🎉 PARABÉNS! Você subiu para o nível ${novoNivel}!`);
            }

            // 3. Salvar no Supabase
            const updates = {
                xp_atual: novoXp,
                dinheiro: novoOuro,
                nivel: novoNivel,
                xp_proximo: xpProximo
            };

            const updatedCharacter = await updateCharacter(currentCharacter.id, updates);

            // 4. Atualizar estado no componente pai
            onUpdateUser({
                ...currentUser,
                character: updatedCharacter
            });

            alert(`Missão "${mission.title}" completa!\nGanhou: ${mission.xpReward} XP e ${mission.goldReward} Ouro`);

        } catch (error) {
            console.error('Erro ao completar missão:', error);
            alert('Erro ao salvar progresso no servidor. Verifique sua conexão.');
        } finally {
            setLoading(false);
        }
    };

    // Timer da missão ativa
    useEffect(() => {
        if (!activeMission) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = now - (activeMission.startTime || 0);
            const durationMs = activeMission.duration * 60 * 1000;
            const remaining = durationMs - elapsed;

            if (remaining <= 0) {
                // Missão concluída!
                completeMission(activeMission);
                clearInterval(interval);
                setTimeLeft('Concluída!');
            } else {
                // Formatar tempo restante
                const minutes = Math.floor(remaining / 60000);
                const seconds = Math.floor((remaining % 60000) / 1000);
                setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [activeMission]);

    const cancelMission = () => {
        if (!activeMission) return;

        if (!confirm('Tem certeza que deseja desistir da missão? Todo o progresso será perdido.')) return;

        const updatedMissions = missions.map(m => {
            if (m.id === activeMission.id) {
                return { ...m, status: 'available' as const, startTime: undefined };
            }
            return m;
        });

        setActiveMission(null);
        saveMissionsLocal(updatedMissions);
    };

    const getRankColor = (rank: string) => {
        switch (rank) {
            case 'E': return 'text-slate-400 border-slate-400';
            case 'D': return 'text-green-400 border-green-400';
            case 'C': return 'text-blue-400 border-blue-400';
            case 'B': return 'text-purple-400 border-purple-400';
            case 'A': return 'text-orange-400 border-orange-400';
            case 'S': return 'text-yellow-400 border-yellow-400';
            default: return 'text-slate-400 border-slate-400';
        }
    };

    return (
        <div className="flex-1 p-4 md:p-8 flex flex-col h-full bg-slate-950/50">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Scroll className="w-6 h-6 text-yellow-500" />
                        Quadro de Missões
                    </h2>
                    <p className="text-slate-400 text-sm">Realize contratos para ganhar glória e riquezas.</p>
                </div>

                {activeMission && (
                    <div className="bg-slate-800 border border-purple-500/50 rounded-lg px-4 py-2 flex items-center gap-4 animate-pulse">
                        <div className="flex flex-col">
                            <span className="text-xs text-purple-300 uppercase font-bold">Em Progresso</span>
                            <span className="text-white font-bold text-sm">{activeMission.title}</span>
                        </div>
                        <div className="text-xl font-mono font-bold text-green-400 min-w-[60px] text-right">
                            {timeLeft}
                        </div>
                        <button
                            onClick={cancelMission}
                            className="p-1 hover:bg-red-500/20 rounded-full text-slate-500 hover:text-red-400 transition-colors"
                            title="Desistir"
                        >
                            <XCircle className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Lista de Missões */}
            {loading ? (
                <div className="flex-1 flex items-center justify-center text-purple-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mr-2"></div>
                    Salvando progresso...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-4">
                    {missions.map((mission) => (
                        <div
                            key={mission.id}
                            className={`
                                relative bg-slate-900 border-2 rounded-xl p-5 transition-all
                                ${mission.status === 'active' ? 'border-purple-500 shadow-lg shadow-purple-500/10' : ''}
                                ${mission.status === 'completed' ? 'border-green-900/50 opacity-60' : ''}
                                ${mission.status === 'available' ? 'border-slate-800 hover:border-slate-600 hover:-translate-y-1' : ''}
                            `}
                        >
                            {/* Rank Badge */}
                            <div className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg border-2 font-black text-lg ${getRankColor(mission.rank)}`}>
                                {mission.rank}
                            </div>

                            <h3 className="text-white font-bold text-lg pr-12 mb-2">{mission.title}</h3>
                            <p className="text-slate-400 text-sm mb-4 line-clamp-2 h-10">{mission.description}</p>

                            {/* Recompensas */}
                            <div className="flex gap-4 mb-4 text-sm">
                                <div className="flex items-center gap-1 text-yellow-400">
                                    <Coins className="w-4 h-4" />
                                    <span>{mission.goldReward} PO</span>
                                </div>
                                <div className="flex items-center gap-1 text-blue-400">
                                    <Star className="w-4 h-4" />
                                    <span>{mission.xpReward} XP</span>
                                </div>
                            </div>

                            {/* Tempo */}
                            <div className="flex items-center gap-2 text-slate-500 text-xs mb-4">
                                <Clock className="w-3 h-3" />
                                <span>{mission.duration} minutos</span>
                            </div>

                            {/* Botão de Ação */}
                            {mission.status === 'available' && (
                                <button
                                    onClick={() => startMission(mission.id)}
                                    disabled={!!activeMission}
                                    className="w-full py-2 bg-slate-800 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Swords className="w-4 h-4" />
                                    Aceitar Contrato
                                </button>
                            )}

                            {mission.status === 'active' && (
                                <div className="w-full py-2 bg-purple-900/30 border border-purple-500/30 text-purple-300 font-bold rounded-lg flex items-center justify-center gap-2">
                                    <Clock className="w-4 h-4 animate-spin" />
                                    Em Andamento...
                                </div>
                            )}

                            {mission.status === 'completed' && (
                                <div className="w-full py-2 bg-green-900/20 border border-green-900/30 text-green-500 font-bold rounded-lg flex items-center justify-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Completada
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 text-center text-xs text-slate-600">
                Novas missões são adicionadas a cada 24 horas (simulação).
            </div>
        </div>
    );
};

export default MissionsBoardSupabase;
