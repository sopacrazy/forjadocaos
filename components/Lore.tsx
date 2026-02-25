
import React from 'react';
import { ScrollText, BookOpen } from 'lucide-react';

const Lore: React.FC = () => {
  const [content, setContent] = React.useState({
    title: 'A Crônica do Despertar',
    subtitle: '"No princípio, havia apenas o Vazio. Da primeira centelha de vontade, surgiu a Forja — o tear onde a realidade é costurada."',
    text: `A Grande Universidade não é apenas uma escola; é um nexo entre mundos. Fundada após a Guerra dos Mil Dias, onde panteões inteiros foram reduzidos a poeira, a <span class="text-purple-400 font-bold">Academia do Equilíbrio</span> surgiu como o último baluarte contra o Caos Primordial.

Deuses de mitologias esquecidas e heróis de lendas futuras caminham pelos mesmos corredores. O conflito dos deuses deixou cicatrizes no tecido do espaço-tempo, e apenas aqueles capazes de domar o caos interior podem impedir que o multiverso colapse.

Aqui, seu sangue divino ou sua vontade mortal não são suficientes. Você deve aprender a forjar seu próprio caminho, equilibrando a luz da ordem com a sombra da entropia. A Forja está quente. O metal está pronto. Qual será a forma da sua lenda?`
  });

  React.useEffect(() => {
    async function loadContent() {
      try {
        const { supabase } = await import('../lib/supabase');
        const { data, error } = await supabase
          .from('site_content')
          .select('title, subtitle, content')
          .eq('section', 'lore')
          .single();

        if (data && !error) {
          setContent({
            title: data.title,
            subtitle: data.subtitle,
            text: data.content
          });
        }
      } catch (err) {
        console.error('Erro ao carregar Lore:', err);
      }
    }
    loadContent();
  }, []);

  return (
    <section className="py-24 px-4 bg-mystic relative" id="lore">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <ScrollText className="w-12 h-12 text-yellow-500" />
          </div>
          <h2 className="font-epic text-4xl md:text-5xl font-bold gold-gradient mb-4">
            {content.title}
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto"></div>
        </div>

        <div className="relative p-8 md:p-12 bg-slate-900/50 backdrop-blur-xl border-2 border-gold rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {/* Decorative Corner Icons */}
          <div className="absolute top-4 left-4 text-yellow-500/20"><BookOpen className="w-10 h-10" /></div>
          <div className="absolute bottom-4 right-4 text-yellow-500/20"><BookOpen className="w-10 h-10" /></div>

          <div className="prose prose-invert max-w-none text-slate-300 leading-loose space-y-6">
            <p className="text-xl italic text-slate-200 border-l-4 border-yellow-500 pl-6 py-2 bg-yellow-500/5">
              {content.subtitle}
            </p>
            
            <div dangerouslySetInnerHTML={{ __html: content.text.replace(/\n/g, '<br/><br/>') }} />
          </div>
          
          <div className="mt-12 flex justify-center">
            <div className="px-6 py-2 border border-yellow-500/30 rounded-full text-yellow-500 text-sm font-epic tracking-widest uppercase bg-yellow-500/5">
              Escrito pelos Anciãos da Forja
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Lore;
