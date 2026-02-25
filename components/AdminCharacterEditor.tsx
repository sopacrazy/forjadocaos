
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Plus, Trash2, Edit2, Save, X, Users, Upload, Image as ImageIcon } from 'lucide-react';

interface Character {
  id: string;
  name: string;
  title: string;
  tag: string;
  element: string;
  description: string;
  image_url: string;
  stats_power: number;
  stats_wisdom: number;
  stats_resistance: number;
  order_index: number;
}

const AdminCharacterEditor: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingChar, setEditingChar] = useState<Character | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('characters')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (data) setCharacters(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja apagar este personagem?')) return;
    await supabase.from('characters').delete().eq('id', id);
    fetchCharacters();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChar) return;

    // Remove o ID se for vazio para o Postgres gerar um novo UUID
    const charToSave = { ...editingChar };
    if (!charToSave.id) {
      delete (charToSave as any).id;
    }

    const { error } = await supabase.from('characters').upsert(charToSave);

    if (error) {
      alert('Erro ao salvar: ' + error.message);
    } else {
      setIsModalOpen(false);
      setEditingChar(null);
      fetchCharacters();
    }
  };

  const openNewChar = () => {
    setEditingChar({
      id: '',
      name: '',
      title: '',
      tag: '',
      element: '',
      description: '',
      image_url: '',
      stats_power: 50,
      stats_wisdom: 50,
      stats_resistance: 50,
      order_index: characters.length + 1
    });
    setIsModalOpen(true);
  };

  const openEditChar = (char: Character) => {
    setEditingChar(char);
    setIsModalOpen(true);
  };

  // Upload simples para bucket 'character-images'
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Selecione uma imagem.');
      }
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('character-images')
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message.includes('not found') || uploadError.message.includes('bucket')) {
             alert('Atenção: O bucket de upload "character-images" pode não existir. Crie-o no painel do Supabase (Storage -> New Bucket -> "character-images" -> Public). Enquanto isso, use URLs externas.');
        } else {
             throw uploadError;
        }
        setUploading(false);
        return;
      }

      const { data } = supabase.storage.from('character-images').getPublicUrl(filePath);
      
      if (editingChar) {
          setEditingChar({ ...editingChar, image_url: data.publicUrl });
      }

    } catch (error: any) {
      alert('Erro no upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-500" />
          Personagens Conhecidos
        </h3>
        <button
          onClick={openNewChar}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-purple-900/20"
        >
          <Plus className="w-4 h-4" />
          Novo Personagem
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-purple-500" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((char) => (
            <div key={char.id} className="group relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 hover:border-purple-500/50 transition-all">
              <div className="aspect-[4/5] w-full relative">
                <img 
                    src={char.image_url || 'https://via.placeholder.com/400x500?text=Sem+Imagem'} 
                    alt={char.name} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => openEditChar(char)} className="p-2 bg-slate-900 text-white rounded-lg hover:bg-purple-600 transition"><Edit2 className="w-4 h-4" /></button>
                     <button onClick={() => handleDelete(char.id)} className="p-2 bg-slate-900 text-red-500 rounded-lg hover:bg-red-900/50 transition"><Trash2 className="w-4 h-4" /></button>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-1 block">{char.title}</span>
                    <h4 className="text-xl font-epic font-bold text-white mb-2">{char.name}</h4>
                    <div className="flex gap-2">
                        <span className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-300 font-bold border border-slate-700">{char.element}</span>
                        <span className="px-2 py-1 bg-yellow-900/20 rounded text-[10px] text-yellow-500 font-bold border border-yellow-900/30">{char.tag}</span>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Edição */}
      {isModalOpen && editingChar && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingChar.id ? 'Editar Personagem' : 'Novo Personagem'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Imagem */}
              <div className="flex gap-6 items-start">
                  <div className="w-32 h-40 bg-slate-950 rounded-lg border border-slate-700 overflow-hidden flex-shrink-0 relative group">
                      {editingChar.image_url ? (
                          <img src={editingChar.image_url} className="w-full h-full object-cover" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                              <ImageIcon className="w-8 h-8" />
                          </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <label className="cursor-pointer text-xs text-white bg-purple-600 px-2 py-1 rounded">
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Trocar'}
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                            </label>
                      </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">URL da Imagem (Opcional)</label>
                        <input
                            type="text"
                            value={editingChar.image_url}
                            onChange={(e) => setEditingChar({ ...editingChar, image_url: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-purple-500 outline-none text-xs"
                            placeholder="https://..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Nome</label>
                            <input
                                type="text"
                                required
                                value={editingChar.name}
                                onChange={(e) => setEditingChar({ ...editingChar, name: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-purple-500 outline-none"
                            />
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Título (Subtítulo)</label>
                            <input
                                type="text"
                                required
                                value={editingChar.title}
                                onChange={(e) => setEditingChar({ ...editingChar, title: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-purple-500 outline-none"
                            />
                        </div>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Tag Principal (Botão)</label>
                    <input
                        type="text"
                        required
                        value={editingChar.tag}
                        onChange={(e) => setEditingChar({ ...editingChar, tag: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-purple-500 outline-none"
                    />
                </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Elemento (Tag Pequena)</label>
                    <input
                        type="text"
                        required
                        value={editingChar.element}
                        onChange={(e) => setEditingChar({ ...editingChar, element: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-purple-500 outline-none"
                    />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Descrição / História</label>
                <textarea
                    required
                    rows={4}
                    value={editingChar.description}
                    onChange={(e) => setEditingChar({ ...editingChar, description: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-purple-500 outline-none text-sm resize-none"
                />
              </div>

              {/* Stats Sliders */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Upload className="w-3 h-3" /> Estatísticas</h4>
                  
                  {['power', 'wisdom', 'resistance'].map(stat => (
                      <div key={stat}>
                          <div className="flex justify-between text-xs text-slate-400 mb-1 uppercase font-bold">
                              <span>{stat === 'power' ? 'Poder' : stat === 'wisdom' ? 'Sabedoria' : 'Resistência'}</span>
                              <span className="text-purple-400">{editingChar[`stats_${stat}` as keyof Character]}</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={editingChar[`stats_${stat}` as keyof Character] as number}
                            onChange={(e) => setEditingChar({...editingChar, [`stats_${stat}`]: parseInt(e.target.value)})}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                          />
                      </div>
                  ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Ordem</label>
                <input
                  type="number"
                  value={editingChar.order_index}
                  onChange={(e) => setEditingChar({ ...editingChar, order_index: parseInt(e.target.value) })}
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
                  disabled={uploading}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold shadow-lg shadow-purple-900/20 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {uploading ? 'Enviando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCharacterEditor;
