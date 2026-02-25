
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Plus, Trash2, Edit2, Save, X, Coins } from 'lucide-react';

interface EconomyRow {
  id: string;
  rank: string;
  level_range: string;
  base_currency: string;
  avg_value: string;
  common_items: string;
  order_index: number;
}

const AdminEconomyEditor: React.FC = () => {
  const [rows, setRows] = useState<EconomyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRow, setEditingRow] = useState<EconomyRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchRows();
  }, []);

  const fetchRows = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('economy_table')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (data) setRows(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja apagar esta linha?')) return;
    await supabase.from('economy_table').delete().eq('id', id);
    fetchRows();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;

    const { error } = await supabase.from('economy_table').upsert({
      ...editingRow,
      updated_at: new Date()
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
      id: '',
      rank: 'E',
      level_range: '1-5',
      base_currency: 'Bronze',
      avg_value: '',
      common_items: '',
      order_index: rows.length + 1
    });
    setIsModalOpen(true);
  };

  const openEditRow = (row: EconomyRow) => {
    setEditingRow(row);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Coins className="w-6 h-6 text-yellow-500" />
          Economia & Recompensas
        </h3>
        <button
          onClick={openNewRow}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-yellow-900/20"
        >
          <Plus className="w-4 h-4" />
          Nova Linha
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-yellow-500" /></div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-200 uppercase font-bold text-xs">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4">Níveis</th>
                <th className="p-4">Moeda Base</th>
                <th className="p-4">Valor Médio</th>
                <th className="p-4">Itens Comuns</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-bold text-white">{row.rank}</td>
                  <td className="p-4">{row.level_range}</td>
                  <td className="p-4 text-yellow-500 font-bold">{row.base_currency}</td>
                  <td className="p-4 font-mono text-slate-300">{row.avg_value}</td>
                  <td className="p-4 italic text-slate-500 text-xs">{row.common_items}</td>
                  <td className="p-4 flex justify-end gap-2">
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
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Rank</label>
                  <input
                    type="text"
                    required
                    value={editingRow.rank}
                    onChange={(e) => setEditingRow({ ...editingRow, rank: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-yellow-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Faixa de Nível</label>
                  <input
                    type="text"
                    required
                    value={editingRow.level_range}
                    onChange={(e) => setEditingRow({ ...editingRow, level_range: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-yellow-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Moeda Base</label>
                  <input
                    type="text"
                    required
                    value={editingRow.base_currency}
                    onChange={(e) => setEditingRow({ ...editingRow, base_currency: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-yellow-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Valor Médio</label>
                  <input
                    type="text"
                    required
                    value={editingRow.avg_value}
                    onChange={(e) => setEditingRow({ ...editingRow, avg_value: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-yellow-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Itens Comuns</label>
                <input
                  type="text"
                  required
                  value={editingRow.common_items}
                  onChange={(e) => setEditingRow({ ...editingRow, common_items: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-yellow-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Ordem (Índice)</label>
                <input
                  type="number"
                  value={editingRow.order_index}
                  onChange={(e) => setEditingRow({ ...editingRow, order_index: parseInt(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-yellow-500 outline-none"
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
                  className="flex items-center gap-2 px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-bold shadow-lg shadow-yellow-900/20"
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

export default AdminEconomyEditor;
