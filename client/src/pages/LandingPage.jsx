import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, ShieldCheck, Users, Zap, Globe, Cpu } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen relative selection:bg-indigo-500/30">
            {/* Dynamic Background */}
            <div className="fixed inset-0 -z-10 bg-[var(--bg-primary)] transition-colors duration-500">
                <div className="absolute top-0 -left-1/4 w-[1000px] h-[1000px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-0 -right-1/4 w-[1000px] h-[1000px] bg-purple-600/5 rounded-full blur-[120px]"></div>
            </div>

            {/* Navigation */}
            <nav className="glass-nav mx-auto max-w-7xl mt-4 rounded-2xl px-6 py-4 flex items-center justify-between border border-[var(--border-primary)]">
                <div className="flex items-center gap-3 group pointer-events-auto">
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-transform">
                        <Briefcase className="text-white w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black tracking-tight uppercase">NexHire</span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-[var(--text-secondary)]">
                    <a href="#" className="hover:text-indigo-500 transition-colors">Architecture</a>
                    <a href="#" className="hover:text-indigo-500 transition-colors">SQL View</a>
                    <a href="#" className="hover:text-indigo-500 transition-colors">Stored Procs</a>
                </div>

                <Link
                    to="/login"
                    className="btn-premium bg-[var(--text-primary)] text-[var(--bg-primary)] px-6 py-2.5 rounded-full font-bold hover:shadow-xl hover:shadow-indigo-500/10 transition flex items-center gap-2"
                >
                    Get Started <ArrowRight className="w-4 h-4" />
                </Link>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-6 pt-24 pb-32">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8">
                            <Zap className="w-3 h-3 fill-current" /> Modern DBMS Architecture
                        </div>

                        <h1 className="text-7xl font-black leading-[1.1] mb-8">
                            Scale Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500">
                                Talent Pipeline
                            </span>
                        </h1>

                        <p className="text-xl text-[var(--text-secondary)] mb-10 leading-relaxed max-w-lg opacity-80">
                            Experience the power of a professional Grade recruitment system
                            built on MS SQL Server. Real-time matching, automated workflows,
                            and deep analytics data visualization.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/login"
                                className="btn-premium bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-indigo-500/20 flex items-center gap-3"
                            >
                                Access Demo System <ArrowRight className="w-6 h-6" />
                            </Link>

                            <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-[var(--bg-accent)] border border-[var(--border-primary)] text-[var(--text-muted)]">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] border-2 border-[var(--bg-primary)]"></div>)}
                                </div>
                                <span className="text-sm font-medium">Join 500+ users</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] -z-10"></div>
                        <div className="glass-card rounded-[2.5rem] p-8 overflow-hidden relative group">
                            {/* Mock UI Element */}
                            <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] p-6 shadow-2xl">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="h-2 w-32 bg-[var(--bg-accent)] rounded opacity-20"></div>
                                    <div className="h-6 w-6 bg-[var(--bg-accent)] rounded-full opacity-20"></div>
                                </div>
                                <div className="space-y-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className={`h-12 w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-accent)]/10 flex items-center px-4 gap-4 animate-pulse`} style={{ animationDelay: `${i * 150}ms` }}>
                                            <div className="h-6 w-6 bg-indigo-500/20 rounded-lg"></div>
                                            <div className="h-2 flex-1 bg-[var(--bg-accent)] rounded opacity-20"></div>
                                            <div className="h-2 w-12 bg-[var(--bg-accent)] rounded opacity-20"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Decorative Elements */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
                        </div>
                    </div>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
                    {[
                        {
                            icon: ShieldCheck,
                            title: "Enterprise Security",
                            desc: "Transactional integrity ensured by SQL Server triggers and constraints.",
                            color: "text-emerald-400"
                        },
                        {
                            icon: Globe,
                            title: "Global Search",
                            desc: "Ultra-fast geolocation and full-text search indexing across candidate pools.",
                            color: "text-blue-400"
                        },
                        {
                            icon: Cpu,
                            title: "AI Stored Procs",
                            desc: "Dynamic T-SQL logic handles complex profile matching at the data layer.",
                            color: "text-purple-400"
                        }
                    ].map((feature, i) => (
                        <div key={i} className="glass-card p-10 rounded-[2.5rem] hover:bg-indigo-500/[0.02] transition-all group">
                            <div className="bg-[var(--bg-accent)] w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border border-[var(--border-primary)] group-hover:border-indigo-500/30 transition-all">
                                <feature.icon className={`${feature.color} w-7 h-7`} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                            <p className="text-[var(--text-secondary)] leading-relaxed opacity-70">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer Branding */}
            <footer className="border-t border-[var(--border-primary)] py-12 px-6 bg-[var(--bg-accent)]/30">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                            <Briefcase className="w-5 h-5 text-indigo-500" />
                        </div>
                        <span className="text-lg font-bold uppercase tracking-tighter">NexHire Showcase</span>
                    </div>
                    <div className="text-[var(--text-muted)] text-sm opacity-60">
                        Built for DBMS Advanced Concepts © 2026
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
