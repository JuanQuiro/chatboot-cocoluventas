import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();

    // Redirigir al dashboard si ya está autenticado
    useEffect(() => {
        if (isAuthenticated) {
            window.location.href = '/dashboard';
        }
    }, [isAuthenticated]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            // Redirigir al dashboard HTML estático (no React Router)
            window.location.href = '/dashboard';
        } else {
            setError(result.error || 'Error al iniciar sesión');
        }

        setLoading(false);
    };

    const quickLogin = (demoEmail) => {
        setEmail(demoEmail);
        setPassword('demo123');
    };

    return (
        <div className="min-h-screen w-full flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Left Side - Branding & Features */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-90"></div>
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 80%, rgba(239, 68, 68, 0.3), transparent 50%)',
                }}></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
                    {/* Logo & Title */}
                    <div className="mb-12">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                                <span className="text-4xl">🤖</span>
                            </div>
                            <div>
                                <h1 className="text-4xl xl:text-5xl font-bold tracking-tight">
                                    Cocolu Ventas
                                </h1>
                                <p className="text-blue-100 text-lg">Sistema Empresarial de Gestión</p>
                            </div>
                        </div>
                        <div className="h-1 w-24 bg-gradient-to-r from-white to-transparent rounded-full"></div>
                    </div>

                    {/* Features */}
                    <div className="space-y-8 mb-12">
                        <div className="flex items-start gap-4 group">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                                <span className="text-2xl">💬</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-1">Bots Inteligentes</h3>
                                <p className="text-blue-100">Automatiza conversaciones con múltiples providers de WhatsApp</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 group">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                                <span className="text-2xl">📊</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-1">CRM Completo</h3>
                                <p className="text-blue-100">Gestiona clientes, productos, órdenes y vendedores en un solo lugar</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 group">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                                <span className="text-2xl">📈</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-1">Analytics en Tiempo Real</h3>
                                <p className="text-blue-100">Métricas, reportes y BI para decisiones informadas</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 group">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                                <span className="text-2xl">🔒</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-1">Seguridad Enterprise</h3>
                                <p className="text-blue-100">Multi-tenant, roles, permisos y compliance total</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
                        <div>
                            <div className="text-3xl font-bold mb-1">99.9%</div>
                            <div className="text-sm text-blue-100">Uptime</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold mb-1">24/7</div>
                            <div className="text-sm text-blue-100">Soporte</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold mb-1">5+</div>
                            <div className="text-sm text-blue-100">Providers</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8 lg:p-12">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-2xl">
                            <span className="text-white text-3xl">🤖</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Cocolu Ventas
                        </h1>
                        <p className="text-gray-300">
                            Sistema de Gestión Empresarial
                        </p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-200">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Bienvenido 👋
                            </h2>
                            <p className="text-gray-600">
                                Ingresa tus credenciales para continuar
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-start gap-3">
                                    <span className="text-xl">⚠️</span>
                                    <div className="flex-1">
                                        <p className="font-semibold">Error de autenticación</p>
                                        <p className="text-sm">{error}</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    📧 Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                                    placeholder="tu@empresa.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    🔐 Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                                        placeholder="••••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Iniciando sesión...
                                    </>
                                ) : (
                                    <>
                                        Iniciar Sesión
                                        <span>→</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Demo credentials */}
                        <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
                            <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span>🔑</span>
                                Acceso Rápido - Credenciales Demo:
                            </p>
                            <div className="space-y-2">
                                <button
                                    type="button"
                                    onClick={() => quickLogin('admin@cocolu.com')}
                                    className="w-full text-left px-4 py-2.5 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-semibold text-gray-800">👤 Admin</div>
                                            <div className="text-xs text-gray-600 font-mono">admin@cocolu.com</div>
                                        </div>
                                        <span className="text-gray-400 group-hover:text-blue-600">→</span>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => quickLogin('seller@cocolu.com')}
                                    className="w-full text-left px-4 py-2.5 bg-white rounded-lg border border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-semibold text-gray-800">💼 Vendedor</div>
                                            <div className="text-xs text-gray-600 font-mono">seller@cocolu.com</div>
                                        </div>
                                        <span className="text-gray-400 group-hover:text-purple-600">→</span>
                                    </div>
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-3 text-center">
                                💡 Cualquier contraseña funciona en modo desarrollo
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center text-sm text-gray-400">
                        <p className="mb-1">© 2025 Cocolu Ventas - Todos los derechos reservados</p>
                        <p className="flex items-center justify-center gap-2">
                            <span>⚡</span>
                            Powered by <span className="font-semibold text-purple-400">Ember Drago</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
