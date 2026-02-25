
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Plus, Trash2, Edit2, Save, X, Globe, Eye, Upload, Image as ImageIcon } from 'lucide-react';

interface Mythology {
  id: string;
  name: string;
  description: string;
  image_url: string;
  grid_position: string;
  order_index: number;
}

interface SiteContent {
  creation_title: string;
  creation_subtitle: string;
  creation_description: string;
  creation_features: any[];
}

const AdminMythologyEditor: React.FC = () => {
  const [myths, setMyths] = useState<Mythology[]>([]);
  const [content, setContent] = useState<SiteContent>({
    creation_title: '',
    creation_subtitle: '',
    creation_description: '',
    creation_features: []
  });
  const [loading, setLoading] = useState(true);
  const [savingContent, setSavingContent] = useState(false);
  
  const [editingMyth, setEditingMyth] = useState<Mythology | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch Mythologies
    const { data: mythsData } = await supabase
      .from('mythologies')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (mythsData) setMyths(mythsData);

    // Fetch Content
    const { data: contentData } = await supabase
      .from('site_content')
      .select('creation_title, creation_subtitle, creation_description, creation_features')
      .eq('id', 'main')
      .single();
    
    if (contentData) setContent(contentData);

    setLoading(false);
  };

  const handleSaveContent = async () => {
    setSavingContent(true);
    const { error } = await supabase
      .from('site_content')
      .update(content)
      .eq('id', 'main');

    if (error) alert('Erro ao salvar conteúdo: ' + error.message);
    else alert('Conteúdo salvo com sucesso!');
    
    setSavingContent(false);
  };

  const handleDeleteMyth = async (id: string) => {
    if (!confirm('Tem certeza que deseja apagar esta mitologia?')) return;
    await supabase.from('mythologies').delete().eq('id', id);
    fetchData();
  };

  const handleSaveMyth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMyth) return;

    const mythToSave = { ...editingMyth };
    if (!mythToSave.id) delete (mythToSave as any).id;

    const { error } = await supabase.from('mythologies').upsert(mythToSave);

    if (error) {
      alert('Erro ao salvar mitologia: ' + error.message);
    } else {
      setIsModalOpen(false);
      setEditingMyth(null);
      fetchData();
    }
  };

  const openNewMyth = () => {
    setEditingMyth({
      id: '',
      name: '',
      description: '',
      image_url: '',
      grid_position: 'default',
      order_index: myths.length + 1
    });
    setIsModalOpen(true);
  };

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
  
        // Usando o mesmo bucket 'character-images' ou criar um novo 'site-assets'
        // Vou usar character-images para simplificar, mas idealmente seria outro bucket
        const { error: uploadError } = await supabase.storage
          .from('character-images') // Reutilizando bucket
          .upload(filePath, file);
  
        if (uploadError) {
             if (uploadError.message.includes('not found') || uploadError.message.includes('bucket')) {
                  alert('Atenção: Bucket não encontrado. Use URL externa.');
             } else {
                  throw uploadError;
             }
             setUploading(false);
             return;
        }
  
        const { data } = supabase.storage.from('character-images').getPublicUrl(filePath);
        
        if (editingMyth) {
            setEditingMyth({ ...editingMyth, image_url: data.publicUrl });
        }
  
      } catch (error: any) {
        alert('Erro no upload: ' + error.message);
      } finally {
        setUploading(false);
      }
    };

  return (
    <div className="space-y-8">
      {/* Seção de Conteúdo Textual */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-purple-500" />
              Conteúdo da Seção
          </h3>
          <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Subtítulo (Dourado)</label>
                      <input 
                          value={content.creation_subtitle}
                          onChange={e => setContent({...content, creation_subtitle: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-purple-500 outline-none"
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Título (HTML Permitido)</label>
                      <input 
                          value={content.creation_title}
                          onChange={e => setContent({...content, creation_title: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-purple-500 outline-none"
                      />
                  </div>
              </div>
              
              <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Descrição Principal</label>
                  <textarea 
                      rows={3}
                      value={content.creation_description}
                      onChange={e => setContent({...content, creation_description: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-purple-500 outline-none"
                  />
              </div>

              {/* Editor Simples de Features (JSON) */}
              <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Lista de Benefícios (JSON)</label>
                  <textarea 
                      rows={5}
                      value={JSON.stringify(content.creation_features, null, 2)}
                      onChange={e => {
                          try {
                              const parsed = JSON.parse(e.target.value);
                              setContent({...content, creation_features: parsed});
                          } catch (err) {
                              // Deixa digitar, só não atualiza estado se inválido (melhorar depois)
                          }
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-green-400 font-mono text-xs focus:border-purple-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Edite o JSON com cuidado. Mantenha a estrutura.</p>
              </div>

              <div className="flex justify-end pt-2">
                   <button 
                      onClick={handleSaveContent}
                      disabled={savingContent}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold flex items-center gap-2"
                   >
                      {savingContent ? <Loader2 className="animate-spin w-4 h-4"/> : <Save className="w-4 h-4"/>}
                      Salvar Textos
                   </button>
              </div>
          </div>
      </div>

      {/* Seção de Cards (Mitologias) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-500" />
            Cartões de Mitologia
            </h3>
            <button
            onClick={openNewMyth}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-blue-900/20"
            >
            <Plus className="w-4 h-4" />
            Novo Cartão
            </button>
        </div>

        {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>
        ) : (
            <div className="grid grid-cols-3 gap-4">
                {myths.map((myth) => (
                    <div key={myth.id} className="relative bg-slate-950 rounded-xl overflow-hidden group border border-slate-800 hover:border-blue-500/50 transition-all">
                        <div className="aspect-[4/5] relative">
                            <img src={myth.image_url} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
                                <h4 className="font-bold text-white text-lg">{myth.name}</h4>
                                <p className="text-xs text-slate-400">{myth.description}</p>
                            </div>
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditingMyth(myth) || setIsModalOpen(true)} className="p-1 bg-slate-800 rounded hover:bg-white text-white hover:text-black"><Edit2 className="w-4 h-4"/></button>
                                <button onClick={() => handleDeleteMyth(myth.id)} className="p-1 bg-slate-800 rounded hover:bg-red-500 text-red-500 hover:text-white"><Trash2 className="w-4 h-4"/></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Modal de Edição de Mitologia */}
      {isModalOpen && editingMyth && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingMyth.id ? 'Editar Cartão' : 'Novo Cartão'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveMyth} className="space-y-4">
               {/* Upload Imagem */}
               <div className="flex gap-4 items-start">
                   <div className="w-24 h-32 bg-slate-950 rounded border border-slate-700 overflow-hidden relative group flex-shrink-0">
                       {editingMyth.image_url ? <img src={editingMyth.image_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-slate-600"/></div>}
                       <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                           <Upload className="w-6 h-6 text-white"/>
                           <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                       </label>
                   </div>
                   <div className="flex-1 space-y-2">
                       <div>
                           <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Nome (Ex: Grega)</label>
                           <input value={editingMyth.name} onChange={e => setEditingMyth({...editingMyth, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"/>
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">URL da Imagem</label>
                           <input value={editingMyth.image_url} onChange={e => setEditingMyth({...editingMyth, image_url: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs focus:border-blue-500 outline-none"/>
                       </div>
                   </div>
               </div>

               <div>
                   <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Descrição Curta</label>
                   <textarea value={editingMyth.description} onChange={e => setEditingMyth({...editingMyth, description: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none" rows={2}/>
               </div>

               <div className="grid grid-cols-2 gap-4">
                   <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Posição Grid</label>
                        <select 
                            value={editingMyth.grid_position}
                            onChange={e => setEditingMyth({...editingMyth, grid_position: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                        >
                            <option value="default">Normal</option>
                            <option value="shifted">Deslocado (Abaixo)</option>
                            <option value="full">Largo (2 Colunas)</option>
                        </select>
                   </div>
                   <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Ordem</label>
                        <input type="number" value={editingMyth.order_index} onChange={e => setEditingMyth({...editingMyth, order_index: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"/>
                   </div>
               </div>

               <div className="flex justify-end pt-4 gap-2">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancelar</button>
                   <button type="submit" disabled={uploading} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold">{uploading ? 'Enviando...' : 'Salvar'}</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMythologyEditor;
