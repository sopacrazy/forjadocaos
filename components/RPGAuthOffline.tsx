import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles } from 'lucide-react';

interface RPGAuthProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (userData: any) => void;
    onRegisterSuccess: (userData: any) => void;
}

const getRandomColor = () => {
    const colors = [
        '#8B5CF6', '#EC4899', '#10B981', '#F59E0B',
        '#3B82F6', '#EF4444', '#14B8A6', '#F97316'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

const RPGAuthOffline: React.FC<RPGAuthProps> = ({ isOpen, onClose, onLoginSuccess, onRegisterSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        username: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleLogin = async () => {
        setError('');

        if (!formData.email || !formData.password) {
            setError('Por favor, preencha todos os campos');
            return;
        }

        if (!validateEmail(formData.email)) {
            setError('Email inválido');
            return;
        }

        setLoading(true);

        // Simular delay de rede
        setTimeout(() => {
            try {
                const users = JSON.parse(localStorage.getItem('rpg_users') || '[]');
                const user = users.find((u: any) => u.email === formData.email && u.password === formData.password);

                if (user) {
                    console.log('Login bem-sucedido:', user);
                    onLoginSuccess(user);
                } else {
                    setError('Email ou senha incorretos');
                    setLoading(false);
                }
            } catch (error) {
                setError('Erro ao fazer login');
                setLoading(false);
            }
        }, 500);
    };

    const handleRegister = async () => {
        setError('');

        if (!formData.email || !formData.password || !formData.confirmPassword || !formData.username) {
            setError('Por favor, preencha todos os campos');
            return;
        }

        if (!validateEmail(formData.email)) {
            setError('Email inválido');
            return;
        }

        if (formData.password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        setLoading(true);

        // Simular delay de rede
        setTimeout(() => {
            try {
                const users = JSON.parse(localStorage.getItem('rpg_users') || '[]');

                // Verificar se email já existe
                if (users.some((u: any) => u.email === formData.email)) {
                    setError('Este email já está cadastrado');
                    setLoading(false);
                    return;
                }

                // Verificar se username já existe
                if (users.some((u: any) => u.username === formData.username)) {
                    setError('Este nome de usuário já está em uso');
                    setLoading(false);
                    return;
                }

                // Criar novo usuário
                const newUser = {
                    id: Date.now().toString(),
                    email: formData.email,
                    password: formData.password,
                    username: formData.username,
                    createdAt: new Date().toISOString(),
                    hasCharacter: false,
                    character: null,
                    color: getRandomColor()
                };

                users.push(newUser);
                localStorage.setItem('rpg_users', JSON.stringify(users));

                console.log('Registro bem-sucedido:', newUser);
                onRegisterSuccess(newUser);
            } catch (error) {
                setError('Erro ao criar conta');
                setLoading(false);
            }
        }, 500);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) {
            handleLogin();
        } else {
            handleRegister();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[250] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border-2 border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/20 w-full max-w-md">
                {/* Header */}
                <div className="relative border-b border-purple-500/30 p-6 md:p-8">
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
                            <label className="block text-sm font-bold text-slate-300 mb-2">
                                <User className="w-4 h-4 inline mr-2" />
                                Nome de Usuário
                            </label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => handleInputChange('username', e.target.value)}
                                placeholder="Digite seu nome de usuário"
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">
                            <Mail className="w-4 h-4 inline mr-2" />
                            Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="seu@email.com"
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">
                            <Lock className="w-4 h-4 inline mr-2" />
                            Senha
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
                        />
                    </div>

                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">
                                <Lock className="w-4 h-4 inline mr-2" />
                                Confirmar Senha
                            </label>
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
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
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                                setFormData({ email: '', password: '', confirmPassword: '', username: '' });
                            }}
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
                        🔒 Versão Offline (localStorage) • {isLogin ? '' : 'Após criar sua conta, você preencherá a ficha do personagem'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RPGAuthOffline;
