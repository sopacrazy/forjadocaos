
import React from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import { WHATSAPP_LINK } from '../constants';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 mb-6 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-200 tracking-wider uppercase">Inscrições Abertas</span>
        </div>
        
        <h1 className="font-epic text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
          FORJA DO <span className="gold-gradient">CAOS</span>
          <br />
          <span className="text-3xl md:text-5xl lg:text-6xl text-slate-100">Academia do Equilíbrio</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
          Onde os mitos colidem e o destino é moldado pelo aço e pela magia. 
          Escolha sua linhagem e ascenda aos Ranks Superiores na maior universidade mística do multiverso.
        </p>

        <a 
          href="https://chat.whatsapp.com/BDMqaPyTY14GYguvEKvUid?mode=gi_t"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-lg transition-all transform hover:scale-105 hover:shadow-[0_0_30px_rgba(126,34,206,0.4)] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <MessageCircle className="w-6 h-6" />
          <span className="text-lg">Entrar no Grupo da RPG</span>
        </a>

        <div className="mt-12 flex justify-center gap-8 text-slate-500 animate-pulse">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-epic font-bold text-slate-300">500+</span>
            <span className="text-xs uppercase tracking-widest">Alunos</span>
          </div>
          <div className="w-px h-10 bg-slate-800 self-center"></div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-epic font-bold text-slate-300">12</span>
            <span className="text-xs uppercase tracking-widest">Panteões</span>
          </div>
          <div className="w-px h-10 bg-slate-800 self-center"></div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-epic font-bold text-slate-300">Infinite</span>
            <span className="text-xs uppercase tracking-widest">Possibilidades</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
