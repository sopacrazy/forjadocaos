
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Trophy, Sword, Shield, Flame, Crown, Star, Zap, Eye, 
  Skull, Heart, Crosshair, Target, Briefcase, Book, Anchor 
} from 'lucide-react';

// Mapeamento local para exibição
const ICON_MAP: Record<string, React.ReactNode> = {
  'Sword': <Sword className="w-8 h-8" />,
  'Shield': <Shield className="w-8 h-8" />,
  'Flame': <Flame className="w-8 h-8" />,
  'Crown': <Crown className="w-8 h-8" />,
  'Star': <Star className="w-8 h-8" />,
  'Zap': <Zap className="w-8 h-8" />,
  'Eye': <Eye className="w-8 h-8" />,
  'Skull': <Skull className="w-8 h-8" />,
  'Heart': <Heart className="w-8 h-8" />,
  'Target': <Target className="w-8 h-8" />,
  'Book': <Book className="w-8 h-8" />,
  'Anchor': <Anchor className="w-8 h-8" />
};

interface Rank {
  id: string;
  name: string;
  description: string;
  rank_code: string;
  icon_name: string;
  color_class: string;
  order_index: number;
}

const Ranks: React.FC = () => {
  const [ranks, setRanks] = useState<Rank[]>([]);

  useEffect(() => {
    async function loadRanks() {
      const { data } = await supabase
        .from('ranks')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (data) {
        setRanks(data);
      }
    }
    loadRanks();
  }, []);

  return (
    <section className="py-24 px-4 bg-[#08080a]" id="ranks">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <Trophy className="w-12 h-12 text-purple-500" />
          </div>
          <h2 className="font-epic text-4xl md:text-5xl font-bold text-slate-100 mb-4 uppercase tracking-tighter">Sistema de <span className="gold-gradient">Ranks</span></h2>
          <p className="text-slate-500 max-w-xl mx-auto">Sua evolução é medida pelo seu impacto na Forja. De um simples mortal a um Avatar da realidade.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ranks.map((rank) => (
            <div 
              key={rank.id}
              className="group p-6 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(168,85,247,0.1)] relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-3 rounded-lg bg-slate-800 group-hover:bg-slate-700 transition-colors ${rank.color_class || 'text-slate-400'}`}>
                  {ICON_MAP[rank.icon_name] || <Sword className="w-8 h-8" />}
                </div>
                <span className={`text-5xl font-black opacity-[0.08] font-epic absolute right-0 -top-2 scale-150 ${rank.color_class || 'text-slate-400'}`}>
                  {rank.rank_code}
                </span>
                <span className={`text-2xl font-bold font-epic ${rank.color_class || 'text-slate-400'}`}>
                  {rank.rank_code}
                </span>
              </div>
              <h3 className="text-xl font-epic font-bold text-slate-100 mb-2 group-hover:text-purple-400 transition-colors relative z-10">
                {rank.name}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed relative z-10">
                {rank.description}
              </p>
            </div>
          ))}
          
          {/* Espaçador para layout de grade incompleta (se necessário) */}
          {ranks.length % 4 !== 0 && <div className="hidden lg:block"></div>}
        </div>
      </div>
    </section>
  );
};

export default Ranks;
