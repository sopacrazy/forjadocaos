
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Save, Check, CheckCircle } from 'lucide-react';

interface CharacterSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const CharacterSheetModal: React.FC<CharacterSheetProps> = ({ isOpen, onClose }) => {
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sheetId, setSheetId] = useState<string | null>(null);

  // ... (State 'data' remains the same)
  // Estado inicial padrão
  const initialState = {
    nome: "",
    rank: "E",
    nivel: 1,
    xpAtual: 0,
    xpProximo: 100,
    atributos: { for: 10, des: 10, int: 10, vel: 10 },
    pontosAtributo: 0,
    peBase: 10,
    peLivreAtual: 0,
    peParaDistribuir: 0,
    pvAtual: 20,
    dinheiro: 0,
    historia: "",
    habilidades: Array(6).fill({ nome: "", custo: 0 }),
    observacoes: ""
  };

  const [data, setData] = useState<any>(initialState);

  // Resetar estado ao fechar
  const handleClose = () => {
      setData(initialState);
      onClose();
  };

  useEffect(() => {
    if (isOpen) {
      loadSheetData();
    } else {
      setData(initialState);
    }
  }, [isOpen]);

  const loadSheetData = async () => {
    setLoading(true);
    try {
        const { data: fieldsData } = await supabase
            .from('sheet_fields')
            .select('*')
            .order('order_index', { ascending: true });
        
        if (fieldsData) setFields(fieldsData);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: sheetData } = await supabase
                .from('player_sheets')
                .select('*')
                .eq('user_id', user.id)
                .single();
            
            if (sheetData) {
                setSheetId(sheetData.id);
                setData((prev: any) => ({
                    ...prev,
                    ...sheetData.data
                }));
            }
        }
    } catch (error) {
        console.error('Erro ao carregar ficha:', error);
    } finally {
        setLoading(false);
    }
  };

  const checkNameAvailability = async (name: string, userId: string) => {
      if (!name) return true;
      // Busca todas as fichas de outros usuários para verificar duplicidade de nome
      // Nota: Idealmente isso seria uma query filtrada no banco, mas como os dados estão em JSONB
      // e o volume inicial é baixo, filtrar no cliente é seguro e evita complexidade de índices em JSON.
      const { data: sheets } = await supabase.from('player_sheets').select('data').neq('user_id', userId);
      
      if (!sheets) return true;
      
      const normalizedName = name.trim().toLowerCase();
      const hasDuplicate = sheets.some((s: any) => s.data?.nome && s.data.nome.trim().toLowerCase() === normalizedName);
      
      return !hasDuplicate;
  };

  const handleSave = async () => {
      setSaving(true);
      try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Usuário não logado');

          // Validação de Nome Único
          if (data.nome) {
              const isAvailable = await checkNameAvailability(data.nome, user.id);
              if (!isAvailable) {
                  alert(`O nome "${data.nome}" já está sendo usado por outro lenda. Escolha um nome único!`);
                  setSaving(false);
                  return;
              }
          }

          const payload = {
              user_id: user.id,
              data: data,
              updated_at: new Date().toISOString()
          };

          let success = false;
          if (sheetId) {
              const { error } = await supabase.from('player_sheets').update(payload).eq('id', sheetId);
              if (!error) success = true;
          } else {
              const { data: newSheet, error } = await supabase.from('player_sheets').insert(payload).select().single();
              if (newSheet) {
                  setSheetId(newSheet.id);
                  success = true;
              }
          }
          
          if (success) {
              setShowSuccess(true);
              setTimeout(() => {
                setShowSuccess(false);
                handleClose();
              }, 1500);
          } else {
             throw new Error('Falha ao comunicar com o grimório.');
          }

      } catch (error: any) {
          alert('Erro ao salvar: ' + error.message);
      } finally {
          setSaving(false);
      }
  };

  const updateField = (key: string, value: any) => {
    setData((prev: any) => ({ ...prev, [key]: value }));
  };

  const updateAtributo = (attr: string, value: number) => {
    setData((prev: any) => ({
      ...prev,
      atributos: { ...prev.atributos, [attr]: value }
    }));
  };

  const updateHabilidade = (index: number, field: string, value: any) => {
    const newHabilidades = [...(data.habilidades || [])];
    newHabilidades[index] = { ...newHabilidades[index], [field]: value };
    setData((prev: any) => ({ ...prev, habilidades: newHabilidades }));
  };

  if (!isOpen) return null;

  const ranks = ["E", "D", "C", "B", "A", "S", "SS"];
  const pvMaximo = 10 + (data.atributos?.for || 0);
  const peTotal = (data.peBase || 10) + (data.peLivreAtual || 0);
  const xpPercentage = ((data.xpAtual || 0) / (data.xpProximo || 100)) * 100;

  const renderDynamicInput = (field: any) => {
      const commonClasses = "w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600";
      
      if (field.field_type === 'select') {
          return (
              <select 
                value={data[field.field_key] || ''} 
                onChange={e => updateField(field.field_key, e.target.value)}
                className={commonClasses}
              >
                  <option value="">Selecione...</option>
                  {field.options?.map((opt: string) => (
                      <option key={opt} value={opt} className="bg-slate-900">{opt}</option>
                  ))}
              </select>
          );
      }
      
      if (field.field_type === 'textarea') {
         return (
             <textarea
                value={data[field.field_key] || ''}
                onChange={e => updateField(field.field_key, e.target.value)}
                className={commonClasses}
                rows={4}
             />
         );
      }

      return (
          <input
            type={field.field_type === 'number' ? 'number' : 'text'}
            value={data[field.field_key] || ''}
            onChange={e => updateField(field.field_key, e.target.value)}
            className={commonClasses}
            placeholder={field.label}
          />
      );
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose}></div>

      {showSuccess && (
        <div className="absolute inset-0 z-[210] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-slate-900 border-2 border-green-500 rounded-2xl p-8 flex flex-col items-center shadow-[0_0_50px_rgba(34,197,94,0.3)] transform scale-100 animate-in zoom-in-95 duration-200">
               <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-4 border border-green-500/30">
                   <CheckCircle className="w-10 h-10 text-green-500" />
               </div>
               <h3 className="text-2xl font-bold text-white mb-2">Ficha Atualizada!</h3>
               <p className="text-slate-400">Seus dados foram salvos no grimório.</p>
           </div>
        </div>
      )}

      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-2xl border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20">
        
        <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-purple-500/50 rounded-tl-2xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-yellow-500/50 rounded-br-2xl"></div>

        <button onClick={handleClose} className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/80 hover:bg-red-600/80 border border-slate-700 hover:border-red-500 transition-all duration-300 group">
          <svg className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {loading ? (
            <div className="h-96 flex flex-col items-center justify-center text-purple-400">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p>Carregando grimório...</p>
            </div>
        ) : (
            <div className="relative p-8">
            
            <div className="flex flex-col items-center mb-8">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-2">
                    <span className="text-2xl">📜</span>
                    <span className="text-sm uppercase tracking-widest font-bold text-purple-300">Ficha de Personagem</span>
                </div>
                <h2 className="font-epic text-4xl font-black gold-gradient">Informação Completa</h2>
            </div>

            {/* Campos Dinâmicos (Info Básica & Outros) */}
            <div className="bg-slate-800/50 rounded-xl p-6 mb-6 border border-slate-700/50">
                <h3 className="text-lg font-bold text-slate-400 mb-4 px-2 border-l-4 border-slate-500">DADOS PESSOAIS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fields.filter(f => f.section === 'info').map((field) => (
                    <div key={field.id} className={field.field_type === 'textarea' ? 'col-span-full' : ''}>
                        <label className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2 block">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {renderDynamicInput(field)}
                    </div>
                ))}
                </div>
            </div>

            {/* Progressão (Mantido Fixo pois é sistema) */}
            <div className="bg-slate-800/50 rounded-xl p-6 mb-6 border border-slate-700/50">
                <h3 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
                <span>🏅</span> PROGRESSÃO
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                    <label className="text-sm font-bold text-slate-300 mb-2 block">Rank</label>
                    <select
                    value={data.rank}
                    onChange={(e) => updateField('rank', e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-yellow-500 font-bold focus:outline-none focus:border-yellow-500 transition-colors"
                    >
                    {ranks.map(rank => (
                        <option key={rank} value={rank} className="bg-slate-900 text-yellow-500">{rank}</option>
                    ))}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-bold text-slate-300 mb-2 block">Nível</label>
                    <input type="number" value={data.nivel} onChange={(e) => updateField('nivel', parseInt(e.target.value))} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-purple-400 font-bold text-center focus:outline-none focus:border-purple-500 transition-colors" />
                </div>
                <div>
                    <label className="text-sm font-bold text-slate-300 mb-2 block">XP Atual</label>
                    <input type="number" value={data.xpAtual} onChange={(e) => updateField('xpAtual', parseInt(e.target.value))} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-cyan-400 font-bold text-center focus:outline-none focus:border-cyan-500 transition-colors" />
                </div>
                <div>
                    <label className="text-sm font-bold text-slate-300 mb-2 block">XP Próximo</label>
                    <input type="number" value={data.xpProximo} onChange={(e) => updateField('xpProximo', parseInt(e.target.value))} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-400 font-bold text-center focus:outline-none focus:border-purple-500 transition-colors" />
                </div>
                </div>
                {/* XP Bar */}
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700 relative">
                     <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500" style={{ width: `${Math.min(xpPercentage, 100)}%` }}></div>
                </div>
                <div className="text-right text-xs text-cyan-400 font-bold mt-1">{xpPercentage.toFixed(1)}%</div>
            </div>

            {/* Atributos */}
            <div className="bg-slate-800/50 rounded-xl p-6 mb-6 border border-slate-700/50">
                <h3 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2"><span>📊</span> ATRIBUTOS</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[
                    { key: 'for', label: '💪 Força', color: 'red' },
                    { key: 'des', label: '🎯 Destreza', color: 'blue' },
                    { key: 'int', label: '🧠 Inteligência', color: 'purple' },
                    { key: 'vel', label: '⚡ Velocidade', color: 'yellow' }
                ].map((attr) => (
                    <div key={attr.key}>
                    <label className="text-sm font-bold text-slate-300 mb-2 block">{attr.label}</label>
                    <input
                        type="number"
                        value={data.atributos?.[attr.key] || 0}
                        onChange={(e) => updateAtributo(attr.key, parseInt(e.target.value))}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white font-bold text-center focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    </div>
                ))}
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 flex justify-between items-center">
                    <span className="text-sm font-bold text-purple-300">PONTOS DE ATRIBUTO PARA DISTRIBUIR</span>
                    <input
                        type="number"
                        value={data.pontosAtributo}
                        onChange={(e) => updateField('pontosAtributo', parseInt(e.target.value))}
                        className="w-24 bg-slate-900/50 border border-purple-500/50 rounded-lg px-2 py-2 text-purple-400 font-bold text-center focus:outline-none focus:border-purple-500 transition-colors"
                    />
                </div>
            </div>

            {/* Energia & Vida */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-lg font-bold text-purple-300 mb-4">⚡ ENERGIA (PE)</h3>
                    <div className="flex gap-4 items-center mb-4">
                         <div className="flex-1">
                             <label className="text-xs text-slate-400 block mb-1">Base</label>
                             <input type="number" readOnly value={data.peBase} className="w-full bg-slate-900/30 border border-slate-700 rounded p-2 text-center text-slate-400 font-bold"/>
                         </div>
                         <div className="flex-1">
                             <label className="text-xs text-slate-400 block mb-1">Livre</label>
                             <input type="number" value={data.peLivreAtual} onChange={e => updateField('peLivreAtual', parseInt(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-center text-blue-400 font-bold"/>
                         </div>
                         <div className="flex-1">
                             <label className="text-xs text-slate-400 block mb-1">Total</label>
                             <div className="w-full bg-purple-500/20 border border-purple-500 rounded p-2 text-center text-purple-300 font-bold">{peTotal}</div>
                         </div>
                    </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-lg font-bold text-red-400 mb-4">❤️ VIDA (PV)</h3>
                    <div className="flex gap-4 items-center">
                         <div className="flex-1">
                             <label className="text-xs text-slate-400 block mb-1">PV Atual</label>
                             <input type="number" value={data.pvAtual} onChange={e => updateField('pvAtual', parseInt(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-center text-white font-bold text-xl"/>
                         </div>
                         <div className="text-slate-500 text-2xl">/</div>
                         <div className="flex-1">
                             <label className="text-xs text-slate-400 block mb-1">PV Máximo</label>
                             <div className="w-full bg-red-500/20 border border-red-500/50 rounded p-2 text-center text-red-300 font-bold text-xl">{pvMaximo}</div>
                         </div>
                    </div>
                    {/* Bar */}
                    <div className="mt-4 h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${Math.min((data.pvAtual / pvMaximo) * 100, 100)}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Habilidades e Dinheiro (Fixos no sistema por enquanto) */}
            <div className="bg-slate-800/50 rounded-xl p-6 mb-6 border border-slate-700/50">
                 <h3 className="text-lg font-bold text-purple-300 mb-4">⚔️ HABILIDADES & RECURSOS</h3>
                 <div className="mb-4">
                     <label className="text-sm font-bold text-yellow-500">Dinheiro</label>
                     <input type="number" value={data.dinheiro} onChange={e => updateField('dinheiro', parseInt(e.target.value))} className="w-full bg-slate-900/50 border border-yellow-500/30 rounded px-4 py-2 text-yellow-300 font-bold"/>
                 </div>
                 <div className="space-y-2">
                     {data.habilidades?.map((hab: any, idx: number) => (
                         <div key={idx} className="flex gap-2">
                             <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-500 shrink-0 mt-2">{idx+1}</span>
                             <input type="text" placeholder="Nome da Habilidade" value={hab.nome} onChange={e => updateHabilidade(idx, 'nome', e.target.value)} className="flex-1 bg-slate-900/50 border border-slate-700 rounded px-3 py-2 text-sm text-white"/>
                             <input type="number" placeholder="Custo" value={hab.custo} onChange={e => updateHabilidade(idx, 'custo', parseInt(e.target.value))} className="w-20 bg-slate-900/50 border border-slate-700 rounded px-2 py-2 text-sm text-cyan-400 text-center"/>
                         </div>
                     ))}
                 </div>
            </div>

            {/* História e Obs (Campos texto) */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-8">
                 <h3 className="text-lg font-bold text-slate-400 mb-4">TEXTOS ADICIONAIS</h3>
                 <div className="space-y-4">
                     <div>
                         <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">História</label>
                         <textarea rows={5} value={data.historia} onChange={e => updateField('historia', e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded p-3 text-slate-300 text-sm"/>
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Observações</label>
                         <textarea rows={3} value={data.observacoes} onChange={e => updateField('observacoes', e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded p-3 text-slate-300 text-sm"/>
                     </div>
                 </div>
            </div>

            {/* <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg hover:shadow-green-500/20 transition-all disabled:opacity-50 text-lg uppercase tracking-wider"
            >
                {saving ? <Loader2 className="animate-spin w-6 h-6"/> : <Save className="w-6 h-6"/>}
                SALVAR GRIMÓRIO
            </button> */}
            
            <button 
                disabled={true}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-slate-700 text-slate-400 cursor-not-allowed font-bold rounded-xl shadow-lg transition-all text-lg uppercase tracking-wider opacity-70"
            >
                <Save className="w-6 h-6"/>
                Salvar (Modo Visualização)
            </button>
            <p className="text-center text-yellow-500 mt-4 text-sm font-bold bg-yellow-500/10 border border-yellow-500/30 p-2 rounded-lg">
                ⚠️ O sistema de fichas está em modo de demonstração. Entre no grupo do WhatsApp para criar seu personagem oficial.
            </p>
            
            </div>
        )}
      </div>
    </div>
  );
};

export default CharacterSheetModal;
