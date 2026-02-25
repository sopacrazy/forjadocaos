import React, { useEffect, useState } from 'react';
import { Sword, X, Map, Locate, Stars, Sparkles } from 'lucide-react';

interface WeaponsPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const weapons = [
  {
    id: 'noctharis',
    name: '1️⃣ Noctharis, a Ceifadora do Véu',
    level: 105,
    power: '⭐⭐⭐⭐⭐',
    realm: 'Desconhecido',
    location: 'Desaparecida',
    description: 'Foice roxa que drena a força vital de quem toca, deixando-os lentos e cansados enquanto aumenta o vigor do portador.',
    theme: 'from-purple-950/80 to-purple-800/20 border-purple-500',
    headerText: 'text-purple-400',
  },
  {
    id: 'aetherion',
    name: '2️⃣ Aetherion Prime',
    level: 102,
    power: '⭐⭐⭐⭐⭐',
    realm: 'Eldoria',
    location: 'Torre Celesthyr',
    description: 'Espada cristalina que cria barreiras efêmeras de mana ao ser atacada, protegendo o usuário e refletindo parte da energia de volta.',
    theme: 'from-blue-950/80 to-blue-700/20 border-blue-400',
    headerText: 'text-blue-300',
  },
  {
    id: 'solaris',
    name: '3️⃣ Solaris Magna Ascendida',
    level: 100,
    power: '⭐⭐⭐⭐⭐',
    realm: 'Valdornia',
    location: 'Rei Aethron Valdren IV',
    description: 'Espada solar que absorve luz ambiente e transforma em rajadas de calor concentrado, podendo derreter correntes e armaduras metálicas.',
    theme: 'from-yellow-950/80 to-yellow-600/20 border-yellow-500',
    headerText: 'text-yellow-400',
  },
  {
    id: 'akai',
    name: '4️⃣ Akai-Tenshō: Forma Carmesim',
    level: 101,
    power: '⭐⭐⭐⭐⭐',
    realm: 'Zahra-Khemet',
    location: 'Mestre Supremo dos Samurais',
    description: 'Katana que se torna mais afiada com movimentos fluidos, criando cortes invisíveis que desorientam o inimigo sem tocar o corpo.',
    theme: 'from-red-950/80 to-red-600/20 border-red-600',
    headerText: 'text-red-500',
  },
  {
    id: 'eryndor',
    name: '5️⃣ Eryndor',
    level: 103,
    power: '⭐⭐⭐⭐⭐',
    realm: 'Desconhecido',
    location: 'Desaparecida',
    description: 'Espada ancestral que reage a pensamentos do portador, mudando seu comprimento e forma para alcançar inimigos mesmo à distância.',
    theme: 'from-emerald-950/80 to-emerald-600/20 border-emerald-500',
    headerText: 'text-emerald-400',
  },
  {
    id: 'pyrakos',
    name: '6️⃣ Pyrakos Rex',
    level: 99,
    power: '⭐⭐⭐⭐',
    realm: 'Ner’Zhal',
    location: 'Imperador Zharvak',
    description: 'Espada vulcânica que aquece o ar ao redor, criando uma camada de fumaça e vapor que atrapalha a visão e movimentos dos inimigos.',
    theme: 'from-orange-950/80 to-orange-600/20 border-orange-600',
    headerText: 'text-orange-500',
  },
  {
    id: 'skjorn',
    name: '7️⃣ Skjorn Ragnarok',
    level: 98,
    power: '⭐⭐⭐⭐',
    realm: 'Frostharn',
    location: 'Rei Bjornir Skaldheim',
    description: 'Machado colossal que congela não apenas o solo, mas a arma do inimigo ao contato, tornando-a pesada e difícil de manejar.',
    theme: 'from-cyan-950/80 to-cyan-600/20 border-cyan-400',
    headerText: 'text-cyan-300',
  },
  {
    id: 'sylvaranth',
    name: '8️⃣ Sylvaranth Prime',
    level: 96,
    power: '⭐⭐⭐⭐',
    realm: 'Eldruun',
    location: 'Altar central da Floresta Viva',
    description: 'Espada viva que conecta-se à flora local, permitindo ao portador mover-se através de árvores e raízes como se fossem extensões do próprio corpo.',
    theme: 'from-green-950/80 to-green-600/20 border-green-500',
    headerText: 'text-green-400',
  },
  {
    id: 'kurohane',
    name: '9️⃣ Kurohane Eclipse',
    level: 104,
    power: '⭐⭐⭐⭐⭐',
    realm: 'Desconhecido',
    location: 'Desaparecida',
    description: 'Katana sombria que absorve sombras próximas, tornando o portador quase invisível à noite e permitindo ataques furtivos imprevisíveis.',
    theme: 'from-slate-900/80 to-slate-700/20 border-slate-600',
    headerText: 'text-slate-400',
  },
  {
    id: 'mare',
    name: '🔟 Maré Infinita — Forma Leviatã',
    level: 97,
    power: '⭐⭐⭐⭐',
    realm: 'Thalassar',
    location: 'Rainha Nerithis Mareval',
    description: 'Tridente que manipula correntes e ondas, podendo criar pequenos redemoinhos ou levantar colunas de água para proteger aliados ou bloquear inimigos.',
    theme: 'from-sky-950/80 to-sky-600/20 border-sky-400',
    headerText: 'text-sky-300',
  }
];

