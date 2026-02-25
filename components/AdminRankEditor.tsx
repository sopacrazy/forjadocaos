
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Loader2, Plus, Trash2, Edit2, Save, X, 
  Sword, Shield, Flame, Crown, Star, Zap, Eye, 
  Skull, Heart, Crosshair, Target, Briefcase, Book, Anchor 
} from 'lucide-react';

// Mapeamento de nomes de ícones para componentes
export const ICON_MAP: Record<string, React.ReactNode> = {
  'Sword': <Sword className="w-6 h-6" />,
  'Shield': <Shield className="w-6 h-6" />,
  'Flame': <Flame className="w-6 h-6" />,
  'Crown': <Crown className="w-6 h-6" />,
  'Star': <Star className="w-6 h-6" />,
  'Zap': <Zap className="w-6 h-6" />,
  'Eye': <Eye className="w-6 h-6" />,
  'Skull': <Skull className="w-6 h-6" />,
  'Heart': <Heart className="w-6 h-6" />,
  'Target': <Target className="w-6 h-6" />,
  'Book': <Book className="w-6 h-6" />,
  'Anchor': <Anchor className="w-6 h-6" />
};

const COLOR_OPTIONS = [
  { label: 'Cinza', value: 'text-slate-400' },
  { label: 'Verde', value: 'text-green-500' },
  { label: 'Azul', value: 'text-blue-500' },
  { label: 'Roxo', value: 'text-purple-500' },
  { label: 'Dourado', value: 'text-yellow-500' },
  { label: 'Laranja', value: 'text-orange-500' },
  { label: 'Vermelho', value: 'text-red-600' },
];

interface Rank {
  id: string;
  name: string;
  description: string;
  rank_code: string;
  icon_name: string;
  color_class: string;
  order_index: number;
}

const AdminRankEditor: React.FC = () => {
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRank, setEditingRank] = useState<Rank | null>(null); // Se null, não está editando. Se tem ID, edita. Se não tem ID, cria.
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchRanks();
  }, []);

  const fetchRanks = async () => {
    setLoading(true);
    const { data } = await supabase.from('ranks').select('*').order('order_index', { ascending: true });
    if (data) setRanks(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja apagar este Rank?')) return;
    await supabase.from('ranks').delete().eq('id', id);
    fetchRanks();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRank) return;

    const { error } = await supabase.from('ranks').upsert({
      ...editingRank,
      updated_at: new Date()
    });

    if (error) {
      alert('Erro ao salvar: ' + error.message);
    } else {
      setIsModalOpen(false);
      setEditingRank(null);
      fetchRanks();
    }
  };

  const openNewRank = () => {
    setEditingRank({
      id: '', // ID vazio indica novo
      name: '',
      description: '',
      rank_code: '',
      icon_name: 'Sword',
      color_class: 'text-slate-400',
      order_index: ranks.length + 1
    });
    setIsModalOpen(true);
  };

  const openEditRank = (rank: Rank) => {
    setEditingRank(rank);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Gerenciar Ranks</h3>
        <button
          onClick={openNewRank}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-all"
        >
          <Plus className="w-4 h-4" />
          Novo Rank
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-purple-500" /></div>
      ) : (
        <div className="space-y-4">
          {ranks.map((rank) => (
            <div key={rank.id} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded bg-slate-900 ${rank.color_class}`}>
                  {ICON_MAP[rank.icon_name] || <Sword className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="font-bold text-white flex items-center gap-2">
                    {rank.name}
                    <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">{rank.rank_code}</span>
                  </h4>
                  <p className="text-sm text-slate-500 truncate max-w-md">{rank.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditRank(rank)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(rank.id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Edição */}
      {isModalOpen && editingRank && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingRank.id ? 'Editar Rank' : 'Novo Rank'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Nome</label>
                  <input
                    type="text"
                    required
                    value={editingRank.name}
                    onChange={(e) => setEditingRank({ ...editingRank, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none"
                    placeholder="Ex: Mestre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Código (Letra)</label>
                  <input
                    type="text"
                    required
                    value={editingRank.rank_code}
                    onChange={(e) => setEditingRank({ ...editingRank, rank_code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none"
                    placeholder="Ex: SS"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Descrição</label>
                <textarea
                  required
                  value={editingRank.description}
                  onChange={(e) => setEditingRank({ ...editingRank, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none h-24"
                  placeholder="Descrição do nível de poder..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Ícone</label>
                  <div className="relative">
                    <select
                      value={editingRank.icon_name}
                      onChange={(e) => setEditingRank({ ...editingRank, icon_name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 pl-10 text-white focus:border-purple-500 focus:outline-none appearance-none"
                    >
                      {Object.keys(ICON_MAP).map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                    <div className="absolute left-3 top-3 pointer-events-none text-purple-400">
                      {ICON_MAP[editingRank.icon_name] || <Sword className="w-5 h-5"/>}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Cor do Tema</label>
                  <select
                    value={editingRank.color_class}
                    onChange={(e) => setEditingRank({ ...editingRank, color_class: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none"
                  >
                    {COLOR_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Ordem (1, 2, 3...)</label>
                  <input
                    type="number"
                    value={editingRank.order_index}
                    onChange={(e) => setEditingRank({ ...editingRank, order_index: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none"
                  />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold shadow-lg shadow-green-900/20"
                >
                  <Save className="w-4 h-4" />
                  Salvar Rank
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRankEditor;
