
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Plus, Trash2, Edit2, Save, X } from 'lucide-react';

interface ProgressionRow {
  id: string;
  rank: string;
  levels: string;
  attribute_limit: string;
  xp_required: string;
  gains: string;
  order_index: number;
}

const AdminProgressionEditor: React.FC = () => {
  const [rows, setRows] = useState<ProgressionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRow, setEditingRow] = useState<ProgressionRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchRows();
  }, []);

  const fetchRows = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('progression_table')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (data) setRows(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja apagar esta linha?')) return;
    await supabase.from('progression_table').delete().eq('id', id);
    fetchRows();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;

    const { error } = await supabase.from('progression_table').upsert({
      ...editingRow,
      updated_at: new Date() // Se precisar, adicione updated_at no SQL via trigger ou coluna
    });

    if (error) {
      alert('Erro ao salvar: ' + error.message);
    } else {
      setIsModalOpen(false);
      setEditingRow(null);
      fetchRows();
    }
  };

  const openNewRow = () => {
    setEditingRow({
      id: '', // ID vazio para novo
      rank: '',
      levels: '',
      attribute_limit: '',
      xp_required: '',
      gains: '+2 PA / +2 PE',
      order_index: rows.length + 1
    });
    setIsModalOpen(true);
  };

  const openEditRow = (row: ProgressionRow) => {
    setEditingRow(row);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-6 mb-8">
      <div className="flex justify-between items-center mb-6 gap-4">
        <h3 className="text-lg md:text-xl font-bold text-white">Tabela de Progressão & Limites</h3>
        <button
          onClick={openNewRow}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-all text-sm md:text-base shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nova Linha
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-purple-500" /></div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-200 uppercase font-bold text-xs">
              <tr>
                <th className="p-3 whitespace-nowrap">Rank</th>
                <th className="p-3 whitespace-nowrap">Níveis</th>
                <th className="p-3 whitespace-nowrap">Limite Atrib.</th>
                <th className="p-3 whitespace-nowrap">XP Necessário</th>
                <th className="p-3 whitespace-nowrap">Ganhos</th>
                <th className="p-3 whitespace-nowrap text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 whitespace-nowrap font-bold text-white">{row.rank}</td>
                  <td className="p-3 whitespace-nowrap">{row.levels}</td>
                  <td className="p-3 whitespace-nowrap text-yellow-500">{row.attribute_limit}</td>
                  <td className="p-3 whitespace-nowrap italic">{row.xp_required}</td>
                  <td className="p-3 whitespace-nowrap text-green-400">{row.gains}</td>
                  <td className="p-3 whitespace-nowrap flex justify-end gap-2">
                    <button onClick={() => openEditRow(row)} className="p-2 hover:text-white hover:bg-slate-700 rounded"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(row.id)} className="p-2 text-red-500 hover:bg-red-900/20 rounded"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Edição */}
      {isModalOpen && editingRow && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingRow.id ? 'Editar Linha' : 'Nova Linha'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Rank (Ex: E)</label>
                  <input
                    type="text"
                    required
                    value={editingRow.rank}
                    onChange={(e) => setEditingRow({ ...editingRow, rank: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Níveis (Ex: 1-5)</label>
                  <input
                    type="text"
                    required
                    value={editingRow.levels}
                    onChange={(e) => setEditingRow({ ...editingRow, levels: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Limite Atributo (Ex: 5)</label>
                  <input
                    type="text"
                    required
                    value={editingRow.attribute_limit}
                    onChange={(e) => setEditingRow({ ...editingRow, attribute_limit: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">XP Necessário</label>
                  <input
                    type="text"
                    required
                    value={editingRow.xp_required}
                    onChange={(e) => setEditingRow({ ...editingRow, xp_required: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Ganhos por Nível</label>
                <input
                  type="text"
                  required
                  value={editingRow.gains}
                  onChange={(e) => setEditingRow({ ...editingRow, gains: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Ordem (Ex: 1, 2, 3)</label>
                <input
                  type="number"
                  value={editingRow.order_index}
                  onChange={(e) => setEditingRow({ ...editingRow, order_index: parseInt(e.target.value) })}
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
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold shadow-lg shadow-green-900/20"
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

export default AdminProgressionEditor;