const WeaponsPage: React.FC<WeaponsPageProps> = ({ isOpen, onClose }) => {
  const [activeWeapon, setActiveWeapon] = useState<string | null>(null);

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
      <div className="sticky top-0 z-[210] p-6 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex justify-between items-center shadow-2xl">
        <h1 className="font-epic text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-yellow-500 tracking-widest drop-shadow-sm flex items-center gap-3">
          <Sword className="w-8 h-8 text-orange-400 hidden sm:block" />
          ARSENAL MÍTICO
        </h1>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 hover:border-red-500/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-all shadow-lg"
        >
          <X className="w-5 h-5" />
          <span className="font-bold tracking-wider text-sm hidden sm:inline">VOLTAR PARA A HOME</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-24 max-w-4xl mx-auto">
          <p className="text-xl text-slate-400 leading-relaxed font-light italic">
            "Forjadas no fogo do caos e moldadas em eras há muito esquecidas, estas são as armas relíquias que desenharam fronteiras e dividiram oceanos em suas respectivas épocas."
          </p>
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-orange-600 to-transparent mx-auto mt-8 opacity-50"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {weapons.map((w) => (
            <div
              key={w.id}
              className={`group relative overflow-hidden rounded-2xl border-l-[6px] border-b-[2px] border-r-[2px] border-t-[2px] ${w.theme} bg-gradient-to-br backdrop-blur-sm shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.1)] p-1`}
              onMouseEnter={() => setActiveWeapon(w.id)}
              onMouseLeave={() => setActiveWeapon(null)}
            >
              <div className="bg-slate-950/95 w-full h-full rounded-xl p-8 flex flex-col relative z-10 transition-colors duration-500 group-hover:bg-slate-950/80">
                
                <div className="absolute top-4 right-4 text-6xl opacity-5 drop-shadow-lg group-hover:scale-110 group-hover:opacity-10 transition-all duration-700 pointer-events-none origin-center">
                   ⚔️
                </div>

                <div className="flex flex-col mb-6 relative z-20">
                    <h2 className={`font-epic text-2xl font-bold uppercase tracking-wide ${w.headerText} mb-4 opacity-90 group-hover:opacity-100 flex items-center gap-3`}>
                      {w.name}
                    </h2>
                    <div className="flex flex-wrap gap-4 mb-2">
                      <div className="px-3 py-1 rounded-md bg-black/50 border border-slate-800 flex items-center gap-2">
                        <Stars className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-300 font-bold uppercase tracking-wider">Level: {w.level}</span>
                      </div>
                      <div className="px-3 py-1 rounded-md bg-black/50 border border-slate-800 flex items-center gap-2">
                        <span className="text-sm text-yellow-500 font-bold tracking-wider">Potência: {w.power}</span>
                      </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 relative z-20">
                  <div className="p-4 rounded-xl bg-black/40 border border-slate-800/80 shadow-inner">
                     <div className="flex items-center gap-2 mb-1 text-slate-500 text-xs uppercase font-black tracking-widest">
                       <Map className="w-4 h-4" /> Reino Original
                     </div>
                     <span className="text-slate-200 font-medium font-epic text-lg">{w.realm}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-slate-800/80 shadow-inner">
                     <div className="flex items-center gap-2 mb-1 text-slate-500 text-xs uppercase font-black tracking-widest">
                       <Locate className="w-4 h-4" /> Paradeiro Atual
                     </div>
                     <span className="text-slate-200 font-medium font-epic text-lg">{w.location}</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900/60 to-transparent border-l-2 border-slate-700 mt-auto relative z-20">
                  <strong className={`block text-xs uppercase tracking-widest ${w.headerText} opacity-80 mb-2 flex items-center gap-2`}>
                    <Sparkles className="w-4 h-4"/> Efeito Poderoso
                  </strong>
                  <p className="text-slate-300 leading-relaxed font-light italic">"{w.description}"</p>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeaponsPage;
