import React, { useEffect, useState } from 'react';
import { Moon, Clock, Zap, Flame, Sun, Book, Droplets, PawPrint, Sparkles, Scale, Ghost, X, Star } from 'lucide-react';

interface EntitiesPageProps {
    isOpen: boolean;
    onClose: () => void;
}

const entities = [
    {
        id: 'aetherion',
        numero: 1,
        name: 'Aetherion Mikadzuki',
        title: 'Senhor do Espaço Velado',
        responsavel: 'Dimensões e Portais',
        feito: 'Dobrou o céu para salvar um planeta',
        arma: 'Arco Void Horizon',
        nivel: 10,
        pedido: 'Se perder voluntariamente uma vez',
        theme: 'from-indigo-950/80 to-indigo-600/20 border-indigo-500',
        headerText: 'text-indigo-400',
        icon: <Moon className="w-10 h-10 text-indigo-500" />
    },
    {
        id: 'sephiron',
        numero: 2,
        name: 'Sephiron Kael',
        title: 'Arquiteto do Tempo',
        responsavel: 'Passado, presente e futuro',
        feito: 'Apagou um século inteiro',
        arma: 'Ampulheta-Foice Chrono Sever',
        nivel: 10,
        pedido: 'Roubar um ano de vida',
        theme: 'from-amber-950/80 to-amber-600/20 border-amber-500',
        headerText: 'text-amber-400',
        icon: <Clock className="w-10 h-10 text-amber-500" />
    },
    {
        id: 'kaizen',
        numero: 3,
        name: 'Kaizen Mordrith',
        title: 'Imperador da Evolução',
        responsavel: 'Mutação e Progresso',
        feito: 'Transformou uma tribo em império numa noite',
        arma: 'Katana Darwin no Kiba',
        nivel: 9,
        pedido: 'Abandonar algo do passado',
        theme: 'from-emerald-950/80 to-emerald-600/20 border-emerald-500',
        headerText: 'text-emerald-400',
        icon: <Zap className="w-10 h-10 text-emerald-500" />
    },
    {
        id: 'torakai',
        numero: 4,
        name: 'Torakai Ignivar',
        title: 'Dragão do Fogo Primordial',
        responsavel: 'Chamas e Vulcões',
        feito: 'Forjou a primeira montanha',
        arma: 'Martelo Hellforge Titan',
        nivel: 9,
        pedido: 'Sacrificar algo amado',
        theme: 'from-red-950/80 to-red-600/20 border-red-500',
        headerText: 'text-red-500',
        icon: <Flame className="w-10 h-10 text-red-600" />
    },
    {
        id: 'lumina',
        numero: 5,
        name: 'Lumina Serakel',
        title: 'Dama da Luz Sagrada',
        responsavel: 'Cura e Esperança',
        feito: 'Reviveu uma cidade inteira',
        arma: 'Bastão Halo Genesis',
        nivel: 8,
        pedido: 'Nenhum — responde apenas a corações puros',
        theme: 'from-yellow-950/80 to-yellow-600/20 border-yellow-400',
        headerText: 'text-yellow-300',
        icon: <Sun className="w-10 h-10 text-yellow-500" />
    },
    {
        id: 'velkan',
        numero: 6,
        name: 'Velkan Shōrai',
        title: 'Arauto do Destino Final',
        responsavel: 'Profecias e Inevitabilidade',
        feito: 'Previu a queda de três deuses — e aconteceu',
        arma: 'Livro-Lâmina Last Testament',
        nivel: 9,
        pedido: 'Aceitar um destino doloroso',
        theme: 'from-slate-900/80 to-slate-600/20 border-slate-500',
        headerText: 'text-slate-400',
        icon: <Book className="w-10 h-10 text-slate-500" />
    },
    {
        id: 'ryujel',
        numero: 7,
        name: 'Ryujel Aratoth',
        title: 'Senhor das Profundezas',
        responsavel: 'Oceanos e Mistérios',
        feito: 'Afundou uma civilização com um sussurro',
        arma: 'Tridente Abyss Leviathan',
        nivel: 8,
        pedido: 'Silêncio absoluto por 24h',
        theme: 'from-blue-950/80 to-blue-600/20 border-blue-500',
        headerText: 'text-blue-400',
        icon: <Droplets className="w-10 h-10 text-blue-500" />
    },
    {
        id: 'okami',
        numero: 8,
        name: 'Okami Valthera',
        title: 'Guardiã das Feras Antigas',
        responsavel: 'Animais e Instinto',
        feito: 'Convocou bestas para destruir um exército',
        arma: 'Garras Primal Claws',
        nivel: 8,
        pedido: 'Carne fresca oferecida à natureza',
        theme: 'from-green-950/80 to-green-600/20 border-green-500',
        headerText: 'text-green-400',
        icon: <PawPrint className="w-10 h-10 text-green-500" />
    },
    {
        id: 'nihalos',
        numero: 9,
        name: 'Nihalos Virex',
        title: 'Espírito do Caos Criativo',
        responsavel: 'Sorte e Coincidências',
        feito: 'Fez um mortal derrotar um titã com uma pedra',
        arma: 'Dagas Chance & Fate',
        nivel: 7,
        pedido: 'Um ato de loucura espontâneo',
        theme: 'from-fuchsia-950/80 to-fuchsia-600/20 border-fuchsia-500',
        headerText: 'text-fuchsia-400',
        icon: <Sparkles className="w-10 h-10 text-fuchsia-500" />
    },
    {
        id: 'gorath',
        numero: 10,
        name: 'Gorath Enmajin',
        title: 'Juiz do Abismo',
        responsavel: 'Punição e Infernos',
        feito: 'Aprisionou sete reis demoníacos',
        arma: 'Correntes Judgment Chains',
        nivel: 8,
        pedido: 'Confessar um pecado real',
        theme: 'from-stone-950/80 to-stone-600/20 border-stone-500',
        headerText: 'text-stone-400',
        icon: <Scale className="w-10 h-10 text-stone-500" />
    },
    {
        id: 'yurei',
        numero: 11,
        name: 'Yurei Solvath',
        title: 'Rainha das Almas Errantes',
        responsavel: 'Espíritos e Passagem entre mundos',
        feito: 'Guiou milhões de almas após uma guerra divina',
        arma: 'Véu-Lâmina Shikon Thread',
        nivel: 8,
        pedido: 'Uma lágrima verdadeira',
        theme: 'from-teal-950/80 to-teal-600/20 border-teal-500',
        headerText: 'text-teal-400',
        icon: <Ghost className="w-10 h-10 text-teal-500" />
    }
];

