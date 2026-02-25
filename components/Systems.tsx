
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // Import supabase
import { 
  TrendingUp, Dna, Zap, Target, Coins, Clock, ShieldAlert, ArrowRightLeft,
  ChevronRight, Church, Calculator, Brain, Wind, BicepsFlexed, Crosshair,
  Heart, Sword, Scroll, Wand2, FileText, Flame, ShieldCheck, ZapOff,
  Mountain, Sparkles, Waves
} from 'lucide-react';

const Systems: React.FC = () => {
  const [content, setContent] = useState({
    intro: {
      title: 'Tratado do Equilíbrio',
      subtitle: '"Para forjar o futuro, deve-se primeiro compreender as correntes que movem o multiverso."'
    },
    journey: {
      content: `
        <li class="flex items-start gap-2"><span class="w-4 h-4 mt-1 text-purple-500 inline-block"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></span><span><strong>10 Pontos iniciais</strong> para distribuição livre entre atributos.</span></li>
        <li class="flex items-start gap-2"><span class="w-4 h-4 mt-1 text-purple-500 inline-block"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></span><span>Respeite sempre o <strong>Limite do Rank</strong> (veja tabela abaixo).</span></li>
        <li class="flex items-start gap-2"><span class="w-4 h-4 mt-1 text-purple-500 inline-block"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></span><span>Personagens de qualquer origem: deuses, criaturas e híbridos.</span></li>
      `
    },
    update: {
      content: `O fluxo de tempo na Forja é sagrado. Pontos de nível (<strong>+2 PA e +2 PE</strong>) são aplicados <strong>1 vez por semana</strong>.`
    }
  });

  useEffect(() => {
    async function loadContent() {
      const { data } = await supabase
        .from('site_content')
        .select('*')
        .in('section', ['rules_intro', 'rules_journey', 'rules_update']);

      if (data) {
        const newContent = { ...content };
        data.forEach(item => {
          if (item.section === 'rules_intro') {
            newContent.intro = { title: item.title, subtitle: item.subtitle };
          } else if (item.section === 'rules_journey') {
            // Adaptar estrutura de lista se vier HTML bruto
            newContent.journey = { content: item.content };
          } else if (item.section === 'rules_update') {
            newContent.update = { content: item.content };
          }
        });
        setContent(newContent);
      }
    }
    loadContent();
  }, []);

  const [progressionData, setProgressionData] = useState<any[]>([]);

  useEffect(() => {
    async function loadProgression() {
      const { data } = await supabase
        .from('progression_table')
        .select('*')
        .order('order_index', { ascending: true });
      if (data) setProgressionData(data);
    }
    loadProgression();
  }, []);

  const [skills, setSkills] = useState<any[]>([]);
  const [economyData, setEconomyData] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
        const { data: progData } = await supabase.from('progression_table').select('*').order('order_index', { ascending: true });
        if (progData) setProgressionData(progData);

        const { data: skillsData } = await supabase.from('skills').select('*').order('order_index', { ascending: true });
        if (skillsData) setSkills(skillsData);

        const { data: ecoData } = await supabase.from('economy_table').select('*').order('order_index', { ascending: true });
        if (ecoData) setEconomyData(ecoData);
    }
    loadData();
  }, []);

  const getSkillsByRank = (rank: string) => skills.filter(s => s.rank === rank);

  return (
    <section className="py-24 px-4 bg-mystic relative overflow-hidden" id="systems">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-900/10 blur-[150px] -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-900/10 blur-[150px] -z-10"></div>

      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <Scroll className="w-12 h-12 text-yellow-500" />
          </div>
          <h2 className="font-epic text-4xl md:text-5xl font-bold text-slate-100 mb-4 uppercase tracking-tighter">
            {content.intro.title.split(' ').slice(0, -1).join(' ')} <span className="gold-gradient">{content.intro.title.split(' ').slice(-1)}</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto italic">
            {content.intro.subtitle}
          </p>
        </div>

        {/* 1. ATRIBUTOS E COMBATE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-md">
            <h3 className="font-epic text-2xl text-yellow-500 mb-6 flex items-center gap-3">
              <Dna className="w-6 h-6" /> Fundamentos do Ser
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { icon: <BicepsFlexed />, label: "FOR", name: "Força", desc: "Poder físico e resistência" },
                { icon: <Crosshair />, label: "DES", name: "Destreza", desc: "Precisão e agilidade" },
                { icon: <Brain />, label: "INT", name: "Inteligência", desc: "Magia e raciocínio" },
                { icon: <Wind />, label: "VEL", name: "Velocidade", desc: "Reação e iniciativa" }
              ].map((attr, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 hover:border-yellow-500/30 transition-all group">
                  <div className="text-yellow-500 mb-2 group-hover:scale-110 transition-transform">{attr.icon}</div>
                  <div className="font-black text-slate-100">{attr.label}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest">{attr.name}</div>
                  <div className="text-[9px] text-slate-600 mt-1 leading-tight">{attr.desc}</div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/30 flex items-center gap-4">
                <Heart className="w-8 h-8 text-red-500" />
                <div>
                  <div className="text-xs uppercase text-red-400 font-bold">Vida (PV)</div>
                  <div className="text-lg font-epic text-slate-100">10 + FOR</div>
                  <div className="text-[10px] text-red-400/70">0 PV = Gravemente Ferido</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/30 flex items-center gap-4">
                <Zap className="w-8 h-8 text-blue-400" />
                <div>
                  <div className="text-xs uppercase text-blue-400 font-bold">Energia (PE)</div>
                  <div className="text-lg font-epic text-slate-100">10 Base + PE Livre</div>
                  <div className="text-[10px] text-blue-400/70">PE Livre aumenta +2 por nível</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h4 className="font-epic text-lg text-purple-400 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" /> Início da Jornada
              </h4>
              <ul 
                className="space-y-3 text-sm text-slate-400 [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_strong]:text-slate-200"
                dangerouslySetInnerHTML={{ __html: content.journey.content }}
              />
            </div>

            <div className="p-6 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 relative">
               <div className="absolute top-4 right-4 opacity-10"><Church className="w-12 h-12 text-yellow-500" /></div>
               <h4 className="font-epic text-lg text-yellow-500 mb-4 flex items-center gap-2">
                <Church className="w-5 h-5" /> Regras de Atualização
              </h4>
              <div 
                className="space-y-4 text-xs text-slate-400 leading-relaxed [&_strong]:text-slate-200"
                dangerouslySetInnerHTML={{ __html: content.update.content }}
              />
            </div>
          </div>
        </div>

        {/* 2. TABELA DE PROGRESSÃO E RANK */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="text-purple-500 w-6 h-6" />
            <h3 className="font-epic text-2xl text-slate-100">Progressão & Limites</h3>
          </div>
          
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-800/80 text-yellow-500 font-epic text-xs uppercase tracking-widest">
                  <th className="p-6">Rank</th>
                  <th className="p-6">Níveis</th>
                  <th className="p-6">Limite p/ Atrib.</th>
                  <th className="p-6">XP Necessário</th>
                  <th className="p-6">Ganhos / Nv</th>
                </tr>
              </thead>
              <tbody className="text-slate-300 text-sm">
                {(progressionData.length > 0 ? progressionData : [
                  { rank: 'E', levels: '1 – 5', attribute_limit: '5', xp_required: 'Nv x 100', gains: '+2 PA / +2 PE' },
                  { rank: 'D', levels: '6 – 10', attribute_limit: '6', xp_required: 'Nv x 100', gains: '+2 PA / +2 PE' },
                  { rank: 'C', levels: '11 – 20', attribute_limit: '7', xp_required: 'Nv x 100', gains: '+2 PA / +2 PE' },
                  { rank: 'B', levels: '21 – 30', attribute_limit: '8', xp_required: 'Nv x 100', gains: '+2 PA / +2 PE' },
                  { rank: 'A', levels: '31 – 40', attribute_limit: '9', xp_required: 'Nv x 100', gains: '+2 PA / +2 PE' },
                  { rank: 'S', levels: '41 – 50', attribute_limit: '10', xp_required: 'Nv x 100', gains: '+2 PA / +2 PE' },
                  { rank: 'SS / SE', levels: '51+', attribute_limit: '12', xp_required: 'Dobra a cada nível', gains: '+2 PA / +2 PE' },
                ]).map((row, i) => (
                  <tr key={i} className="hover:bg-purple-500/5 border-b border-slate-800/50 last:border-0 transition-colors">
                    <td className="p-6 font-epic font-bold text-purple-400">{row.rank}</td>
                    <td className="p-6">{row.levels}</td>
                    <td className="p-6 font-mono text-yellow-500/80 font-bold">{row.attribute_limit}</td>
                    <td className="p-6 text-slate-400 italic text-xs">{row.xp_required}</td>
                    <td className="p-6 text-green-500/80 font-bold">{row.gains}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center gap-3 p-4 bg-red-950/10 border border-red-900/20 rounded-xl">
             <ShieldAlert className="text-red-500 w-5 h-5 flex-shrink-0" />
             <p className="text-[10px] text-red-200/60 uppercase tracking-tighter">
               <strong>Aviso de Ascensão:</strong> A partir do Nível 51 (Rank SS), o custo de XP torna-se exponencial. Ex: 50(5k) → 51(10k) → 52(20k).
             </p>
          </div>
        </div>

        {/* 3. HABILIDADES POR RANK - DETALHADO */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <Wand2 className="text-blue-500 w-6 h-6" />
            <h3 className="font-epic text-2xl text-slate-100">Grimório de Habilidades</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Loop para renderizar Ranks dinamicamente (E, D, C, B) */}
            {['E', 'D', 'C', 'B'].map((rank) => {
               const rankSkills = getSkillsByRank(rank);
               // Define cor e ícone base do Rank
               let rankColor = 'text-slate-400';
               let RankIcon = <Wand2 className="w-32 h-32" />;
               
               if (rank === 'E') { rankColor = 'text-green-500'; RankIcon = <Flame className="w-32 h-32" />; }
               else if (rank === 'D') { rankColor = 'text-blue-400'; RankIcon = <Zap className="w-32 h-32" />; }
               else if (rank === 'C') { rankColor = 'text-purple-400'; RankIcon = <Sparkles className="w-32 h-32" />; }
               else if (rank === 'B') { rankColor = 'text-red-500'; RankIcon = <Waves className="w-32 h-32" />; }

               return (
                <div key={rank} className="p-8 rounded-3xl bg-slate-900 border border-slate-800 relative group overflow-hidden">
                  <div className={`absolute -top-6 -right-6 text-slate-800 opacity-20 group-hover:opacity-10 transition-all ${rankColor.replace('text-', 'group-hover:text-')}`}>
                    {RankIcon}
                  </div>
                  <h4 className="font-epic text-xl text-slate-200 mb-6 flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center ${rankColor} text-sm font-bold border border-slate-700`}>{rank}</span>
                    Rank {rank}
                  </h4>
                  
                  {rankSkills.length === 0 ? (
                    <p className="text-slate-500 italic text-sm">Nenhuma habilidade registrada.</p>
                  ) : (
                    <div className="space-y-4">
                      {rankSkills.map((skill, i) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-colors group/skill">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-200 font-bold font-epic">{skill.name}</span>
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-black border border-blue-500/20 tracking-widest">{skill.cost}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed group-hover/skill:text-slate-400 transition-colors italic">{skill.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
               );
            })}
          </div>
        </div>

        {/* 4. MISSÕES E RECOMPENSAS */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <Target className="text-red-500 w-6 h-6" />
            <h3 className="font-epic text-2xl text-slate-100">Economia & Recompensas</h3>
          </div>
          
          <div className="overflow-x-auto rounded-3xl border border-gold/20 bg-slate-900/50 backdrop-blur-md">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-yellow-500/5 text-yellow-500 font-epic text-[10px] uppercase tracking-widest">
                  <th className="p-6">Rank</th>
                  <th className="p-6">Faixa Nvl</th>
                  <th className="p-6">Moeda Base</th>
                  <th className="p-6">Valor Médio</th>
                  <th className="p-6">Itens Comuns</th>
                </tr>
              </thead>
              <tbody className="text-slate-300 text-sm">
                {(economyData.length > 0 ? economyData : [
                  { rank: 'E', level_range: '1 – 5', base_currency: 'Bronze', avg_value: '15-50 B', common_items: 'Couro, Ferro simples' },
                  { rank: 'D', level_range: '6 – 10', base_currency: 'Bronze/Prata', avg_value: '50-150 B | 1-3 P', common_items: 'Presas, Poções' },
                  { rank: 'C', level_range: '11 – 20', base_currency: 'Prata', avg_value: '5-20 P', common_items: 'Materiais raros' },
                  { rank: 'B', level_range: '21 – 30', base_currency: 'Prata/Ouro', avg_value: '20-50 P | 1-3 O', common_items: 'Armas especiais' },
                  { rank: 'A', level_range: '31 – 40', base_currency: 'Ouro', avg_value: '5-15 O', common_items: 'Equipamentos raros' },
                  { rank: 'S', level_range: '41 – 50', base_currency: 'Ouro/Pallad.', avg_value: '20-50 O | 1 PD', common_items: 'Relíquias' },
                  { rank: 'SS / SE', level_range: '51+', base_currency: 'Palladium', avg_value: '1-5 PD', common_items: 'Artefatos únicos' },
                ]).map((row, i) => (
                  <tr key={i} className="hover:bg-yellow-500/5 border-b border-slate-800/50 last:border-0 transition-colors">
                    <td className="p-6 font-epic font-bold text-yellow-600">{row.rank}</td>
                    <td className="p-6">{row.level_range}</td>
                    <td className="p-6 text-slate-400">{row.base_currency}</td>
                    <td className="p-6 font-mono text-yellow-500/70">{row.avg_value}</td>
                    <td className="p-6 italic text-slate-500 text-xs">{row.common_items}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Conversion Rule */}
          <div className="mt-8 p-8 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                <div className="w-12 h-12 rounded-full bg-orange-900 border border-orange-700 flex items-center justify-center text-orange-500 font-bold">B</div>
                <div className="w-12 h-12 rounded-full bg-slate-600 border border-slate-400 flex items-center justify-center text-slate-200 font-bold">P</div>
                <div className="w-12 h-12 rounded-full bg-yellow-600 border border-yellow-400 flex items-center justify-center text-yellow-200 font-bold">O</div>
                <div className="w-12 h-12 rounded-full bg-purple-900 border border-purple-700 flex items-center justify-center text-purple-300 font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)]">PD</div>
              </div>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed uppercase tracking-widest font-bold">
                Câmbio Real: 100 de um metal inferior equivale a 1 do superior.
              </p>
            </div>
            <div className="px-6 py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-[10px] text-slate-500 uppercase tracking-widest">
              Conversões em Bancos, Templos e Instituições
            </div>
          </div>
        </div>

        {/* 5. FICHAS E MODELOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
           <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-black border border-slate-800">
             <h4 className="font-epic text-xl text-slate-100 mb-6 flex items-center gap-3">
               <FileText className="w-6 h-6 text-purple-500" /> Ficha Completa
             </h4>
             <p className="text-sm text-slate-500 mb-4">O registro eterno do seu herói, usada para progressão de longo prazo.</p>
             <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                <div className="p-2 bg-slate-800/50 rounded">História</div>
                <div className="p-2 bg-slate-800/50 rounded">Atributos</div>
                <div className="p-2 bg-slate-800/50 rounded">Energia</div>
                <div className="p-2 bg-slate-800/50 rounded">Dinheiro</div>
                <div className="p-2 bg-slate-800/50 rounded">Habilidades</div>
                <div className="p-2 bg-slate-800/50 rounded">Itens</div>
             </div>
           </div>

           <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-black border border-red-900/20">
             <h4 className="font-epic text-xl text-slate-100 mb-6 flex items-center gap-3">
               <Sword className="w-6 h-6 text-red-500" /> Ficha de Batalha
             </h4>
             <p className="text-sm text-slate-500 mb-4">Utilizada durante combates intensos para agilidade nas ações.</p>
             <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                <div className="p-2 bg-red-900/10 border border-red-900/20 rounded">PV Atual</div>
                <div className="p-2 bg-red-900/10 border border-red-900/20 rounded">PE Atual</div>
                <div className="p-2 bg-red-900/10 border border-red-900/20 rounded">Atributos</div>
                <div className="p-2 bg-red-900/10 border border-red-900/20 rounded">Habilidades em Uso</div>
             </div>
           </div>
        </div>

        <div className="text-center">
           <p className="text-slate-600 text-[10px] uppercase tracking-[0.4em] font-epic">A Forja do Caos nunca dorme. O equilíbrio é sua única âncora.</p>
        </div>
      </div>
    </section>
  );
};

export default Systems;
