
import React, { useState, useEffect } from 'react';
import { UserPlus, Globe, Wand2, Sword, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  'Globe': <Globe className="w-6 h-6" />,
  'Wand2': <Wand2 className="w-6 h-6" />,
  'Sword': <Sword className="w-6 h-6" />,
  'UserPlus': <UserPlus className="w-6 h-6" />
};

const CharacterCreation: React.FC = () => {
  const [content, setContent] = useState<any>(null);
  const [myths, setMyths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
        const { data: contentData } = await supabase
            .from('site_content')
            .select('creation_title, creation_subtitle, creation_description, creation_features')
            .eq('id', 'main')
            .single();

        if (contentData) setContent(contentData);

        const { data: mythsData } = await supabase
            .from('mythologies')
            .select('*')
            .order('order_index', { ascending: true });

        if (mythsData) setMyths(mythsData);
        setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-yellow-500 w-8 h-8"/></div>;
  if (!content) return null;

  return (
    <section className="py-24 px-4 relative overflow-hidden" id="characters">
      {/* Visual background element */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-yellow-500/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 text-yellow-500 mb-4">
              <UserPlus className="w-5 h-5" />
              <span className="font-epic uppercase tracking-widest text-sm font-bold">
                  {content.creation_subtitle || 'Criação Livre'}
              </span>
            </div>
            
            <h2 
                className="font-epic text-4xl md:text-5xl font-black text-slate-100 mb-6 leading-tight"
                dangerouslySetInnerHTML={{ __html: content.creation_title || 'Sua Mitologia, Sua História' }}
            />

            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              {content.creation_description}
            </p>
            
            <ul className="space-y-6">
              {content.creation_features && Array.isArray(content.creation_features) && content.creation_features.map((item: any, idx: number) => (
                <li key={idx} className="flex gap-4 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-purple-400 border border-slate-700 group-hover:border-purple-500/50 group-hover:bg-slate-700 transition-all">
                    {FEATURE_ICONS[item.icon] || <Globe className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="text-slate-100 font-bold mb-1">{item.title}</h4>
                    <p className="text-slate-500 text-sm">{item.text}</p>
                  </div>
                </li>
              ))}
              {(!content.creation_features || content.creation_features.length === 0) && (
                  <p className="text-slate-500 italic">Nenhum benefício cadastrado.</p>
              )}
            </ul>
          </div>

          <div className="lg:w-1/2 grid grid-cols-2 gap-4">
            {myths.map((myth, idx) => (
              <div 
                key={myth.id} 
                className={`relative group rounded-2xl overflow-hidden aspect-[4/5] ${myth.grid_position === 'shifted' ? 'mt-8' : ''} ${myth.grid_position === 'full' ? 'col-span-2 aspect-[16/7]' : ''}`}
              >
                <img 
                  src={myth.image_url} 
                  alt={myth.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <h3 className="font-epic text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors uppercase">{myth.name}</h3>
                  <p className="text-slate-300 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{myth.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CharacterCreation;
