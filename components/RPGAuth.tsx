import React, { useState, useRef } from 'react';
import { X, Mail, Lock, User, Sparkles } from 'lucide-react';
import { registerUser, loginUser, checkUsernameExists } from '../services/authService';

interface RPGAuthProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (userData: any) => void;
    onRegisterSuccess: (userData: any) => void;
}

const RPGAuth: React.FC<RPGAuthProps> = ({ isOpen, onClose, onLoginSuccess, onRegisterSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Uncontrolled inputs refs - Elimina re-render ao digitar
    const usernameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const confirmPasswordRef = useRef<HTMLInputElement>(null);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    // Auto-fill credentials for convenience
    React.useEffect(() => {
        if (isLogin) {
             if (emailRef.current) emailRef.current.value = 'teste@teste.com';
             if (passwordRef.current) passwordRef.current.value = '123456';
        }
    }, [isLogin]);

    const handleLogin = async () => {
        const email = emailRef.current?.value || '';
        const password = passwordRef.current?.value || '';

        setError('');

        if (!email || !password) {
            setError('Por favor, preencha todos os campos');
            return;
        }

        if (!validateEmail(email)) {
            setError('Email inválido');
            return;
        }

        setLoading(true);

        try {
            const result = await loginUser(email, password);
            onLoginSuccess(result);
        } catch (error: any) {
            setError(error.message || 'Email ou senha incorretos');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        const username = usernameRef.current?.value || '';
        const email = emailRef.current?.value || '';
        const password = passwordRef.current?.value || '';
        const confirmPassword = confirmPasswordRef.current?.value || '';

        setError('');

        if (!email || !password || !confirmPassword || !username) {
            setError('Por favor, preencha todos os campos');
            return;
        }

        if (!validateEmail(email)) {
            setError('Email inválido');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        setLoading(true);

        try {
            // Verificar se username já existe
            const usernameExists = await checkUsernameExists(username);
            if (usernameExists) {
                setError('Este nome de usuário já está em uso');
                setLoading(false);
                return;
            }

            const result = await registerUser(email, password, username);
            onRegisterSuccess(result);
        } catch (error: any) {
            if (error.message?.includes('already registered')) {
                setError('Este email já está cadastrado');
            } else {
                setError(error.message || 'Erro ao criar conta');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) {
            handleLogin();
        } else {
            handleRegister();
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        // Limpar inputs
        if (emailRef.current) emailRef.current.value = '';
        if (passwordRef.current) passwordRef.current.value = '';
        if (usernameRef.current) usernameRef.current.value = '';
        if (confirmPasswordRef.current) confirmPasswordRef.current.value = '';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[250] bg-black/90 flex items-center justify-center p-4">
            <div className="relative bg-slate-900 border-2 border-purple-500/30 rounded-2xl shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="relative border-b border-purple-500/30 p-6 md:p-8 bg-slate-900/50">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/50 hover:bg-red-600/50 border border-slate-700/50 hover:border-red-500/50 transition-all group"
                    >
                        <X className="w-5 h-5 text-slate-400 group-hover:text-white" />
                    </button>

                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-4">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="text-xs uppercase tracking-widest font-bold text-purple-300">
                                {isLogin ? 'Bem-vindo de Volta' : 'Criar Conta'}
                            </span>
                        </div>
                        <h2 className="font-epic text-3xl md:text-4xl font-black gold-gradient mb-2">
                            {isLogin ? 'Login RPG' : 'Registrar-se'}
                        </h2>
                        <p className="text-slate-400 text-sm">
                            {isLogin ? 'Entre para continuar sua aventura' : 'Comece sua jornada épica'}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
                    {!isLogin && (
                        <div>
                            <label htmlFor="username" className="block text-sm font-bold text-slate-300 mb-2">
                                <User className="w-4 h-4 inline mr-2" />
                                Nome de Usuário
                            </label>
                            <input
                                ref={usernameRef}
                                id="username"
                                name="username"
                                autoComplete="username"
                                type="text"
                                placeholder="Digite seu nome de usuário"
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
                                onFocus={() => setError('')}
                            />
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-bold text-slate-300 mb-2">
                            <Mail className="w-4 h-4 inline mr-2" />
                            Email
                        </label>
                        <input
                            ref={emailRef}
                            id="email"
                            name="email"
                            autoComplete="email"
                            type="email"
                            placeholder="seu@email.com"
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
                            onFocus={() => setError('')}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-bold text-slate-300 mb-2">
                            <Lock className="w-4 h-4 inline mr-2" />
                            Senha
                        </label>
                        <input
                            ref={passwordRef}
                            id="password"
                            name="password"
                            autoComplete={isLogin ? "current-password" : "new-password"}
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
                            onFocus={() => setError('')}
                        />
                    </div>

                    {!isLogin && (
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-300 mb-2">
                                <Lock className="w-4 h-4 inline mr-2" />
                                Confirmar Senha
                            </label>
                            <input
                                ref={confirmPasswordRef}
                                id="confirmPassword"
                                name="confirmPassword"
                                autoComplete="new-password"
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
                                onFocus={() => setError('')}
                            />
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                            <p className="text-sm text-red-300 text-center">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:from-slate-700 disabled:to-slate-800 rounded-lg font-bold text-white transition-all shadow-lg shadow-purple-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Processando...
                            </span>
                        ) : (
                            isLogin ? 'Entrar' : 'Criar Conta'
                        )}
                    </button>

                    <div className="text-center pt-4 border-t border-slate-700/50">
                        <button
                            type="button"
                            onClick={toggleMode}
                            className="text-sm text-slate-400 hover:text-purple-400 transition-colors"
                        >
                            {isLogin ? (
                                <>Não tem uma conta? <span className="font-bold">Registre-se</span></>
                            ) : (
                                <>Já tem uma conta? <span className="font-bold">Faça login</span></>
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer Info */}
                <div className="border-t border-purple-500/30 p-4 bg-slate-950/50">
                    <p className="text-xs text-slate-500 text-center">
                        🔒 Seus dados estão seguros com Supabase • {isLogin ? '' : 'Após criar sua conta, você preencherá a ficha do personagem'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RPGAuth;
