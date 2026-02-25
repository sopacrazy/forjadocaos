import React, { useEffect, useState } from 'react';
import { Shield, Map, Swords, Crown, Star, X, Anchor, Sun, Hammer, Trees, Flame } from 'lucide-react';

interface HistoryPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const kingdoms = [
  {
    id: 'valdornia',
    name: 'VALDORNIA — O Reino da Lâmina Dourada',
    leaders: 'Rei Aethron Valdren IV e Rainha Lyssara Valdren',
    generalPower: 9,
    militaryPower: 8.5,
    description: `Valdornia nasceu sobre colinas férteis banhadas por rios encantados. Foi fundada pelo lendário General Kaelor, o Portador do Sol Partido, que unificou tribos humanas sob uma única bandeira. A capital, Aurathis, é conhecida por suas muralhas revestidas de ouro rúnico.
Valdornia possui forte ascendência ocidental, inspirada em antigas casas nobres de cavalaria e honra feudal. O reino acredita na honra, disciplina e supremacia estratégica. Dizem que o primeiro rei fez um pacto com uma entidade solar antiga.`,
    economy: 'Produzem trigo dourado encantado, armaduras rúnicas e espadas solares. O reino prosperou através da agricultura arcana e da metalurgia encantada.',
    military: 'Seu exército é conhecido como A Legião do Estandarte Rubro, composta por cavaleiros rúnicos de linhagem nobre. São mestres em combate tático e magia de reforço corporal baseada em mana.',
    artefact: 'A arma mágica do reino é a Espada Solaris Magna, empunhada apenas pelo monarca.',
    theme: 'from-yellow-900/80 to-yellow-600/20 border-yellow-500',
    headerText: 'text-yellow-400',
    icon: <Crown className="w-10 h-10 text-yellow-500" />
  },
  {
    id: 'frostharn',
    name: 'FROSTHARN — O Domínio do Gelo Eterno',
    leaders: 'Rei Bjornir Skaldheim',
    generalPower: 8.5,
    militaryPower: 9,
    description: `Frostharn surgiu em meio às montanhas congeladas do norte. Fundado pela Rainha Astrid Gélida, que dominava o gelo como extensão do próprio corpo. Seu povo acredita que o frio purifica os fracos. A cidade principal, Hrafnvald, é esculpida em gelo eterno.`,
    economy: 'Domesticam feras árticas gigantes. Produzem cristais de gelo arcano e peles resistentes à magia.',
    military: 'Seu exército é chamado de Guardas da Tempestade Branca. Possuem xamãs capazes de invocar nevascas usando mana elemental. São resistentes, implacáveis e quase impossíveis de deter em terreno gelado.',
    artefact: 'Sua arma lendária é o Machado Skjorn, capaz de congelar mares.',
    theme: 'from-cyan-900/80 to-cyan-600/20 border-cyan-400',
    headerText: 'text-cyan-300',
    icon: <Shield className="w-10 h-10 text-cyan-400" />
  },
  {
    id: 'kardum',
    name: 'KAR-DUM VALEKAR — O Império das Forjas Abissais',
    leaders: 'Thorgar Valekar, o Senhor da Bigorna Negra',
    generalPower: 9.5,
    militaryPower: 9,
    description: `Kar-Dum Valekar é um império subterrâneo forjado por anões de sangue antigo. Fundado pelo Rei Durmak, que domou fogo vulcânico. Cidades inteiras existem sob montanhas ativas.`,
    economy: 'Produzem as melhores armas do continente. Seu minério negro absorve magia inimiga.',
    military: 'São mestres em engenharia bélica e construtos rúnicos movidos a mana. Seu exército, A Falange da Rocha Viva, nunca recuou em batalha. Possuem golems colossais movidos por magma. São praticamente inexpugnáveis em guerra de cerco.',
    artefact: 'Sua relíquia é o Coração de Vul’Drath, uma forja viva alimentada por mana profunda.',
    theme: 'from-orange-950/80 to-orange-700/20 border-orange-600',
    headerText: 'text-orange-500',
    icon: <Hammer className="w-10 h-10 text-orange-600" />
  },
  {
    id: 'eldruun',
    name: 'ELDRUUN — A Floresta Viva',
    leaders: 'Rainha Sylthara Luniel',
    generalPower: 8,
    militaryPower: 7.5,
    description: `Eldruun é um reino élfico ancestral. Fundado por Letharion, o Primeiro Druida. A floresta obedece à vontade da rainha. São estratégicos e silenciosos. Seu poder reside na defesa natural absoluta.`,
    economy: 'Produzem ervas místicas e madeira viva. São mestres em magia natural alimentada por mana vital.',
    military: 'Seu exército é o Círculo das Lâminas Verdes. Invocam espíritos da floresta para lutar.',
    artefact: 'Possuem o artefato Coração de Silvaris, que mantém a floresta consciente.',
    theme: 'from-green-950/80 to-green-700/20 border-green-500',
    headerText: 'text-green-400',
    icon: <Trees className="w-10 h-10 text-green-500" />
  },
  {
    id: 'nerzhal',
    name: 'NER’ZHAL — O Trono Carmesim',
    leaders: 'Imperador Zharvak, o Flamejante',
    generalPower: 9,
    militaryPower: 9.5,
    description: `Ner’Zhal nasceu em terras vulcânicas. Fundado por Malzor, o Senhor das Cinzas. Seu povo domina magia ígnea destrutiva. São ofensivos e devastadores. Raramente deixam sobreviventes. Especialistas em guerra total alimentada por mana ardente.`,
    economy: 'Produzem obsidiana mágica e armas flamejantes.',
    military: 'Seu exército é a Horda da Chama Eterna. Possuem dragões de fogo domesticados.',
    artefact: 'A relíquia imperial é o Orbe de Pyrakos.',
    theme: 'from-red-950/80 to-red-600/20 border-red-600',
    headerText: 'text-red-500',
    icon: <Flame className="w-10 h-10 text-red-600" />
  },
  {
    id: 'eldoria',
    name: 'ELDORIA — O Coração Arcano do Mundo',
    leaders: 'Rei Altherion D’Valis e Rainha Meridya D’Valis',
    generalPower: 10,
    militaryPower: 10,
    description: `Eldoria foi fundada por Arcanum Valoris, o Arquimago Supremo. É o centro do conhecimento mágico mundial. Suas torres flutuam acima da capital Celesthyr.`,
    economy: 'Produzem grimórios, artefatos e cristais de mana pura. Possuem academias que formam os maiores magos vivos.',
    military: `O Exército Supremo: A ORDEM DO VÉU ASTRAL - O mais forte exército já criado. Treinados desde a infância na manipulação pura de magia e mana. Cada soldado vale por cem comuns. Foram responsáveis por conter a Ruptura Dimensional de Kael’Thyr. Marcharam contra três reinos simultaneamente e venceram. Nunca foram derrotados oficialmente.
Duas figuras lendárias:
* Seraphion, o Silente — Dizem que sozinho atravessou as defesas mágicas de Ner’Zhal.
* Lyra Vaelith — Sobreviveu ao Colapso do Portal de Ébano e selou-o com as próprias mãos.
Suas habilidades completas permanecem segredo absoluto.`,
    artefact: 'Seu artefato supremo é o Olho de Aetherion, que prevê rupturas de magia e distorções de mana.',
    theme: 'from-purple-950/80 to-purple-600/20 border-purple-500',
    headerText: 'text-purple-400',
    icon: <Star className="w-10 h-10 text-purple-500" />
  },
  {
    id: 'thalassar',
    name: 'THALASSAR — O Império dos Mares Profundos',
    leaders: 'Rainha Nerithis Mareval',
    generalPower: 8.5,
    militaryPower: 8,
    description: `Thalassar governa os oceanos. Fundado pelo Rei Marinth, o Navegador Abissal. Suas cidades existem sob e sobre as águas. Dominam magia de maré e tempestade. Seu poder naval é incontestável. São mestres em guerra naval e invasão costeira.`,
    economy: 'Produzem pérolas arcanas e aço marinho. Controlam criaturas marítimas colossais.',
    military: 'Seu exército é a Frota Abissal.',
    artefact: 'Possuem o tridente lendário Maré Infinita.',
    theme: 'from-blue-950/80 to-blue-600/20 border-blue-500',
    headerText: 'text-blue-400',
    icon: <Anchor className="w-10 h-10 text-blue-500" />
  },
  {
    id: 'zahrakhemet',
    name: 'ZAHRA-KHEMET — O Reino do Sol Escarlate',
    leaders: 'Faraó Amun-Kareth IX e Rainha Neferis Zahra',
    generalPower: 9,
    militaryPower: 8.5,
    description: `Zahra-Khemet nasceu no deserto eterno. Fundado por Khemet-Ra, o Ungido Solar. Ergueram pirâmides que canalizam energia mágica e mana solar. Guardam segredos proibidos sob suas pirâmides.`,
    economy: 'Produzem especiarias raras e cristais solares. Dominam magia de areia e invocação ancestral.',
    military: 'Além disso, Zahra-Khemet abriga a lendária ordem dos Samurais do Sol Escarlate, guerreiros de disciplina absoluta que misturam técnicas orientais ancestrais com magia solar. Esses samurais são conhecidos por armaduras douradas leves e lâminas curvas encantadas. Seu exército principal é a Guarda do Escaravelho Dourado. São estrategistas e mestres em guerra prolongada no deserto. Invocam tempestades de areia mágicas.',
    artefact: 'Possuem a relíquia Cetro de Rah’Kemet.',
    theme: 'from-amber-950/80 to-amber-600/20 border-amber-500',
    headerText: 'text-amber-500',
    icon: <Sun className="w-10 h-10 text-amber-500" />
  }
];

