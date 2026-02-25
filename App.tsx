

import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import Hero from './components/Hero';
import Lore from './components/Lore';
import HistoryPage from './components/HistoryPage';
import WeaponsPage from './components/WeaponsPage';
import EntitiesPage from './components/EntitiesPage';
import Ranks from './components/Ranks';
import Systems from './components/Systems';
import KnownCharacters from './components/KnownCharacters';
import CharacterCreation from './components/CharacterCreation';
import BattleStatusModal from './components/BattleStatusModal';
import CharacterSheetModal from './components/CharacterSheetModal';
import Footer from './components/Footer';
import MissionsModal from './components/MissionsModal';
import BackgroundMusic from './components/BackgroundMusic';



import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import RPGRoom from './components/RPGRoomSupabase';
// import RPGRoom from './components/RPGRoom'; // Versão Offline (Backup)

function App() {
  const [scrolled, setScrolled] = useState(false);
  const [isBattleStatusOpen, setIsBattleStatusOpen] = useState(false);
  const [isCharacterSheetOpen, setIsCharacterSheetOpen] = useState(false);
  const [isMissionsModalOpen, setIsMissionsModalOpen] = useState(false);
  const [isRPGRoomOpen, setIsRPGRoomOpen] = useState(false);
  const [isHistoryPageOpen, setIsHistoryPageOpen] = useState(false);
  const [isWeaponsPageOpen, setIsWeaponsPageOpen] = useState(false);
  const [isEntitiesPageOpen, setIsEntitiesPageOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Admin State
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- HASH ROUTING & PERSISTENCE ---

  // 1. Check hash on mount to open RPG directly
  useEffect(() => {
    if (window.location.hash === '#rpg') {
      setIsRPGRoomOpen(true);
    }
  }, []);

  // 2. Sync hash with state
  useEffect(() => {
    if (isRPGRoomOpen) {
      if (window.location.hash !== '#rpg') window.location.hash = 'rpg';
    } else {
      if (window.location.hash === '#rpg') {
        history.replaceState(null, '', ' '); // Remove hash cleanly
      }
    }
  }, [isRPGRoomOpen]);

  // 3. Handle browser Back button
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash !== '#rpg' && isRPGRoomOpen) {
        setIsRPGRoomOpen(false);
      } else if (window.location.hash === '#rpg' && !isRPGRoomOpen) {
        setIsRPGRoomOpen(true);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isRPGRoomOpen]);

  // ----------------------------------

  if (isAdminAuthenticated) {
    return <AdminDashboard onLogout={() => setIsAdminAuthenticated(false)} />;
  }

  if (isAdminAuthenticated) {
    return <AdminDashboard onLogout={() => setIsAdminAuthenticated(false)} />;
  }

  // Render RPG Room as a Dedicated Page
  if (isRPGRoomOpen) {
    return (
      <RPGRoom
        isOpen={isRPGRoomOpen}
        onClose={() => setIsRPGRoomOpen(false)}
      />
    );
  }

  // Render History as a Dedicated Page
  if (isHistoryPageOpen) {
    return (
      <HistoryPage
        isOpen={isHistoryPageOpen}
        onClose={() => setIsHistoryPageOpen(false)}
      />
    );
  }

  // Render Weapons as a Dedicated Page
  if (isWeaponsPageOpen) {
    return (
      <WeaponsPage
        isOpen={isWeaponsPageOpen}
        onClose={() => setIsWeaponsPageOpen(false)}
      />
    );
  }

  // Render Entities as a Dedicated Page
  if (isEntitiesPageOpen) {
    return (
      <EntitiesPage
        isOpen={isEntitiesPageOpen}
        onClose={() => setIsEntitiesPageOpen(false)}
      />
    );
  }

  return (
    <div className="bg-[#0a0a0c] selection:bg-purple-500/30 selection:text-purple-200">
      {/* Navigation - Minimal and Floating */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 ${scrolled ? 'py-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800' : 'py-8 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="font-epic text-xl font-black gold-gradient">FORJA</div>
          <div className="hidden md:flex gap-8 text-xs uppercase tracking-widest font-bold text-slate-400">
            <button onClick={() => setIsHistoryPageOpen(true)} className="hover:text-yellow-500 transition-colors uppercase tracking-widest font-bold">História</button>
            <button onClick={() => setIsWeaponsPageOpen(true)} className="hover:text-yellow-500 transition-colors uppercase tracking-widest font-bold">Armas</button>
            <button onClick={() => setIsEntitiesPageOpen(true)} className="hover:text-purple-400 transition-colors uppercase tracking-widest font-bold">Entidades</button>
            <a href="#ranks" className="hover:text-yellow-500 transition-colors">Ranks</a>
            <a href="#systems" className="hover:text-yellow-500 transition-colors">Sistemas</a>
            <a href="#characters" className="hover:text-yellow-500 transition-colors">Mitos</a>
            <button onClick={() => setIsMissionsModalOpen(true)} className="hover:text-yellow-500 transition-colors text-xs uppercase tracking-widest font-bold text-slate-400">Missões</button>
            <button onClick={() => setIsRPGRoomOpen(true)} className="hover:text-purple-400 transition-colors text-xs uppercase tracking-widest font-bold text-slate-400">🎲 RPG</button>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/40 hidden md:flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
            </div>
            {/* Hamburger Button for Mobile */}
            <button
              className="md:hidden text-slate-300 hover:text-yellow-500 transition-colors mt-1"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-7 h-7" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200] bg-[#0a0a0c]/98 backdrop-blur-2xl flex flex-col pt-8 px-8">
          <div className="flex justify-between items-center mb-16">
            <div className="font-epic text-xl font-black gold-gradient">FORJA</div>
            <button
              className="text-slate-400 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-8 h-8" />
            </button>
          </div>
          <div className="flex flex-col gap-8 text-xl uppercase tracking-widest font-black text-slate-300">
            <button onClick={() => { setIsHistoryPageOpen(true); setIsMobileMenuOpen(false); }} className="hover:text-yellow-500 text-left transition-colors font-epic">História</button>
            <button onClick={() => { setIsWeaponsPageOpen(true); setIsMobileMenuOpen(false); }} className="hover:text-yellow-500 text-left transition-colors font-epic">Armas</button>
            <button onClick={() => { setIsEntitiesPageOpen(true); setIsMobileMenuOpen(false); }} className="hover:text-purple-400 text-left transition-colors font-epic">Entidades</button>
            <a href="#ranks" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-yellow-500 transition-colors font-epic">Ranks</a>
            <a href="#systems" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-yellow-500 transition-colors font-epic">Sistemas</a>
            <a href="#characters" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-yellow-500 transition-colors font-epic">Mitos</a>
            <button onClick={() => { setIsMissionsModalOpen(true); setIsMobileMenuOpen(false); }} className="hover:text-yellow-500 text-left transition-colors font-epic">Missões</button>
            <button onClick={() => { setIsRPGRoomOpen(true); setIsMobileMenuOpen(false); }} className="hover:text-purple-400 text-left transition-colors mt-8 font-epic">🎲 RPG MULTIPLAYER</button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main>
        <Hero />
        <div className="h-24 bg-gradient-to-b from-transparent to-slate-950"></div>
        {/* <Lore /> (Removido pois a História agora está em uma página separada) */}
        <Ranks />
        <Systems />
        <KnownCharacters />
        <CharacterCreation />
      </main>

      <Footer />

      {/* Floating Action Buttons - Minimalist Design */}

      {/* Admin Access - Bottom Left (Discreet) */}
      <button
        onClick={() => setIsAdminLoginOpen(true)}
        className="floating-btn fixed bottom-8 left-8 z-[150] w-10 h-10 rounded-lg bg-slate-900/50 backdrop-blur-sm hover:bg-slate-800/90 border border-slate-700/30 hover:border-purple-500/50 flex items-center justify-center transition-all duration-300 group opacity-30 hover:opacity-100"
        title="Acesso Admin"
      >
        <span className="text-lg opacity-50 group-hover:opacity-100 transition-opacity">🔒</span>
      </button>

      {/* Battle Status - Bottom */}
      <button
        onClick={() => setIsBattleStatusOpen(true)}
        className="floating-btn fixed bottom-8 right-8 z-[150] w-14 h-14 rounded-xl bg-slate-900/80 backdrop-blur-sm hover:bg-slate-800/90 border border-slate-700/50 hover:border-purple-500/50 flex items-center justify-center transition-all duration-300 hover:scale-105 group"
        title="Ficha de Batalha"
      >
        <span className="text-2xl opacity-70 group-hover:opacity-100 transition-opacity">⚔️</span>
      </button>

      {/* RPG Room Access - Floating Button */}
      <button
        onClick={() => setIsRPGRoomOpen(true)}
        className="floating-btn fixed bottom-[180px] right-8 z-[150] w-14 h-14 rounded-xl bg-purple-600/90 backdrop-blur-sm hover:bg-purple-500 border-2 border-purple-400 hover:border-white flex items-center justify-center transition-all duration-300 hover:scale-110 group shadow-lg shadow-purple-900/50"
        title="Entrar no RPG Multiplayer"
      >
        <span className="text-2xl drop-shadow-md">🎲</span>
      </button>

      {/* Character Sheet - Middle */}
      <button
        onClick={() => setIsCharacterSheetOpen(true)}
        className="floating-btn fixed bottom-28 right-8 z-[150] w-14 h-14 rounded-xl bg-slate-900/80 backdrop-blur-sm hover:bg-slate-800/90 border border-slate-700/50 hover:border-yellow-500/50 flex items-center justify-center transition-all duration-300 hover:scale-105 group"
        title="Ficha de Personagem"
      >
        <span className="text-2xl opacity-70 group-hover:opacity-100 transition-opacity">📜</span>
      </button>



      {/* Battle Status Modal */}
      <BattleStatusModal
        isOpen={isBattleStatusOpen}
        onClose={() => setIsBattleStatusOpen(false)}
      />

      {/* Character Sheet Modal Modal */}
      <CharacterSheetModal
        isOpen={isCharacterSheetOpen}
        onClose={() => setIsCharacterSheetOpen(false)}
      />

      {/* Missions Modal */}
      <MissionsModal
        isOpen={isMissionsModalOpen}
        onClose={() => setIsMissionsModalOpen(false)}
      />

      {/* Admin Login Modal */}
      {isAdminLoginOpen && (
        <AdminLogin
          onLoginSuccess={() => {
            setIsAdminAuthenticated(true);
            setIsAdminLoginOpen(false);
          }}
          onClose={() => setIsAdminLoginOpen(false)}
        />
      )}



      {/* Aesthetic Overlays */}
      <div className="fixed inset-0 pointer-events-none z-[100] border-[20px] border-slate-950/50 mix-blend-overlay"></div>
    </div>
  );
}

export default App;
