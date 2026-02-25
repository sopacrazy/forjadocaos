import React, { useState } from 'react';
import { LogOut, LayoutDashboard, Users, FileText, Settings, Edit3, BookOpen, Trophy, Scale, TrendingUp, Wand2, Coins, Globe, Menu, X } from 'lucide-react';
import AdminContentEditor from './AdminContentEditor';
import AdminRankEditor from './AdminRankEditor';
import AdminProgressionEditor from './AdminProgressionEditor';
import AdminSkillEditor from './AdminSkillEditor';
import AdminEconomyEditor from './AdminEconomyEditor';
import AdminCharacterEditor from './AdminCharacterEditor';
import AdminMythologyEditor from './AdminMythologyEditor';
import AdminSheetFieldsEditor from './AdminSheetFieldsEditor';
import AdminPlayersList from './AdminPlayersList';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [contentTab, setContentTab] = useState('lore');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  }

  return (
    <div className="fixed inset-0 z-[150] bg-slate-950 text-white flex flex-col md:flex-row overflow-hidden">
      
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 z-50 shrink-0">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-bold text-white text-sm">
                A
            </div>
            <span className="font-epic font-bold text-lg">Admin Forja</span>
        </div>
        <button 
           onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
           className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
           {isMobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
        </button>
      </div>

      {/* Overlay Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl md:shadow-none
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:static md:h-full
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3 hidden md:flex shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-bold text-white">
            A
          </div>
          <span className="font-epic font-bold text-lg">Admin Forja</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <button 
            onClick={() => handleNavClick('dashboard')}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-purple-600/10 text-purple-400 font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            Dashboard
          </button>
          
          <button 
            onClick={() => handleNavClick('content')}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${activeTab === 'content' ? 'bg-purple-600/10 text-purple-400 font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Edit3 className="w-5 h-5 flex-shrink-0" />
            Editor de Site
          </button>

          <button 
            onClick={() => handleNavClick('players')}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${activeTab === 'players' ? 'bg-purple-600/10 text-purple-400 font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Users className="w-5 h-5 flex-shrink-0" />
            Jogadores
          </button>
          
          <button 
            onClick={() => handleNavClick('sheets')}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${activeTab === 'sheets' ? 'bg-purple-600/10 text-purple-400 font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <FileText className="w-5 h-5 flex-shrink-0" />
            Fichas
          </button>
          
          <button 
            onClick={() => handleNavClick('settings')}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-purple-600/10 text-purple-400 font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            Configurações
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 mt-auto shrink-0">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-950 p-4 md:p-8 w-full">
        <header className="flex justify-between items-center mb-4 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-epic text-white mb-2">Painel de Controle</h1>
            <p className="text-slate-400">Bem-vindo de volta, Mestre.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700"></div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-400 font-medium">Total de Jogadores</h3>
                  <Users className="text-purple-500 w-5 h-5" />
                </div>
                <div className="text-3xl font-bold text-white">12</div>
                <div className="text-green-500 text-sm mt-2 flex items-center gap-1">
                  <span>+2</span>
                  <span className="text-slate-500">essa semana</span>
                </div>
              </div>
              
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-400 font-medium">Fichas Criadas</h3>
                  <FileText className="text-blue-500 w-5 h-5" />
                </div>
                <div className="text-3xl font-bold text-white">8</div>
                <div className="text-slate-500 text-sm mt-2">
                  Ativas no sistema
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-400 font-medium">Status do Sistema</h3>
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_theme(colors.green.500)]"></div>
                </div>
                <div className="text-xl font-bold text-green-400">Operacional</div>
                <div className="text-slate-500 text-sm mt-2">
                  Supabase conectado
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-slate-800">
                <h3 className="font-bold text-white">Atividade Recente</h3>
              </div>
              <div className="p-6 text-center text-slate-500 py-12">
                Nenhuma atividade registrada ainda.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold font-epic text-white">Editor de Conteúdo do Site</h2>
            
            {/* Navegação de Abas do Editor (Responsiva) */}
            <div className="flex items-center gap-1 border-b border-slate-800 pb-1 mb-6 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900/50 pb-2">
              {[
                  { id: 'lore', label: 'Lore', icon: BookOpen, color: 'text-purple-400' },
                  { id: 'ranks', label: 'Ranks', icon: Trophy, color: 'text-green-400' },
                  { id: 'rules', label: 'Regras', icon: Scale, color: 'text-yellow-400' },
                  { id: 'progression', label: 'Progressão', icon: TrendingUp, color: 'text-blue-400' },
                  { id: 'skills', label: 'Grimório', icon: Wand2, color: 'text-purple-400' },
                  { id: 'economy', label: 'Eco', icon: Coins, color: 'text-yellow-500' },
                  { id: 'characters', label: 'Lendas', icon: Users, color: 'text-pink-500' },
                  { id: 'myths', label: 'Mitos', icon: Globe, color: 'text-blue-400' },
              ].map((tab) => {
                  const isActive = contentTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                        key={tab.id}
                        onClick={() => setContentTab(tab.id)}
                        className={`
                            flex items-center gap-2 px-4 md:px-6 py-3 rounded-t-lg font-medium transition-colors relative top-[1px] shrink-0
                            ${isActive 
                                ? `bg-slate-900 ${tab.color} border border-slate-800 border-b-slate-900` 
                                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                            }
                        `}
                    >
                        <Icon className="w-4 h-4 shrink-0" />
                        {tab.label}
                    </button>
                  );
              })}
            </div>

            {/* Conteúdo das Abas */}
            <div className="bg-slate-900/50 rounded-xl">
              {contentTab === 'lore' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div>
                    <h3 className="text-lg font-bold text-slate-400 mb-4 px-2 border-l-4 border-purple-500">História (Lore)</h3>
                    <AdminContentEditor 
                      section="lore" 
                      label="Texto Principal" 
                    />
                  </div>
                </div>
              )}

              {contentTab === 'ranks' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div>
                    <h3 className="text-lg font-bold text-slate-400 mb-4 px-2 border-l-4 border-green-500">Sistema de Ranks</h3>
                    <AdminRankEditor />
                  </div>
                </div>
              )}

              {contentTab === 'rules' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <h3 className="text-lg font-bold text-slate-400 mb-4 px-2 border-l-4 border-yellow-500">Tratado do Equilíbrio (Regras)</h3>
                  <div className="space-y-6">
                    <AdminContentEditor 
                      section="rules_intro" 
                      label="Cabeçalho (Título/Citação)" 
                    />
                    <AdminContentEditor 
                      section="rules_journey" 
                      label="Regras: Início da Jornada" 
                    />
                    <AdminContentEditor 
                      section="rules_update" 
                      label="Regras: Atualização & Níveis" 
                    />
                  </div>
                </div>
              )}

              {contentTab === 'progression' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                   <div>
                    <h3 className="text-lg font-bold text-slate-400 mb-4 px-2 border-l-4 border-blue-500">Tabela de Limites de Atributos</h3>
                    <AdminProgressionEditor />
                   </div>
                </div>
              )}

              {contentTab === 'skills' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                   <div>
                    <h3 className="text-lg font-bold text-slate-400 mb-4 px-2 border-l-4 border-purple-500">Grimório de Habilidades</h3>
                    <AdminSkillEditor />
                   </div>
                </div>
              )}

              {contentTab === 'economy' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                   <div>
                    <h3 className="text-lg font-bold text-slate-400 mb-4 px-2 border-l-4 border-yellow-500">Tabela de Economia & Recompensas</h3>
                    <AdminEconomyEditor />
                   </div>
                </div>
              )}

              {contentTab === 'characters' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                   <div>
                    <h3 className="text-lg font-bold text-slate-400 mb-4 px-2 border-l-4 border-pink-500">Lendas Vivas (Personagens)</h3>
                    <AdminCharacterEditor />
                   </div>
                </div>
              )}

              {contentTab === 'myths' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                   <div>
                    <h3 className="text-lg font-bold text-slate-400 mb-4 px-2 border-l-4 border-blue-500">Mitos e História</h3>
                    <AdminMythologyEditor />
                   </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'players' && (
           <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold font-epic text-white mb-6">Jogadores Cadastrados</h2>
              <AdminPlayersList />
           </div>
        )}

        {activeTab === 'sheets' && (
           <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold font-epic text-white mb-6">Estrutura da Ficha</h2>
              <AdminSheetFieldsEditor />
           </div>
        )}

        {activeTab === 'settings' && (
           <div className="flex items-center justify-center h-64 border-2 border-dashed border-slate-800 rounded-xl text-slate-500">
            Configurações (Em breve)
          </div>
        )}
      </main>
    </div>
  );
};


export default AdminDashboard;
