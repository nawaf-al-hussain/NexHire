import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCircle, Lock, Sparkles, Loader2, AlertCircle } from 'lucide-react';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoggingIn(true);

        try {
            const user = await login(username, password);
            // Redirect based on RoleID
            if (user.RoleID === 1) navigate('/admin');
            else if (user.RoleID === 2) navigate('/recruiter');
            else if (user.RoleID === 3) navigate('/candidate');
            else navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] font-sans selection:bg-indigo-600/30 overflow-hidden relative transition-colors duration-500">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-600/10 via-[var(--bg-primary)] to-[var(--bg-primary)]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[120px] -z-10 animate-pulse"></div>

            <div className="relative w-full max-w-md p-10 space-y-8 animate-in fade-in zoom-in duration-700">
                <div className="glass-card p-10 rounded-[3rem]">
                    <div className="text-center space-y-3 mb-10">
                        <h1 className="text-5xl font-black tracking-tighter">
                            Nex<span className="text-indigo-600">Hire</span>
                        </h1>
                        <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.3em] opacity-60">
                            The Next Evolution in Hiring
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold animate-in slide-in-from-top-2">
                                <AlertCircle size={18} /> {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest ml-4">Username</label>
                            <div className="relative group">
                                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-600 transition-colors" size={20} />
                                <input
                                    type="text"
                                    required
                                    placeholder="jdoe_admin"
                                    className="w-full pl-12 pr-4 py-4 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600 transition-all font-bold text-sm"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest ml-4">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-600 transition-colors" size={20} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-4 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600 transition-all font-bold text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoggingIn ? (
                                <><Loader2 size={16} className="animate-spin" /> Authenticating...</>
                            ) : (
                                'Initiate Session'
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-[var(--border-primary)] text-center">
                        <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest opacity-60">
                            Platform Architect <span className="text-indigo-600">Nawaf Al Hussain Khondokar</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
