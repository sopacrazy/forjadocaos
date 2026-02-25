import React, { useState } from 'react';

interface BattleStatusProps {
  isOpen: boolean;
  onClose: () => void;
}

const BattleStatusModal: React.FC<BattleStatusProps> = ({ isOpen, onClose }) => {
  const [characterData, setCharacterData] = useState({
    nome: "Yorin Akash",
    rank: "Ceifador",
    nivel: 45,
    atributos: {
      for: 85,
      des: 92,
      int: 78,
      vel: 95
    },
    energia: {
      peBase: 10,
      peLivre: 150,
      peAtual: 120
    },
    vida: {
      pvAtual: 850,
      pvMax: 1000
    },
    habilidades: [
      { nome: "Corte Sombrio", pe: 25 },
      { nome: "Dança da Foice", pe: 40 },
      { nome: "Vórtice Arcano", pe: 35 },
      { nome: "Passo Fantasma", pe: 20 },
      { nome: "", pe: 0 }
    ]
  });

  if (!isOpen) return null;

  const pvPercentage = (characterData.vida.pvAtual / characterData.vida.pvMax) * 100;
  const pePercentage = (characterData.energia.peAtual / (characterData.energia.peBase + characterData.energia.peLivre)) * 100;

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
              <span className="text-2xl">⚔️</span>
              <span className="text-sm uppercase tracking-widest font-bold text-purple-300">Ficha de Batalha</span>
            </div>
          </div>

          {/* Character Info */}
          <div className="bg-slate-800/50 rounded-xl p-6 mb-6 border border-slate-700/50">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2 block">Nome</label>
                <input
                  type="text"
                  value={characterData.nome}
                  onChange={(e) => setCharacterData({...characterData, nome: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white font-semibold focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2 block">Rank</label>
                <input
                  type="text"
                  value={characterData.rank}
                  onChange={(e) => setCharacterData({...characterData, rank: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 gold-gradient font-semibold focus:outline-none focus:border-yellow-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2 block">Nível</label>
                <input
                  type="number"
                  value={characterData.nivel}
                  onChange={(e) => setCharacterData({...characterData, nivel: parseInt(e.target.value)})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-purple-400 font-bold text-center focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Attributes */}
          <div className="bg-slate-800/50 rounded-xl p-6 mb-6 border border-slate-700/50">
            <h3 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
              <span>📊</span> ATRIBUTOS
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'for', label: '💪 FOR', color: 'red' },
                { key: 'des', label: '🎯 DES', color: 'blue' },
                { key: 'int', label: '🧠 INT', color: 'purple' },
                { key: 'vel', label: '⚡ VEL', color: 'yellow' }
              ].map((attr) => (
                <div key={attr.key}>
                  <label className="text-sm font-bold text-slate-300 mb-2 block">{attr.label}</label>
                  <input
                    type="number"
                    value={characterData.atributos[attr.key as keyof typeof characterData.atributos]}
                    onChange={(e) => setCharacterData({
                      ...characterData,
                      atributos: {...characterData.atributos, [attr.key]: parseInt(e.target.value)}
                    })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white font-bold text-center focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Energy */}
          <div className="bg-slate-800/50 rounded-xl p-6 mb-6 border border-slate-700/50">
            <h3 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
              <span>⚡</span> ENERGIA
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-300 mb-2 block flex items-center gap-1">
                    <span>🔒</span> PE Base
                  </label>
                  <input
                    type="number"
                    value={characterData.energia.peBase}
                    onChange={(e) => setCharacterData({
                      ...characterData,
                      energia: {...characterData.energia, peBase: parseInt(e.target.value)}
                    })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-400 font-bold text-center focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-300 mb-2 block flex items-center gap-1">
                    <span>🔹</span> PE Livre
                  </label>
                  <input
                    type="number"
                    value={characterData.energia.peLivre}
                    onChange={(e) => setCharacterData({
                      ...characterData,
                      energia: {...characterData.energia, peLivre: parseInt(e.target.value)}
                    })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-blue-400 font-bold text-center focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-300 mb-2 block flex items-center gap-1">
                    <span>🔹</span> PE Atual
                  </label>
                  <input
                    type="number"
                    value={characterData.energia.peAtual}
                    onChange={(e) => setCharacterData({
                      ...characterData,
                      energia: {...characterData.energia, peAtual: parseInt(e.target.value)}
                    })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-cyan-400 font-bold text-center focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
              {/* PE Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-400 font-bold">ENERGIA</span>
                  <span className="text-xs text-cyan-400 font-bold">
                    {characterData.energia.peAtual} / {characterData.energia.peBase + characterData.energia.peLivre}
                  </span>
                </div>
                <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 rounded-full"
                    style={{ width: `${pePercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Health */}
          <div className="bg-slate-800/50 rounded-xl p-6 mb-6 border border-slate-700/50">
            <h3 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
              <span>❤️</span> VIDA
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-bold text-slate-300 mb-2 block">PV Atual</label>
                <input
                  type="number"
                  value={characterData.vida.pvAtual}
                  onChange={(e) => setCharacterData({
                    ...characterData,
                    vida: {...characterData.vida, pvAtual: parseInt(e.target.value)}
                  })}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-red-400 font-bold text-center focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-300 mb-2 block">PV Máximo</label>
                <input
                  type="number"
                  value={characterData.vida.pvMax}
                  onChange={(e) => setCharacterData({
                    ...characterData,
                    vida: {...characterData.vida, pvMax: parseInt(e.target.value)}
                  })}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-400 font-bold text-center focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
            {/* HP Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400 font-bold">PONTOS DE VIDA</span>
                <span className="text-xs text-red-400 font-bold">
                  {characterData.vida.pvAtual} / {characterData.vida.pvMax}
                </span>
              </div>
              <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    pvPercentage > 50 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    pvPercentage > 25 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    'bg-gradient-to-r from-red-500 to-red-700'
                  }`}
                  style={{ width: `${pvPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Abilities */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
              <span>⚔️</span> HABILIDADES EM USO
            </h3>
            <div className="space-y-3">
              {characterData.habilidades.map((hab, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-purple-300">{index + 1}</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Nome da Habilidade"
                    value={hab.nome}
                    onChange={(e) => {
                      const newHabs = [...characterData.habilidades];
                      newHabs[index].nome = e.target.value;
                      setCharacterData({...characterData, habilidades: newHabs});
                    }}
                    className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white font-semibold focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold">PE:</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={hab.pe || ''}
                      onChange={(e) => {
                        const newHabs = [...characterData.habilidades];
                        newHabs[index].pe = parseInt(e.target.value) || 0;
                        setCharacterData({...characterData, habilidades: newHabs});
                      }}
                      className="w-20 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-cyan-400 font-bold text-center focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BattleStatusModal;
