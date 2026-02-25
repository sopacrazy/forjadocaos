import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const KnownCharacters = () => {
  const [characters, setCharacters] = useState<any[]>([]);

  useEffect(() => {
    async function loadChars() {
      const { data } = await supabase.from('characters').select('*').order('order_index', { ascending: true });
      if (data) {
        const formatted = data.map(char => ({
            name: char.name,
            title: char.title,
            image: char.image_url,
            description: char.description,
            rank: char.tag,
            element: char.element,
            stats: {
                Poder: char.stats_power,        // Capitalizei para ficar bonito na label
                Sabedoria: char.stats_wisdom,
                Resistência: char.stats_resistance
            }
        }));
        setCharacters(formatted);
      }
    }
    loadChars();
  }, []);

  // Intersection Observer to hide floating buttons on mobile when this section is visible
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        document.body.classList.add('hide-floating-buttons');
      } else {
        document.body.classList.remove('hide-floating-buttons');
      }
    }, { threshold: 0.1 });
    
    const section = document.getElementById('characters');
    if (section) observer.observe(section);

    return () => {
      observer.disconnect();
      document.body.classList.remove('hide-floating-buttons');
    };
  }, []);

  return (
    <section id="characters" className="relative py-32 overflow-hidden">
      <style>
        {`
          .characters-swiper .swiper-pagination-bullet {
            background: #a855f7;
            opacity: 0.5;
            width: 10px;
            height: 10px;
          }
          .characters-swiper .swiper-pagination-bullet-active {
            background: #eab308;
            opacity: 1;
            transform: scale(1.2);
          }
          .characters-swiper .swiper-button-next,
          .characters-swiper .swiper-button-prev {
            color: #eab308;
            background: rgba(15, 23, 42, 0.5);
            padding: 30px 20px;
            border-radius: 12px;
            border: 1px solid rgba(234, 179, 8, 0.2);
            backdrop-filter: blur(4px);
          }
          .characters-swiper .swiper-button-next:after,
          .characters-swiper .swiper-button-prev:after {
            font-size: 24px;
            font-weight: bold;
          }
          .characters-swiper .swiper-button-next:hover,
          .characters-swiper .swiper-button-prev:hover {
            color: #fef08a;
            border-color: rgba(234, 179, 8, 0.5);
            background: rgba(15, 23, 42, 0.8);
          }
          @media (max-width: 768px) {
            .characters-swiper .swiper-button-next,
            .characters-swiper .swiper-button-prev {
              display: none;
            }
          }
          /* Hide floating buttons globally when this section is active */
          body.hide-floating-buttons .floating-btn {
            opacity: 0 !important;
            pointer-events: none !important;
            transform: translateY(20px) scale(0.9) !important;
          }
        `}
      </style>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950"></div>
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-purple-500/10 border border-purple-500/30">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
              <span className="text-xs uppercase tracking-widest font-bold text-purple-300">Lendas Vivas</span>
            </div>
          </div>
          <h2 className="font-epic text-5xl md:text-7xl font-black mb-6 gold-gradient">
            Personagens Conhecidos
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Heróis e lendas que moldaram o destino da Forja do Caos com suas façanhas épicas
          </p>
          
          {/* Mobile Swipe Hint */}
          <div className="md:hidden flex items-center justify-center gap-2 mt-8 text-purple-400/80 animate-pulse">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
            <span className="text-sm font-bold uppercase tracking-wider">Deslize para ver mais</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </div>
        </div>

        {/* Characters Carousel */}
        <div className="w-full relative pb-16">
          <Swiper
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={false}
            slidesPerView={'auto'}
            initialSlide={0}
            coverflowEffect={{
              rotate: 20,
              stretch: 0,
              depth: 200,
              modifier: 1,
              slideShadows: true,
            }}
            pagination={{ 
              clickable: true,
              dynamicBullets: true,
            }}
            navigation={true}
            modules={[EffectCoverflow, Pagination, Navigation]}
            className="w-full pt-10 pb-20 px-4 characters-swiper"
          >
            {characters.map((character, index) => (
              <SwiperSlide
                key={index}
                className="!w-[320px] md:!w-[420px] transition-all duration-300"
              >
                <div
                  className="group relative h-full"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  {/* Card Container */}
                  <div className="relative h-full flex flex-col bg-gradient-to-br from-slate-900/95 to-slate-950/95 rounded-2xl overflow-hidden border border-slate-800/50 hover:border-purple-500/50 transition-all duration-500 shadow-xl group-hover:shadow-2xl group-hover:shadow-purple-500/20">
                    
                    {/* Character Image */}
                    <div className="relative h-96 shrink-0 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none"></div>
                      <img 
                        src={character.image} 
                        alt={character.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 pointer-events-none select-none"
                      />
                      
                      {/* Swipe Overlay Hint (Mobile Only) */}
                      <div className="md:hidden absolute inset-0 z-15 flex items-center justify-between px-4 opacity-50 pointer-events-none">
                        <div className="w-8 h-8 rounded-full bg-slate-900/50 backdrop-blur-sm border border-purple-500/30 flex items-center justify-center animate-pulse">
                          <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                          </svg>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-900/50 backdrop-blur-sm border border-purple-500/30 flex items-center justify-center animate-pulse">
                          <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </div>
                      </div>
                      
                      {/* Element Badge */}
                      <div className="absolute top-4 right-4 z-20">
                        <div className="px-4 py-2 rounded-full bg-slate-950/80 backdrop-blur-sm border border-purple-500/30">
                          <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                            {character.element}
                          </span>
                        </div>
                      </div>

                      {/* Rank Badge */}
                      <div className="absolute bottom-4 left-4 z-20">
                        <div className="px-4 py-2 rounded-full bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/50">
                          <span className="text-xs font-bold gold-gradient uppercase tracking-wider">
                            {character.rank}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Character Info */}
                    <div className="p-8 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-epic text-3xl font-black mb-2 gold-gradient line-clamp-1">
                          {character.name}
                        </h3>
                        <p className="text-purple-400 font-semibold mb-4 text-sm uppercase tracking-wide">
                          {character.title}
                        </p>
                        <p className="text-slate-300 leading-relaxed mb-6 line-clamp-4 md:line-clamp-none">
                          {character.description}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="space-y-3 mt-4">
                        {Object.entries(character.stats).map(([stat, value]) => (
                          <div key={stat}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                                {stat}
                              </span>
                              <span className="text-sm font-bold text-purple-300">
                                {value}
                              </span>
                            </div>
                            <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-yellow-500 rounded-full transition-all duration-1000 group-hover:animate-pulse"
                                style={{ width: `${value}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Glow Effect on Hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 via-transparent to-transparent"></div>
                    </div>
                  </div>

                  {/* Decorative Corner Accents */}
                  <div className="absolute -top-2 -left-2 w-8 h-8 border-l-2 border-t-2 border-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 border-r-2 border-b-2 border-yellow-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-slate-400 mb-6">
            Crie sua própria lenda e junte-se aos grandes heróis da Forja
          </p>
          <a 
            href="#character-creation"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-full font-bold text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105"
          >
            <span>Criar Personagem</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default KnownCharacters;
