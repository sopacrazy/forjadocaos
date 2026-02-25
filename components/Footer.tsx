
import React from 'react';
import { Instagram, Twitter, Youtube, Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="py-16 px-4 border-t border-slate-800 bg-[#050507]">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        <div className="font-epic text-2xl font-black gold-gradient mb-8">FORJA DO CAOS</div>
        
        <div className="flex gap-8 mb-12">
          {[Instagram, Twitter, Youtube, Github].map((Icon, idx) => (
            <a key={idx} href="#" className="text-slate-500 hover:text-purple-400 transition-colors">
              <Icon className="w-6 h-6" />
            </a>
          ))}
        </div>

        <nav className="flex flex-wrap justify-center gap-x-12 gap-y-4 mb-12 text-sm text-slate-500 uppercase tracking-widest font-bold">
          <a href="#lore" className="hover:text-slate-200 transition-colors">Lore</a>
          <a href="#ranks" className="hover:text-slate-200 transition-colors">Ranks</a>
          <a href="#characters" className="hover:text-slate-200 transition-colors">Personagens</a>
          <a href="#" className="hover:text-slate-200 transition-colors">Regras</a>
        </nav>

        <div className="text-center">
          <p className="text-slate-600 text-sm mb-4">© 2024 Academia do Equilíbrio. Todos os direitos reservados.</p>
          <div className="relative inline-block group">
            <span className="font-epic text-xl text-slate-400 group-hover:text-red-600 transition-colors duration-500 cursor-default uppercase tracking-[0.5em]">O Caos Observa</span>
            <div className="absolute -inset-x-4 h-px bottom-0 bg-gradient-to-r from-transparent via-red-600/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
