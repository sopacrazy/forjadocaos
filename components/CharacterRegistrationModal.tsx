import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface CharacterRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (characterData: any) => void;
}

const CharacterRegistrationModal: React.FC<CharacterRegistrationModalProps> = ({
    isOpen,
    onClose,
    onComplete
}) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        nome: '',
        sexo: '',
        idade: '',
        raca: '',
        origem: '',
        rank: 'E',
        nivel: 1,
        xpAtual: 0,
        xpProximo: 100,
        forca: 0,
        destreza: 0,
        inteligencia: 0,
        velocidade: 0,
        pontosDisponiveis: 10,
        peBase: 10,
        peLivre: 0,
        peDistribuir: 0,
        pvMaximo: 10,
        pvAtual: 10,
        dinheiro: 0,
        historia: '',
        habilidades: [
            { nome: '', custo: 0 },
            { nome: '', custo: 0 },
            { nome: '', custo: 0 }
        ],
        observacoes: ''
    });

    const ranks = ['E', 'D', 'C', 'B', 'A', 'S', 'SS'];
    const sexos = ['Masculino', 'Feminino', 'Outro'];

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAttributeChange = (attr: string, value: number) => {
        const currentValue = formData[attr as keyof typeof formData] as number;
        const diff = value - currentValue;

        if (formData.pontosDisponiveis - diff >= 0 && value >= 0) {
            setFormData(prev => ({
                ...prev,
                [attr]: value,
                pontosDisponiveis: prev.pontosDisponiveis - diff,
                pvMaximo: attr === 'forca' ? 10 + value : prev.pvMaximo
            }));
        }
    };

    const handleSubmit = () => {
        // Validação básica
        if (!formData.nome || !formData.sexo || !formData.raca) {
            alert('Por favor, preencha os campos obrigatórios: Nome, Sexo e Raça');
            return;
        }

        // Converter para formato do banco (snake_case) e tipos corretos
        const characterData = {
            nome: formData.nome,
            sexo: formData.sexo,
            idade: formData.idade ? parseInt(formData.idade.toString()) : null,
            raca: formData.raca,
            origem: formData.origem,
            rank: formData.rank,
            nivel: formData.nivel,
            xp_atual: formData.xpAtual,
            xp_proximo: formData.xpProximo,
            forca: formData.forca,
            destreza: formData.destreza,
            inteligencia: formData.inteligencia,
            velocidade: formData.velocidade,
            pontos_disponiveis: formData.pontosDisponiveis,
            pe_base: formData.peBase,
            pe_livre: formData.peLivre,
            pe_distribuir: formData.peDistribuir,
            pe_total: 10, // Assumindo valor padrão ou calculado
            pv_maximo: formData.pvMaximo,
            pv_atual: formData.pvAtual,
            dinheiro: formData.dinheiro,
            historia: formData.historia,
            habilidades: formData.habilidades,
            observacoes: formData.observacoes
        };

        onComplete(characterData);
    };

    const nextStep = () => {
        if (step === 1 && (!formData.nome || !formData.sexo || !formData.raca)) {
            alert('Por favor, preencha Nome, Sexo e Raça antes de continuar');
            return;
        }
        setStep(prev => Math.min(prev + 1, 4));
    };

    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[250] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="relative bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border-2 border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/20 w-full max-w-3xl my-8">
                {/* Header */}
                <div className="relative border-b border-purple-500/30 p-6 md:p-8">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/50 hover:bg-red-600/50 border border-slate-700/50 hover:border-red-500/50 transition-all group"
                    >
                        <X className="w-5 h-5 text-slate-400 group-hover:text-white" />
                    </button>

                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-4">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="text-xs uppercase tracking-widest font-bold text-purple-300">Criação de Personagem</span>
                        </div>
                        <h2 className="font-epic text-3xl md:text-4xl font-black gold-gradient mb-2">Ficha de Inscrição</h2>
                        <p className="text-slate-400 text-sm">Passo {step} de 4</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-300"
                            style={{ width: `${(step / 4) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto">
                    {/* PASSO 1: Informações Básicas */}
                    {step === 1 && (
                        <div className="space-y-4 md:space-y-6">
                            <h3 className="text-xl font-bold text-white mb-4">📋 Informações Básicas</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">
                                        Nome <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nome}
                                        onChange={(e) => handleInputChange('nome', e.target.value)}
                                        placeholder="Digite o nome do personagem"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">
                                        Sexo <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        value={formData.sexo}
                                        onChange={(e) => handleInputChange('sexo', e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    >
                                        <option value="">Selecione...</option>
                                        {sexos.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Idade</label>
                                    <input
                                        type="number"
                                        value={formData.idade}
                                        onChange={(e) => handleInputChange('idade', e.target.value)}
                                        placeholder="Ex: 25"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">
                                        Raça / Espécie <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.raca}
                                        onChange={(e) => handleInputChange('raca', e.target.value)}
                                        placeholder="Ex: Humano, Elfo, Orc..."
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-300 mb-2">
                                        Origem (Deus, Religião, Entidade)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.origem}
                                        onChange={(e) => handleInputChange('origem', e.target.value)}
                                        placeholder="Ex: Seguidor de Zeus, Adorador do Caos..."
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PASSO 2: Progressão e Atributos */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white mb-4">📊 Atributos e Progressão</h3>

                            {/* Rank */}
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">🏅 Rank Inicial</label>
                                <div className="flex gap-2 flex-wrap">
                                    {ranks.map(r => (
                                        <button
                                            key={r}
                                            onClick={() => handleInputChange('rank', r)}
                                            className={`px-4 py-2 rounded-lg font-bold transition-all ${formData.rank === r
                                                ? 'bg-yellow-500 text-black'
                                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Atributos */}
                            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 md:p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-white">Distribuir Atributos</h4>
                                    <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                                        <span className="text-sm font-bold text-purple-300">
                                            {formData.pontosDisponiveis} pontos disponíveis
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { key: 'forca', label: '💪 Força', icon: '💪' },
                                        { key: 'destreza', label: '🎯 Destreza', icon: '🎯' },
                                        { key: 'inteligencia', label: '🧠 Inteligência', icon: '🧠' },
                                        { key: 'velocidade', label: '⚡ Velocidade', icon: '⚡' }
                                    ].map(attr => (
                                        <div key={attr.key} className="flex items-center gap-4">
                                            <span className="text-sm font-bold text-slate-300 w-32">{attr.label}</span>
                                            <button
                                                onClick={() => handleAttributeChange(attr.key, Math.max(0, formData[attr.key as keyof typeof formData] as number - 1))}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="w-12 text-center font-bold text-white text-lg">
                                                {formData[attr.key as keyof typeof formData]}
                                            </span>
                                            <button
                                                onClick={() => handleAttributeChange(attr.key, (formData[attr.key as keyof typeof formData] as number) + 1)}
                                                disabled={formData.pontosDisponiveis === 0}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* PV */}
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-green-300">❤️ Pontos de Vida (PV)</span>
                                    <span className="text-lg font-bold text-white">
                                        {formData.pvMaximo} <span className="text-xs text-slate-400">(10 + FOR)</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PASSO 3: História e Habilidades */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white mb-4">📖 História e Habilidades</h3>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">História do Personagem</label>
                                <textarea
                                    value={formData.historia}
                                    onChange={(e) => handleInputChange('historia', e.target.value)}
                                    placeholder="Conte a origem, passado, motivações e relação com o mundo..."
                                    rows={5}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-3">⚔️ Habilidades Iniciais</label>
                                <div className="space-y-3">
                                    {formData.habilidades.map((hab, index) => (
                                        <div key={index} className="flex gap-3">
                                            <input
                                                type="text"
                                                value={hab.nome}
                                                onChange={(e) => {
                                                    const newHabs = [...formData.habilidades];
                                                    newHabs[index].nome = e.target.value;
                                                    handleInputChange('habilidades', newHabs);
                                                }}
                                                placeholder={`Habilidade ${index + 1}`}
                                                className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
                                            />
                                            <input
                                                type="number"
                                                value={hab.custo}
                                                onChange={(e) => {
                                                    const newHabs = [...formData.habilidades];
                                                    newHabs[index].custo = parseInt(e.target.value) || 0;
                                                    handleInputChange('habilidades', newHabs);
                                                }}
                                                placeholder="PE"
                                                className="w-20 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">📝 Observações</label>
                                <textarea
                                    value={formData.observacoes}
                                    onChange={(e) => handleInputChange('observacoes', e.target.value)}
                                    placeholder="Bênçãos, maldições, juramentos, marcas, efeitos narrativos..."
                                    rows={3}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600 resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* PASSO 4: Revisão */}
                    {step === 4 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white mb-4">✨ Revisão Final</h3>

                            <div className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border border-purple-500/30 rounded-xl p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-400">Nome:</span>
                                        <p className="font-bold text-white">{formData.nome || '-'}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Sexo:</span>
                                        <p className="font-bold text-white">{formData.sexo || '-'}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Raça:</span>
                                        <p className="font-bold text-white">{formData.raca || '-'}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Rank:</span>
                                        <p className="font-bold text-yellow-400">{formData.rank}</p>
                                    </div>
                                </div>

                                <div className="border-t border-slate-700 pt-4">
                                    <h4 className="font-bold text-white mb-2">Atributos</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                        <div className="text-center">
                                            <span className="text-slate-400">💪 FOR</span>
                                            <p className="font-bold text-white text-lg">{formData.forca}</p>
                                        </div>
                                        <div className="text-center">
                                            <span className="text-slate-400">🎯 DES</span>
                                            <p className="font-bold text-white text-lg">{formData.destreza}</p>
                                        </div>
                                        <div className="text-center">
                                            <span className="text-slate-400">🧠 INT</span>
                                            <p className="font-bold text-white text-lg">{formData.inteligencia}</p>
                                        </div>
                                        <div className="text-center">
                                            <span className="text-slate-400">⚡ VEL</span>
                                            <p className="font-bold text-white text-lg">{formData.velocidade}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                    <span className="text-sm text-green-300">❤️ PV Máximo: </span>
                                    <span className="font-bold text-white text-lg">{formData.pvMaximo}</span>
                                </div>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <p className="text-sm text-blue-300 text-center">
                                    ✨ Ao confirmar, seu personagem será criado e você entrará na sala de RPG!
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer - Navigation */}
                <div className="border-t border-purple-500/30 p-6 flex justify-between gap-4">
                    <button
                        onClick={prevStep}
                        disabled={step === 1}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:cursor-not-allowed text-white font-bold transition-all disabled:opacity-50"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span className="hidden md:inline">Anterior</span>
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={nextStep}
                            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold transition-all shadow-lg shadow-purple-500/30"
                        >
                            <span className="hidden md:inline">Próximo</span>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold transition-all shadow-lg shadow-green-500/30"
                        >
                            <Sparkles className="w-5 h-5" />
                            Confirmar e Entrar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CharacterRegistrationModal;
