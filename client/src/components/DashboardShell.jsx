import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    LayoutDashboard, Database, LogOut, User,
    ChevronRight, Sparkles, Bell, Sun, Moon, MessageCircle, X
} from 'lucide-react';

const DashboardShell = ({ children, title, subtitle, navigation = [] }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [chatbotOpen, setChatbotOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className={`flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-indigo-500/30 overflow-hidden font-sans transition-colors duration-300`}>
            {/* Premium Sidebar */}
            <aside className="w-80 bg-[var(--sidebar-bg)] border-r border-[var(--border-primary)] p-8 flex flex-col relative z-50">
                <div className="flex items-center gap-4 mb-12 px-2">
                    <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/20">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-black text-2xl tracking-tighter uppercase relative">
                        NexHire
                        <span className="absolute -top-1 -right-4 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                    </span>
                </div>

                <nav className="space-y-2 flex-1">
                    <div className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-[0.3em] mb-4 ml-4">Main Menu</div>
                    {navigation.map((item, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                if (item.onClick) item.onClick();
                                if (item.path) navigate(item.path);
                            }}
                            className={`flex items-center justify-between w-full p-4 rounded-2xl transition-all group ${item.active ? 'bg-indigo-500/10 text-indigo-500 font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-accent)]'}`}
                        >
                            <div className="flex items-center gap-4">
                                <item.icon className={`w-5 h-5 ${item.active ? 'text-indigo-500' : 'group-hover:text-indigo-500 transition-colors'}`} />
                                <span className="text-sm tracking-tight">{item.label}</span>
                            </div>
                            {item.active && <ChevronRight size={14} className="text-indigo-500" />}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto space-y-6">
                    <div className="p-6 rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-accent)]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center">
                                <User size={20} className="text-indigo-500" />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs font-black truncate max-w-[120px]">{user?.Username}</div>
                                <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">
                                    {user?.RoleID === 1 ? 'Administrator' : user?.RoleID === 2 ? 'Recruiter' : 'Candidate'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative">
                {/* Header / Top Bar */}
                <header className="h-24 border-b border-[var(--border-primary)] flex items-center justify-between px-12 bg-[var(--header-bg)] backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
                    <div>
                        {subtitle && <div className="text-indigo-500 font-bold text-[10px] uppercase tracking-[.4em] mb-1">{subtitle}</div>}
                        <h1 className="text-2xl font-black tracking-tight">{title}</h1>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Theme Switcher */}
                        <button
                            onClick={toggleTheme}
                            className="w-10 h-10 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        <button className="relative w-10 h-10 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">
                            <Bell size={18} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[var(--header-bg)]"></span>
                        </button>
                        <div className="h-8 w-[1px] bg-[var(--border-primary)]"></div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-xs font-black uppercase tracking-tighter truncate max-w-[120px]">{user?.Username}</div>
                                <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">
                                    {user?.RoleID === 1 ? 'Administrator' : user?.RoleID === 2 ? 'Recruiter' : 'Candidate'}
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-600/20">
                                {user?.Username?.charAt(0).toUpperCase()}
                            </div>
                        </div>

                        <div className="h-8 w-[1px] bg-[var(--border-primary)]"></div>

                        <button
                            onClick={handleLogout}
                            className="w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 flex items-center justify-center transition-all group/logout relative"
                            title="Terminate Session"
                        >
                            <LogOut size={18} />
                            <span className="absolute -top-10 scale-0 group-hover:logout:scale-100 transition-all bg-red-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg pointer-events-none">
                                Logout
                            </span>
                        </button>
                    </div>
                </header>

                {/* Content Container */}
                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-[var(--bg-secondary)] transition-colors duration-300">
                    {children}
                </div>
            </main>

            {/* Floating Chatbot Button */}
            <button
                onClick={() => setChatbotOpen(true)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-500/30 hover:scale-110 transition-all z-[100] animate-bounce"
            >
                <MessageCircle size={28} className="text-white" />
            </button>

            {/* Chatbot Modal */}
            {chatbotOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-end justify-end p-8">
                    <div className="w-[400px] h-[500px] glass-card rounded-[2rem] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
                        {/* Chat Header */}
                        <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <MessageCircle size={20} className="text-white" />
                                </div>
                                <div>
                                    <div className="text-white font-black text-sm">NexHire Assistant</div>
                                    <div className="text-white/70 text-[10px] font-bold uppercase">AI-Powered Help</div>
                                </div>
                            </div>
                            <button onClick={() => setChatbotOpen(false)} className="text-white/80 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        {/* Chat Messages */}
                        <div className="flex-1 p-6 overflow-y-auto space-y-4">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-indigo-500 rounded-full flex-shrink-0 flex items-center justify-center">
                                    <MessageCircle size={14} className="text-white" />
                                </div>
                                <div className="bg-[var(--bg-accent)] p-4 rounded-2xl rounded-tl-none text-xs font-medium">
                                    Hi! I'm your NexHire assistant. How can I help you today?
                                </div>
                            </div>
                            <div className="flex gap-3 flex-row-reverse">
                                <div className="bg-indigo-500 p-4 rounded-2xl rounded-tr-none text-xs font-medium text-white">
                                    I need help with job applications
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-indigo-500 rounded-full flex-shrink-0 flex items-center justify-center">
                                    <MessageCircle size={14} className="text-white" />
                                </div>
                                <div className="bg-[var(--bg-accent)] p-4 rounded-2xl rounded-tl-none text-xs font-medium">
                                    I can help with that! Here are some common topics:
                                    <ul className="mt-2 space-y-1 text-[10px]">
                                        <li>• Finding jobs</li>
                                        <li>• Application status</li>
                                        <li>• Interview preparation</li>
                                        <li>• Skill assessments</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        {/* Chat Input */}
                        <div className="p-4 border-t border-[var(--border-primary)]">
                            <input
                                type="text"
                                placeholder="Type your question..."
                                className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardShell;
