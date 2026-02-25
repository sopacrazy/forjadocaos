
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Plus, Trash2, Edit2, Save, X, Settings, List } from 'lucide-react';

interface SheetField {
  id: string;
  label: string;
  field_key: string;
  field_type: string;
  options: string[] | null;
  section: string;
  required: boolean;
  order_index: number;
}

const AdminSheetFieldsEditor: React.FC = () => {
  const [fields, setFields] = useState<SheetField[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<SheetField | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado temporário para opções do select (string com vírgulas)
  const [optionsString, setOptionsString] = useState('');

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('sheet_fields')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (data) setFields(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja apagar este campo? Os dados preenchidos nele podem ser perdidos visualmente.')) return;
    await supabase.from('sheet_fields').delete().eq('id', id);
    fetchFields();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingField) return;

    const fieldToSave = { ...editingField };
    
    // Processar opções se for select
    if (fieldToSave.field_type === 'select') {
        fieldToSave.options = optionsString.split(',').map(s => s.trim()).filter(s => s !== '');
    } else {
        fieldToSave.options = null;
    }

    if (!fieldToSave.id) delete (fieldToSave as any).id;

    const { error } = await supabase.from('sheet_fields').upsert(fieldToSave);

    if (error) {
      alert('Erro ao salvar campo: ' + error.message);
    } else {
      setIsModalOpen(false);
      setEditingField(null);
      fetchFields();
    }
  };

  const openNewField = () => {
    setEditingField({
      id: '',
      label: '',
      field_key: '',
      field_type: 'text',
      options: [],
      section: 'info',
      required: false,
      order_index: fields.length + 1
    });
    setOptionsString('');
    setIsModalOpen(true);
  };

  const openEditField = (field: SheetField) => {
    setEditingField(field);
    setOptionsString(field.options ? field.options.join(', ') : '');
    setIsModalOpen(true);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-cyan-500" />
          Configuração da Ficha
        </h3>
        <button
          onClick={openNewField}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-cyan-900/20"
        >
          <Plus className="w-4 h-4" />
          Novo Campo
        </button>
      </div>

      <p className="text-slate-400 text-sm mb-6 bg-slate-950 p-4 rounded border border-slate-800">
        Aqui você define quais perguntas aparecerão na ficha de criação de personagem. 
        O "Nome do Campo (Key)" deve ser único e simples (sem espaços, ex: 'idade', 'historia').
      </p>

      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-cyan-500" /></div>
      ) : (
        <div className="space-y-2">
          {fields.map((field) => (
            <div key={field.id} className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800 hover:border-cyan-500/30 transition-colors">
              <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-slate-500 border border-slate-800 font-mono text-xs">
                      {field.order_index}
                  </div>
                  <div>
                      <h4 className="text-white font-bold">{field.label}</h4>
                      <div className="flex gap-2 text-xs text-slate-500 mt-1">
                          <span className="font-mono bg-slate-900 px-1 rounded border border-slate-800">{field.field_key}</span>
                          <span className="lowercase bg-slate-900 px-1 rounded border border-slate-800 text-cyan-400">{field.field_type}</span>
                          {field.required && <span className="text-red-400">Obrigatório</span>}
                      </div>
                  </div>
              </div>

              <div className="flex gap-2">
                  <button onClick={() => openEditField(field)} className="p-2 bg-slate-900 text-slate-400 hover:text-white rounded hover:bg-cyan-900/20"><Edit2 className="w-4 h-4"/></button>
                  <button onClick={() => handleDelete(field.id)} className="p-2 bg-slate-900 text-red-500 hover:text-red-400 rounded hover:bg-red-900/20"><Trash2 className="w-4 h-4"/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Edição */}
      {isModalOpen && editingField && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingField.id ? 'Editar Campo' : 'Novo Campo'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Rótulo (Pergunta)</label>
                  <input
                    type="text"
                    required
                    value={editingField.label}
                    onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-cyan-500 outline-none"
                    placeholder="Ex: Qual sua idade?"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Key (ID Interno)</label>
                  <input
                    type="text"
                    required
                    value={editingField.field_key}
                    onChange={(e) => setEditingField({ ...editingField, field_key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-cyan-500 outline-none font-mono text-xs"
                    placeholder="Ex: idade (sem espaços)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Tipo de Campo</label>
                  <select
                    value={editingField.field_type}
                    onChange={(e) => setEditingField({ ...editingField, field_type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-cyan-500 outline-none"
                  >
                      <option value="text">Texto Curto</option>
                      <option value="textarea">Texto Longo</option>
                      <option value="number">Número</option>
                      <option value="select">Seleção (Dropdown)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Ordem</label>
                  <input
                    type="number"
                    value={editingField.order_index}
                    onChange={(e) => setEditingField({ ...editingField, order_index: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              {editingField.field_type === 'select' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Opções (Separadas por vírgula)</label>
                    <textarea
                        value={optionsString}
                        onChange={(e) => setOptionsString(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-cyan-500 outline-none"
                        placeholder="Ex: Humano, Elfo, Anão"
                        rows={3}
                    />
                  </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="required"
                    checked={editingField.required}
                    onChange={(e) => setEditingField({...editingField, required: e.target.checked})}
                    className="w-4 h-4 accent-cyan-500"
                  />
                  <label htmlFor="required" className="text-sm text-slate-300 cursor-pointer">Obrigatório</label>
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
                  className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold shadow-lg shadow-cyan-900/20"
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

export default AdminSheetFieldsEditor;
