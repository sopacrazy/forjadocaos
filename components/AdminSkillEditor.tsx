
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Plus, Trash2, Edit2, Save, X, Wand2, Flame, Wind, Mountain, Zap, ShieldCheck, Sparkles, Waves } from 'lucide-react';

// Mapeamento de ícones para exibição no Editor
const SKILL_ICONS: Record<string, React.ReactNode> = {
  'Flame': <Flame className="w-5 h-5 text-red-500" />,
  'Wind': <Wind className="w-5 h-5 text-slate-400" />,
  'Mountain': <Mountain className="w-5 h-5 text-yellow-700" />,
  'Zap': <Zap className="w-5 h-5 text-yellow-400" />,
  'ShieldCheck': <ShieldCheck className="w-5 h-5 text-blue-400" />,
  'Sparkles': <Sparkles className="w-5 h-5 text-purple-400" />,
  'Waves': <Waves className="w-5 h-5 text-blue-600" />,
  'Wand2': <Wand2 className="w-5 h-5 text-slate-200" />,
};

const ICON_OPTIONS = Object.keys(SKILL_ICONS);

interface Skill {
  id: string;
  rank: string;
  name: string;
  cost: string;
  description: string;
  icon_name: string;
  order_index: number;
}

const AdminSkillEditor: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRankFilter, setSelectedRankFilter] = useState('E'); // Filtro inicial

  useEffect(() => {
    fetchSkills();
  }, [selectedRankFilter]);

  const fetchSkills = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('skills')
      .select('*')
      .eq('rank', selectedRankFilter)
      .order('order_index', { ascending: true });
    
    if (data) setSkills(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja apagar esta habilidade?')) return;
    await supabase.from('skills').delete().eq('id', id);
    fetchSkills();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill) return;

    const { error } = await supabase.from('skills').upsert({
      ...editingSkill,
      // updated_at é bom ter, mas se não tiver no schema ok
    });

    if (error) {
      alert('Erro ao salvar: ' + error.message);
    } else {
      setIsModalOpen(false);
      setEditingSkill(null);
      fetchSkills();
    }
  };

  const openNewSkill = () => {
    setEditingSkill({
      id: '',
      rank: selectedRankFilter, // Já preenche com o rank atual
      name: '',
      cost: '2 PE',
      description: '',
      icon_name: 'Wand2',
      order_index: skills.length + 1
    });
    setIsModalOpen(true);
  };

  const openEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Wand2 className="w-6 h-6 text-purple-500" />
          Grimório de Habilidades
        </h3>
        
        <div className="flex items-center gap-4">
          <select
            value={selectedRankFilter}
            onChange={(e) => setSelectedRankFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-purple-500 font-bold"
          >
            {['E', 'D', 'C', 'B', 'A', 'S'].map(r => (
              <option key={r} value={r}>Rank {r}</option>
            ))}
          </select>

          <button
            onClick={openNewSkill}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            Nova Habilidade
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-purple-500" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.length === 0 && (
            <div className="col-span-3 text-center py-12 text-slate-500">
              Nenhuma habilidade encontrada para o Rank {selectedRankFilter}.
            </div>
          )}
          
          {skills.map((skill) => (
            <div key={skill.id} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-purple-500/50 group transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 group-hover:bg-purple-900/20 transition-colors">
                    {SKILL_ICONS[skill.icon_name] || <Wand2 className="w-5 h-5 text-slate-500" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{skill.name}</h4>
                    <span className="text-[10px] text-purple-400 font-bold bg-purple-900/20 px-1.5 py-0.5 rounded border border-purple-900/30">
                      {skill.cost}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => openEditSkill(skill)} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><Edit2 className="w-3.5 h-3.5" /></button>
                   <button onClick={() => handleDelete(skill.id)} className="p-1.5 hover:bg-red-900/20 rounded text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <p className="text-xs text-slate-500 italic line-clamp-3">{skill.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Edição */}
      {isModalOpen && editingSkill && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingSkill.id ? 'Editar Habilidade' : 'Nova Habilidade'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                   <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Rank</label>
                   <select
                      value={editingSkill.rank}
                      onChange={(e) => setEditingSkill({ ...editingSkill, rank: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white outline-none focus:border-purple-500"
                    >
                      {['E', 'D', 'C', 'B', 'A', 'S', 'SS'].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                   </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Nome da Habilidade</label>
                  <input
                    type="text"
                    required
                    value={editingSkill.name}
                    onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Custo (Ex: 2 PE)</label>
                  <input
                    type="text"
                    required
                    value={editingSkill.cost}
                    onChange={(e) => setEditingSkill({ ...editingSkill, cost: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Ícone</label>
                  <select
                     value={editingSkill.icon_name}
                     onChange={(e) => setEditingSkill({ ...editingSkill, icon_name: e.target.value })}
                     className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white outline-none focus:border-purple-500"
                  >
                    {ICON_OPTIONS.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Descrição</label>
                <textarea
                  required
                  rows={3}
                  value={editingSkill.description}
                  onChange={(e) => setEditingSkill({ ...editingSkill, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-purple-500 outline-none text-sm resize-none"
                />
              </div>

               <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Ordem</label>
                <input
                  type="number"
                  value={editingSkill.order_index}
                  onChange={(e) => setEditingSkill({ ...editingSkill, order_index: parseInt(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-purple-500 outline-none"
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
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold shadow-lg shadow-purple-900/20"
                >
                  <Save className="w-4 h-4" />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSkillEditor;
