
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Users, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onClose: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isLogin) {
        // --- LOGIN ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Verificar se é ADMINISTRADOR
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (profile?.role === 'admin') {
            onLoginSuccess();
          } else {
            await supabase.auth.signOut();
            setError('Acesso negado. Esta área é restrita a administradores.');
          }
        }
      } else {
        // --- CADASTRO (SIGN UP) ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          setSuccessMessage('Conta criada com sucesso! Peça ao Mestre para liberar seu acesso.');
          setIsLogin(true); // Voltar para login
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Erro ao autenticar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
      >
        ✕
      </button>

      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500"></div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 shadow-lg">
              <Lock className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center text-white mb-2 font-epic">
            {isLogin ? 'Acesso Restrito' : 'Solicitar Acesso'}
          </h2>
          <p className="text-slate-400 text-center mb-6 text-sm">
            {isLogin 
              ? 'Área exclusiva para administradores da Forja.' 
              : 'Crie sua conta para solicitar permissão de admin.'}
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  placeholder="admin@forjadocaos.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Senha
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm animate-shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Entrar no Sistema' : 'Criar Conta'}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center space-y-2">
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccessMessage(null);
              }}
              className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              {isLogin ? 'Não tem acesso? Crie uma conta' : 'Já tem conta? Faça login'}
            </button>
            
            {isLogin && (
              <div>
                <a href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                  Esqueceu a senha?
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
