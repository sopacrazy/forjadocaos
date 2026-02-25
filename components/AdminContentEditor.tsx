
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface ContentData {
  title: string;
  subtitle: string;
  content: string;
}

interface AdminContentEditorProps {
  section: string;
  label: string;
}

const AdminContentEditor: React.FC<AdminContentEditorProps> = ({ section, label }) => {
  const [data, setData] = useState<ContentData>({
    title: '',
    subtitle: '',
    content: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadContent();
  }, [section]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const { data: content, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('section', section)
        .single();
      
      if (content) {
        setData({
          title: content.title || '',
          subtitle: content.subtitle || '',
          content: content.content || ''
        });
      }
    } catch (err) {
      console.error('Erro ao carregar:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({
          section,
          title: data.title,
          subtitle: data.subtitle,
          content: data.content,
          updated_at: new Date()
        }, { onConflict: 'section' });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Conteúdo salvo com sucesso!' });
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      setMessage({ type: 'error', text: 'Erro ao salvar: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-purple-500" /></div>;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          {label}
          <span className="text-xs text-slate-500 font-normal px-2 py-1 bg-slate-800 rounded-full border border-slate-700">
            {section}
          </span>
        </h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Alterações
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-400 mb-2">Título da Seção</label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none"
            placeholder="Ex: A Crônica do Despertar"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-400 mb-2">Subtítulo / Citação em Destaque</label>
          <textarea
            value={data.subtitle}
            onChange={(e) => setData({ ...data, subtitle: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none h-20"
            placeholder="Texto que aparece em destaque e fundo amarelo..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-400 mb-2">
            Conteúdo Principal
            <span className="text-xs font-normal text-slate-500 ml-2">(Aceita HTML básico)</span>
          </label>
          <textarea
            value={data.content}
            onChange={(e) => setData({ ...data, content: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none h-64 font-mono text-sm leading-relaxed"
            placeholder="Escreva o conteúdo aqui..."
          />
        </div>
      </div>

      {message && (
        <div className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}
    </div>
  );
};

export default AdminContentEditor;
