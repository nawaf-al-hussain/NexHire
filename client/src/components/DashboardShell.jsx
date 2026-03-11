import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeAnimationType, useModeAnimation } from 'react-theme-switch-animation';
import {
    LayoutDashboard, Database, LogOut, User,
    ChevronRight, Sparkles, Bell, Sun, Moon, Menu, X
} from 'lucide-react';
import ChatbotWidget from './shared/ChatbotWidget';
import nexhireLogo from '../assets/nexhire_logo.svg';

const DashboardShell = ({ children, title, subtitle, navigation = [], onNotificationClick, onProfileClick }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    // Initialize theme switch animation
    const { ref: themeButtonRef, toggleSwitchTheme, isDarkMode } = useModeAnimation({
        animationType: ThemeAnimationType.CIRCLE, //QR_SCAN BLUR_CIRCLE CIRCLE
        duration: 750,
        isDarkMode: theme === 'dark',
        onDarkModeChange: (isDark) => {
            // Sync with ThemeContext
            if ((isDark && theme !== 'dark') || (!isDark && theme !== 'light')) {
                toggleTheme();
            }
        }
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNavClick = (item) => {
        if (item.onClick) item.onClick();
        if (item.path) navigate(item.path);
        // Close sidebar on mobile after navigation
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    };

    return (
        <div className={`flex h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-indigo-500/30 font-sans transition-colors duration-300`}>
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Premium Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-80 h-screen bg-[var(--sidebar-bg)] border-r border-[var(--border-primary)] p-8 flex flex-col transform transition-transform duration-300 ease-in-out overflow-hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="flex items-center justify-between mb-12 px-2">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl overflow-hidden bg-indigo-600 shadow-lg shadow-indigo-600/20">
                            <img
                                src={nexhireLogo}
                                alt="NexHire Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <span className="font-black text-2xl tracking-tighter uppercase relative">
                            NexHire
                            <span className="absolute -top-1 -right-4 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                        </span>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden w-10 h-10 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                <nav className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-[0.3em] mb-4 ml-4">Main Menu</div>
                    {navigation.map((item, i) => (
                        <button
                            key={i}
                            onClick={() => handleNavClick(item)}
                            className={`flex items-center justify-between w-full p-4 rounded-2xl transition-all group ${item.active ? 'bg-indigo-500/10 text-indigo-500 font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-accent)]'}`}
                        >
                            <div className="flex items-center gap-4">
                                <item.icon className={`w-5 h-5 ${item.active ? 'text-indigo-500' : 'group-hover:text-indigo-500 transition-colors'}`} />
                                <span className="text-sm tracking-tight">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {item.badge && (
                                    <span className="px-2 py-0.5 bg-indigo-500 text-white text-[10px] font-black rounded-full min-w-[20px] text-center">
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                )}
                                {item.active && <ChevronRight size={14} className="text-indigo-500" />}
                            </div>
                        </button>
                    ))}
                </nav>

                {/* Sidebar Footer with User Profile and Logout */}
                <div className="mt-auto overflow-hidden">
                    <div
                        onClick={onProfileClick}
                        className="w-full p-4 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-accent)] hover:border-indigo-500/30 hover:bg-[var(--bg-primary)] dark:hover:bg-[var(--bg-primary)] transition-all cursor-pointer text-left flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] dark:bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center shrink-0">
                            <User size={20} className="text-indigo-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-black truncate max-w-[120px]">{user?.Username}</div>
                            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">
                                {user?.RoleID === 1 ? 'Administrator' : user?.RoleID === 2 ? 'Recruiter' : 'Candidate'}
                            </div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                            className="p-2 rounded-xl hover:bg-red-500/10 dark:hover:bg-red-500/20 text-red-500 dark:text-red-400 transition-all"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative min-w-0">
                {/* Header / Top Bar */}
                <header className="h-24 border-b border-[var(--border-primary)] flex items-center justify-between px-6 lg:px-12 bg-[var(--header-bg)] backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        {/* Hamburger Menu for Mobile */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden w-10 h-10 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                        >
                            <Menu size={18} />
                        </button>
                        <div>
                            {subtitle && <div className="text-indigo-500 font-bold text-[10px] uppercase tracking-[.4em] mb-1">{subtitle}</div>}
                            <h1 className="text-xl lg:text-2xl font-black tracking-tight truncate max-w-[200px] lg:max-w-none">{title}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 lg:gap-6">
                        {/* Theme Switcher */}
                        <button
                            ref={themeButtonRef}
                            onClick={toggleSwitchTheme}
                            className="w-10 h-10 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        <button
                            onClick={onNotificationClick}
                            className="relative w-10 h-10 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                        >
                            <Bell size={18} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[var(--header-bg)]"></span>
                        </button>
                    </div>
                </header>

                {/* Content Container */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar bg-[var(--bg-secondary)] transition-colors duration-300">
                    {children}
                </div>
            </main>

            {/* Chatbot Widget */}
            <ChatbotWidget />
        </div>
    );
};

export default DashboardShell;
