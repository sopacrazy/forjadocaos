
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Search, FileText, User, Eye, Trash2, X } from 'lucide-react';

interface PlayerSheet {
  id: string;
  user_id: string;
  data: any;
  created_at: string;
}

interface Profile {
  id: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
}

const AdminPlayersList: React.FC = () => {
  const [sheets, setSheets] = useState<PlayerSheet[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [selectedSheet, setSelectedSheet] = useState<PlayerSheet | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // 1. Buscar Fichas
    const { data: sheetsData } = await supabase
        .from('player_sheets')
        .select('*')
        .order('created_at', { ascending: false });

    if (sheetsData) {
        setSheets(sheetsData);
        
        // 2. Buscar Perfis dos donos das fichas
        const userIds = sheetsData.map(s => s.user_id);
        if (userIds.length > 0) {
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, full_name, username, avatar_url') // Assumindo campos comuns
                .in('id', userIds);
            
            if (profilesData) {
                const profilesMap: Record<string, Profile> = {};
                profilesData.forEach(p => profilesMap[p.id] = p);
                setProfiles(profilesMap);
            }
        }
    }
    setLoading(false);
  };

  const handleDeleteSheet = async (id: string) => {
      if (!confirm('Atenção: Isso apagará a ficha do jogador permanentemente. Confirmar?')) return;
      await supabase.from('player_sheets').delete().eq('id', id);
      fetchData();
  }

  // Função auxiliar para pegar nome do jogador
  const getPlayerName = (userId: string, sheet?: PlayerSheet) => {
      const p = profiles[userId];
      if (p?.full_name || p?.username) return p.full_name || p.username;
      if (sheet?.data?.nome) return sheet.data.nome; // Nome do personagem
      return 'Lenda (' + userId.slice(0, 6) + ')';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
          {/* Header */}
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-6 h-6 text-green-500" />
            Jogadores Cadastrados
          </h3>
          <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input 
                  type="text" 
                  placeholder="Buscar lenda..." 
                  className="bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-green-500 outline-none w-64"
              />
          </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-green-500" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sheets.map((sheet) => (
            <div key={sheet.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-green-500/50 transition-all group">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden border border-slate-700">
                            <span className="text-lg font-epic">
                                {sheet.data.nome ? sheet.data.nome.charAt(0).toUpperCase() : '?'}
                            </span>
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-base font-epic">{getPlayerName(sheet.user_id, sheet)}</h4>
                            <span className="text-xs text-slate-500 block">Rank: <span className="text-yellow-500 font-bold">{sheet.data.rank || 'E'}</span></span>
                        </div>
                    </div>
                     <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button onClick={() => handleDeleteSheet(sheet.id)} className="p-2 text-red-500 hover:bg-red-900/20 rounded"><Trash2 className="w-4 h-4"/></button>
                    </div>
                </div>
                
                <div className="space-y-2 mb-4 bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                    <div className="text-xs flex justify-between border-b border-slate-800 pb-1 mb-1">
                        <span className="text-slate-500">Raça:</span>
                        <span className="text-slate-300 font-medium">{sheet.data.raca || '-'}</span>
                    </div>
                     <div className="text-xs flex justify-between border-b border-slate-800 pb-1 mb-1">
                        <span className="text-slate-500">Origem:</span>
                        <span className="text-slate-300 font-medium">{sheet.data.origem || '-'}</span>
                    </div>
                    <div className="text-xs flex justify-between">
                        <span className="text-slate-500">Nível:</span>
                        <span className="text-purple-400 font-bold">{sheet.data.nivel || '1'}</span>
                    </div>
                </div>

                <button 
                    onClick={() => setSelectedSheet(sheet)}
                    className="w-full py-2 bg-slate-800 hover:bg-green-600/20 text-green-400 hover:text-green-300 text-xs font-bold rounded flex items-center justify-center gap-2 border border-slate-700 hover:border-green-500/50 transition-all uppercase tracking-wider"
                >
                    <Eye className="w-3 h-3" /> Ver Grimório
                </button>
            </div>
          ))}
          {sheets.length === 0 && (
              <div className="col-span-3 text-center py-12 text-slate-500">
                  Nenhuma lenda iniciou sua jornada ainda.
              </div>
          )}
        </div>
      )}

      {/* Modal de Visualização da Ficha */}
      {selectedSheet && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <FileText className="w-5 h-5 text-green-500" />
                          Ficha de: {getPlayerName(selectedSheet.user_id, selectedSheet)}
                      </h3>
                      <button onClick={() => setSelectedSheet(null)} className="text-slate-400 hover:text-white">
                          <X className="w-6 h-6" />
                      </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(selectedSheet.data).map(([key, value]) => (
                          <div key={key} className="bg-slate-950 p-3 rounded border border-slate-800 break-words">
                              <span className="block text-xs font-bold text-slate-500 uppercase mb-1">{key}</span>
                              <span className="text-slate-200 text-sm font-mono whitespace-pre-wrap">
                                {typeof value === 'object' && value !== null 
                                    ? JSON.stringify(value, null, 2) 
                                    : String(value)}
                              </span>
                          </div>
                      ))}
                  </div>
                  
                  <div className="mt-8 pt-4 border-t border-slate-800 text-right">
                       <button onClick={() => setSelectedSheet(null)} className="px-6 py-2 bg-slate-800 text-white rounded hover:bg-slate-700">Fechar</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminPlayersList;
