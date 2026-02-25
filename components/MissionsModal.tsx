import React from 'react';

interface MissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MissionsModal: React.FC<MissionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-2xl border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20">

        {/* Decorative Corner Accents */}
        <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-purple-500/50 rounded-tl-2xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-yellow-500/50 rounded-br-2xl"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/80 hover:bg-red-600/80 border border-slate-700 hover:border-red-500 transition-all duration-300 group"
        >
          <svg className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="relative p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-4">
              <span className="text-2xl">🗺️</span>
              <span className="text-sm uppercase tracking-widest font-bold text-purple-300">Central de Missões</span>
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Selecione seu Destino</h2>
            <p className="text-slate-400">Escolha uma missão disponível para iniciar sua jornada.</p>
          </div>

          {/* Mission List */}
          <div className="space-y-4">

            {/* Floresta Mística (Active) */}
            <div className="group relative bg-slate-800/50 hover:bg-slate-800/80 rounded-xl p-6 border border-green-500/30 hover:border-green-500/60 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-green-900/50 border border-green-500/50 flex items-center justify-center text-3xl shadow-lg shadow-green-900/50">
                    🌲
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">Floresta Mística</h3>
                    <p className="text-sm text-slate-400">Nível Recomendado: 1-10</p>
                    <p className="text-xs text-slate-500 mt-1">Explore os mistérios da clareira ancestral.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    window.location.hash = '#rpg';
                  }}
                  className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg hover:shadow-green-500/30 transition-all transform hover:scale-105"
                >
                  IR PARA BATALHA
                </button>
              </div>
            </div>

            {/* Caverna do Dragão (Disabled) */}
            <div className="relative bg-slate-900/50 rounded-xl p-6 border border-slate-800 opacity-70 cursor-not-allowed">
              <div className="absolute top-4 right-4">
                <span className="bg-slate-800 text-slate-500 text-xs font-bold px-2 py-1 rounded border border-slate-700">BLOQUEADO</span>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 grayscale opacity-50">
                  <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl">
                    🌋
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-400">Caverna Vulcânica</h3>
                    <p className="text-sm text-slate-600">Nível Recomendado: 15+</p>
                    <p className="text-xs text-slate-600 mt-1">Em breve...</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Torre Arcana (Disabled) */}
            <div className="relative bg-slate-900/50 rounded-xl p-6 border border-slate-800 opacity-70 cursor-not-allowed">
              <div className="absolute top-4 right-4">
                <span className="bg-slate-800 text-slate-500 text-xs font-bold px-2 py-1 rounded border border-slate-700">BLOQUEADO</span>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 grayscale opacity-50">
                  <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl">
                    🏰
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-400">Torre Arcana</h3>
                    <p className="text-sm text-slate-600">Nível Recomendado: 30+</p>
                    <p className="text-xs text-slate-600 mt-1">Em breve...</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default MissionsModal;