const HistoryPage: React.FC<HistoryPageProps> = ({ isOpen, onClose }) => {
  const [activeKingdom, setActiveKingdom] = useState<string | null>(null);

  // Fecha no Esc
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
      <div className="sticky top-0 z-[210] p-6 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex justify-between items-center shadow-2xl">
        <h1 className="font-epic text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 tracking-widest drop-shadow-sm">
          A HISTÓRIA DOS REINOS
        </h1>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 hover:border-red-500/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-all shadow-lg"
        >
          <X className="w-5 h-5" />
          <span className="font-bold tracking-wider text-sm">VOLTAR PARA A HOME</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="text-center mb-24 max-w-4xl mx-auto">
          <p className="text-xl text-slate-400 leading-relaxed font-light italic">
            "Os manuscritos ancestrais narram sobre grandes impérios, poder destrutivo e magias que desafiam a própria deidade. O equilíbrio do mundo repousa sobre as lâminas e as vontades destes oitos grandes tronos..."
          </p>
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-yellow-600 to-transparent mx-auto mt-8 opacity-50"></div>
        </div>

        {/* Grid de Reinos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
          {kingdoms.map((k) => (
            <div
              key={k.id}
              className={`group relative overflow-hidden rounded-2xl border-l-[6px] ${k.theme} bg-gradient-to-br backdrop-blur-sm shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)] p-1`}
              onMouseEnter={() => setActiveKingdom(k.id)}
              onMouseLeave={() => setActiveKingdom(null)}
            >
              <div className="bg-slate-950/90 w-full h-full rounded-xl p-8 flex flex-col relative z-10 transition-colors duration-500 group-hover:bg-slate-950/70">
                
                {/* Ícone de fundo abstrato (watermark) */}
                <div className="absolute -bottom-10 -right-10 opacity-[0.03] transform group-hover:scale-125 transition-transform duration-1000 pointer-events-none">
                   {React.cloneElement(k.icon as React.ReactElement<any>, { className: 'w-64 h-64' })}
                </div>

                <div className="flex items-start gap-4 mb-6 relative z-20">
                  <div className="p-3 bg-slate-900/80 rounded-xl shadow-inner border border-slate-700/50">
                    {k.icon}
                  </div>
                  <div>
                    <h2 className={`font-epic text-2xl font-bold uppercase tracking-wide ${k.headerText} mb-1 opacity-90 group-hover:opacity-100`}>
                      {k.name}
                    </h2>
                    <p className="text-sm font-medium text-slate-400 capitalize flex items-center gap-2">
                       <Shield className="w-3 h-3"/> Líderes: <span className="text-slate-200">{k.leaders}</span>
                    </p>
                  </div>
                </div>

                {/* Potência Stats */}
                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="px-4 py-2 rounded-lg bg-black/40 border border-slate-800/60 shadow-inner flex items-center gap-3">
                     <span className="text-xs text-slate-500 uppercase font-black tracking-wider">Potência Geral</span>
                     <span className={`text-lg font-black ${k.headerText}`}>{k.generalPower}/10</span>
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-black/40 border border-slate-800/60 shadow-inner flex items-center gap-3">
                     <span className="text-xs text-slate-500 uppercase font-black tracking-wider">Força Militar</span>
                     <span className={`text-lg font-black ${k.headerText}`}>{k.militaryPower}/10</span>
                  </div>
                </div>

                <div className="space-y-6 text-slate-300/90 text-[15px] leading-relaxed relative z-20">
                  <div>
                    <strong className={`block text-sm uppercase tracking-widest ${k.headerText} opacity-80 mb-2`}>Visão Geral</strong>
                    <p className="whitespace-pre-line">{k.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                      <strong className={`flex items-center gap-2 text-sm uppercase tracking-widest ${k.headerText} opacity-80 mb-2`}>
                        <Swords className="w-4 h-4" /> Militar
                      </strong>
                      <p className="whitespace-pre-line">{k.military}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                      <strong className={`flex items-center gap-2 text-sm uppercase tracking-widest ${k.headerText} opacity-80 mb-2`}>
                        <Map className="w-4 h-4" /> Economia & Produção
                      </strong>
                      <p className="whitespace-pre-line">{k.economy}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900/50 to-transparent border-l-2 border-slate-700">
                    <strong className={`block text-sm uppercase tracking-widest ${k.headerText} opacity-80 mb-1`}>Artefato Local</strong>
                    <p className="italic font-light text-slate-400">{k.artefact}</p>
                  </div>

                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default HistoryPage;
