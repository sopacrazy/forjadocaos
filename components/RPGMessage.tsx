import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Shield, Sword, Skull, Zap } from 'lucide-react';

interface RPGMessageProps {
  sender: 'player' | 'director' | 'system'; 
  name: string;
  title?: string;
  content: string; 
  mechanics?: {
    attack?: string; 
    damage?: string; 
    difficulty?: number; 
  };
  reaction?: {
    damageApplied: number;
    defenseNeeded: number;
  };
  timestamp?: string;
  avatar?: string;
}

const RPGMessage: React.FC<RPGMessageProps> = ({ 
  sender, 
  name, 
  title, 
  content, 
  mechanics,
  reaction,
  timestamp,
  avatar
}) => {
  const isDirector = sender === 'director';

  return (
    <div className="group flex gap-4 w-full px-2 py-1 animate-fadeIn">
      {/* Avatar Column */}
      <div className="flex-shrink-0 mt-0.5">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 ${isDirector ? 'border-red-500/50 shadow-red-500/20 shadow-md' : 'border-blue-500/50 shadow-blue-500/20 shadow-md'}`}>
              {avatar ? (
                    <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                    <div className={`w-full h-full ${isDirector ? 'bg-red-900' : 'bg-blue-900'} flex items-center justify-center text-xs font-bold`}>
                        {name.charAt(0)}
                    </div>
              )}
          </div>
      </div>

      {/* Message Content Column */}
      <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-0.5">
              <span className={`font-bold text-base hover:underline cursor-pointer ${isDirector ? 'text-red-400' : 'text-blue-400'}`}>
                  {name}
              </span>
              {title && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-bold uppercase tracking-wide border border-slate-700">
                      {title}
                  </span>
              )}
              <span className="text-[10px] text-slate-600 ml-1">{timestamp}</span>
          </div>

          {/* Body */}
          <div className="text-slate-300 text-[15px] leading-relaxed whitespace-pre-wrap">
                <ReactMarkdown 
                    components={{
                        em: ({node, ...props}) => <span className="text-yellow-200/90 italic" {...props} />, 
                        strong: ({node, ...props}) => <span className="text-white font-bold" {...props} />,
                    }}
                >
                    {content}
                </ReactMarkdown>
          </div>

          {/* Mechanics "Embed" */}
          {(mechanics || reaction) && (
              <div className={`mt-2.5 rounded bg-slate-900/50 max-w-md border-l-4 ${isDirector ? 'border-red-500' : 'border-blue-500'} overflow-hidden`}>
                  <div className="p-3 grid gap-3">
                        {/* Mechanics Row */}
                        {mechanics && (
                            <div className="flex flex-wrap gap-2">
                                {mechanics.attack && (
                                    <div className="flex items-center gap-2 bg-slate-800/80 px-2 py-1.5 rounded border border-slate-700/50">
                                        <div className="w-5 h-5 rounded flex items-center justify-center bg-emerald-500/20 text-emerald-500">
                                            <Sword size={12} strokeWidth={3} />
                                        </div>
                                        <div>
                                            <div className="text-[9px] uppercase font-bold text-slate-500 leading-none mb-0.5">Ataque</div>
                                            <div className="text-xs font-mono font-bold text-slate-200">{mechanics.attack}</div>
                                        </div>
                                    </div>
                                )}
                                {mechanics.damage && (
                                    <div className="flex items-center gap-2 bg-slate-800/80 px-2 py-1.5 rounded border border-slate-700/50">
                                        <div className="w-5 h-5 rounded flex items-center justify-center bg-red-500/20 text-red-500">
                                            <span className="text-xs">🩸</span>
                                        </div>
                                        <div>
                                            <div className="text-[9px] uppercase font-bold text-slate-500 leading-none mb-0.5">Dano</div>
                                            <div className="text-xs font-mono font-bold text-slate-200">{mechanics.damage}</div>
                                        </div>
                                    </div>
                                )}
                                {mechanics.difficulty && (
                                    <div className="flex items-center gap-2 bg-slate-800/80 px-2 py-1.5 rounded border border-slate-700/50">
                                        <div className="w-5 h-5 rounded flex items-center justify-center bg-yellow-500/20 text-yellow-500">
                                            <Shield size={12} strokeWidth={3} />
                                        </div>
                                        <div>
                                            <div className="text-[9px] uppercase font-bold text-slate-500 leading-none mb-0.5">Dificuldade</div>
                                            <div className="text-xs font-mono font-bold text-slate-200">CD {mechanics.difficulty}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Reaction Row */}
                        {reaction && (
                            <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 rounded p-2">
                                <div className="p-1.5 bg-amber-500/10 rounded text-amber-500 animate-pulse">
                                    <Zap size={14} fill="currentColor" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">Reação Necessária!</div>
                                    <div className="flex items-center gap-3 text-xs">
                                        <span className="text-slate-400">Dano iminente: <span className="text-red-400 font-bold">{reaction.damageApplied}</span></span>
                                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                        <span className="text-slate-400">Esquiva: <span className="text-blue-400 font-bold">{reaction.defenseNeeded}+</span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default RPGMessage;