const renderStars = (count: number) => {
    return Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500 animate-pulse" />
    ));
};

const EntitiesPage: React.FC<EntitiesPageProps> = ({ isOpen, onClose }) => {
    const [activeEntity, setActiveEntity] = useState<string | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-[#0a0a0c] overflow-y-auto w-full h-full text-slate-300 font-sans">
            {/* Top Navbar */}
            <div className="sticky top-0 z-[210] p-4 md:p-6 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex justify-between items-center shadow-2xl gap-4">
                <h1 className="font-epic text-xl md:text-3xl flex-1 font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-500 tracking-widest drop-shadow-sm uppercase leading-tight">
                    <span className="md:hidden">ENTIDADES</span>
                    <span className="hidden md:inline">AS 11 ENTIDADES CONHECIDAS</span>
                </h1>
                <button
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-slate-900 border border-slate-700 hover:border-red-500/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-all shadow-lg flex-shrink-0"
                >
                    <X className="w-5 h-5" />
                    <span className="hidden sm:inline font-bold tracking-wider text-sm">VOLTAR PARA A HOME</span>
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">

                <div className="text-center mb-16 max-w-4xl mx-auto">
                    <p className="text-xl text-slate-400 leading-relaxed font-light italic">
                        "Antes dos reinos, antes da magia mortal, havia as Vontades Primordiais. Elas moldaram a realidade, o tempo e as almas."
                    </p>
                    <div className="h-1 w-32 bg-gradient-to-r from-transparent via-purple-600 to-transparent mx-auto mt-8 opacity-50"></div>
                </div>

                {/* Entities Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
                    {entities.map((entidade) => (
                        <div
                            key={entidade.id}
                            className={`group relative overflow-hidden rounded-2xl border-l-[6px] ${entidade.theme} bg-gradient-to-br backdrop-blur-sm shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)] p-1`}
                            onMouseEnter={() => setActiveEntity(entidade.id)}
                            onMouseLeave={() => setActiveEntity(null)}
                        >
                            <div className="bg-slate-950/90 w-full h-full rounded-xl p-5 md:p-8 flex flex-col relative z-10 transition-colors duration-500 group-hover:bg-slate-950/70">

                                {/* Ícone de fundo abstrato (watermark) */}
                                <div className="absolute -bottom-10 -right-10 opacity-[0.03] transform group-hover:scale-125 transition-transform duration-1000 pointer-events-none">
                                    {React.cloneElement(entidade.icon as React.ReactElement<any>, { className: 'w-64 h-64' })}
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 mb-5 md:mb-6 relative z-20 flex-wrap">
                                    <div className="p-2 md:p-3 bg-slate-900/80 rounded-xl shadow-inner border border-slate-700/50 self-start sm:self-auto flex-shrink-0">
                                        {/* Modifying icon size directly */}
                                        <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                                            {React.cloneElement(entidade.icon as React.ReactElement<any>, { className: 'w-full h-full text-current' })}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className={`font-epic text-xl md:text-2xl font-bold uppercase tracking-wide ${entidade.headerText} mb-1 opacity-90 group-hover:opacity-100 flex items-center gap-2 flex-wrap`}>
                                            <span className="text-lg md:text-xl opacity-60 flex-shrink-0">#{entidade.numero}</span>
                                            <span className="break-words">{entidade.name}</span>
                                        </h2>
                                        <p className="text-xs md:text-sm font-medium text-slate-400 uppercase tracking-widest leading-relaxed">
                                            {entidade.title}
                                        </p>
                                    </div>
                                </div>

                                {/* Potência Stats */}
                                <div className="flex flex-wrap gap-3 md:gap-4 mb-6 md:mb-8">
                                    <div className="px-3 md:px-4 py-2 md:py-3 rounded-lg bg-black/40 border border-slate-800/60 shadow-inner flex flex-row items-center gap-3 md:gap-4 w-full">
                                        <span className="text-[10px] md:text-xs text-slate-500 uppercase font-black tracking-wider w-auto">Nível</span>
                                        <div className="flex flex-wrap gap-1">
                                            {renderStars(entidade.nivel)}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 text-slate-300/90 text-[15px] leading-relaxed relative z-20">
                                    <div>
                                        <strong className={`block text-xs md:text-sm uppercase tracking-widest ${entidade.headerText} opacity-80 mb-1 md:mb-2`}>Domínio / Responsabilidade</strong>
                                        <p className="whitespace-pre-line text-base md:text-lg font-light text-slate-200">{entidade.responsavel}</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:gap-6">
                                        <div className="p-3 md:p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                                            <strong className={`flex items-center gap-2 text-xs md:text-sm uppercase tracking-widest ${entidade.headerText} opacity-80 mb-1 md:mb-2`}>
                                                Maior Feito Registrado
                                            </strong>
                                            <p className="whitespace-pre-line text-sm md:text-base text-slate-300 italic">"{entidade.feito}"</p>
                                        </div>

                                        <div className="p-3 md:p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                                            <strong className={`flex items-center gap-2 text-xs md:text-sm uppercase tracking-widest ${entidade.headerText} opacity-80 mb-1 md:mb-2`}>
                                                Arma Celestial
                                            </strong>
                                            <p className="whitespace-pre-line text-sm md:text-base font-bold text-slate-200">{entidade.arma}</p>
                                        </div>
                                    </div>

                                    <div className="p-3 md:p-4 rounded-xl bg-gradient-to-r from-red-950/30 to-transparent border-l-2 border-red-900/50">
                                        <strong className="block text-xs md:text-sm uppercase tracking-widest text-red-400 opacity-90 mb-1">Pedido / Tributo</strong>
                                        <p className="text-sm md:text-base font-medium text-red-200/80">{entidade.pedido}</p>
                                    </div>

                                </div>

                            </div>
                        </div>
                    ))}
                </div>

                {/* Registro Proibido - Rodapé especial */}
                <div className="mt-12 md:mt-20 p-6 md:p-8 rounded-2xl border border-red-900/50 bg-black/60 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>
                    <div className="relative z-10 text-center">
                        <h3 className="font-epic text-2xl md:text-3xl font-black text-red-600 mb-4 tracking-widest uppercase flex justify-center items-center gap-2 md:gap-3 flex-wrap">
                            <Book className="w-6 h-6 md:w-8 md:h-8 text-red-700" /> Registro Proibido
                        </h3>
                        <p className="text-sm md:text-lg text-slate-300 font-light max-w-2xl mx-auto uppercase tracking-wide leading-relaxed">
                            Estes onze são apenas os nomes permitidos aos mortais.<br />
                            <span className="text-red-500 font-bold block mt-3">Existem entidades esquecidas que nem o tempo ousa lembrar.</span>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EntitiesPage;
