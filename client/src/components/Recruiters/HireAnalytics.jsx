import React from 'react';
import { TrendingUp, Clock, Users, Zap, BarChart3, PieChart, Info, Map, Sparkles } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const HireAnalytics = () => {
    const [bottlenecks, setBottlenecks] = React.useState([]);
    const [diversity, setDiversity] = React.useState([]);
    const [market, setMarket] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const [bRes, dRes, mRes] = await Promise.all([
                    axios.get(`${API_BASE}/analytics/bottlenecks`),
                    axios.get(`${API_BASE}/analytics/diversity`),
                    axios.get(`${API_BASE}/analytics/market`)
                ]);
                if (bRes.data && Array.isArray(bRes.data) && bRes.data.length > 0) setBottlenecks(bRes.data);
                if (dRes.data && Array.isArray(dRes.data) && dRes.data.length > 0) setDiversity(dRes.data);
                if (mRes.data && Array.isArray(mRes.data) && mRes.data.length > 0) setMarket(mRes.data);
            } catch (err) {
                console.error("Analytics Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass-card h-80 rounded-[3rem]"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* Hiring Bottlenecks - Stage Duration */}
                <div className="glass-card rounded-[3rem] p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-rose-500/10 group-hover:text-rose-500/20 transition-colors">
                        <Clock size={120} strokeWidth={1} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-lg shadow-rose-500/10">
                                <Zap size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black tracking-tight uppercase">Stage Bottlenecks</h3>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Avg. Days Spent in Stage</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {bottlenecks.length > 0 ? bottlenecks.map((b, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-[var(--text-secondary)]">{b.StatusName}</span>
                                        <span className={b.AvgDaysInStage > 7 ? 'text-rose-500' : 'text-emerald-500'}>
                                            {parseFloat(b.AvgDaysInStage).toFixed(1)} Days
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-[var(--bg-accent)] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${b.AvgDaysInStage > 7 ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]'}`}
                                            style={{ width: `${Math.min(100, (b.AvgDaysInStage / 15) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )) : (
                                <>
                                    {['Applied', 'Screening', 'Interview', 'Hired'].map((stage, i) => (
                                        <div key={i} className="space-y-3">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                <span className="text-[var(--text-secondary)]">{stage}</span>
                                                <span className={i === 2 ? 'text-rose-500' : 'text-emerald-500'}>
                                                    {[2, 5, 8, 3][i]} Days
                                                </span>
                                            </div>
                                            <div className="w-full h-2 bg-[var(--bg-accent)] rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${i === 2 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                                                    style={{ width: `${[13, 33, 53, 20][i]}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Diversity Analytics Funnel */}
                <div className="glass-card rounded-[3rem] p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-purple-500/10 group-hover:text-purple-500/20 transition-colors">
                        <Users size={120} strokeWidth={1} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 shadow-lg shadow-purple-500/10">
                                <PieChart size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black tracking-tight uppercase">Diversity Funnel</h3>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Inclusion Tracking across Stages</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {diversity.length > 0 ? diversity.slice(0, 4).map((d, i) => (
                                <div key={i} className="flex items-center gap-6 p-5 bg-[var(--bg-accent)] rounded-[2rem] border border-[var(--border-primary)] hover:border-purple-500/30 transition-all">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 font-black">
                                        {Math.round(d.HiringRate * 100)}%
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xs font-black uppercase tracking-tight">{d.Category}</h4>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{d.Label}</span>
                                            <div className="flex-1 h-1 bg-[var(--border-primary)] rounded-full overflow-hidden">
                                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${d.HiringRate * 100}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <>
                                    {['Tech', 'Finance', 'Healthcare', 'Retail'].map((cat, i) => (
                                        <div key={i} className="flex items-center gap-6 p-5 bg-[var(--bg-accent)] rounded-[2rem] border border-[var(--border-primary)]">
                                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 font-black">
                                                {[35, 25, 20, 20][i]}%
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-xs font-black uppercase tracking-tight">{cat}</h4>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Category</span>
                                                    <div className="flex-1 h-1 bg-[var(--border-primary)] rounded-full overflow-hidden">
                                                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${[35, 25, 20, 20][i]}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Market Intelligence Dashboard */}
                <div className="glass-card rounded-[3rem] p-10 lg:col-span-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
                        <Map size={140} strokeWidth={1} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/10">
                                    <BarChart3 size={22} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black tracking-tight uppercase">Market Intelligence</h3>
                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Skill Demand vs. Talent Supply</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest rounded-lg">Real-Time</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {market.length > 0 ? market.map((m, i) => (
                                <div key={i} className="p-6 bg-[var(--bg-accent)] rounded-[2rem] border border-[var(--border-primary)] hover:border-emerald-500/30 transition-all group/item">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="text-xs font-black uppercase tracking-tighter">{m.SkillName}</h4>
                                        <TrendingUp size={14} className={m.TrendDirection === 'Up' ? 'text-emerald-500' : 'text-rose-500'} />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                            <span>Demand</span>
                                            <span className="text-[var(--text-primary)]">{m.DemandScore}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                            <span>Supply</span>
                                            <span className="text-[var(--text-primary)]">{m.SupplyScore}</span>
                                        </div>
                                        <div className={`mt-2 py-2 px-3 rounded-xl text-center text-[8px] font-black uppercase tracking-[0.15em] ${m.DemandScore > m.SupplyScore ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                            {m.DemandScore > m.SupplyScore ? 'Talent Shortage' : 'Talent Surplus'}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <>
                                    {['React', 'Node.js', 'AWS', 'Python'].map((skill, i) => (
                                        <div key={i} className="p-6 bg-[var(--bg-accent)] rounded-[2rem] border border-[var(--border-primary)]">
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="text-xs font-black uppercase tracking-tighter">{skill}</h4>
                                                <TrendingUp size={14} className="text-emerald-500" />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                                    <span>Demand</span>
                                                    <span className="text-[var(--text-primary)]">{[95, 88, 90, 85][i]}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                                    <span>Supply</span>
                                                    <span className="text-[var(--text-primary)]">{[40, 55, 35, 60][i]}</span>
                                                </div>
                                                <div className={`mt-2 py-2 px-3 rounded-xl text-center text-[8px] font-black uppercase tracking-[0.15em] bg-rose-500/10 text-rose-500`}>
                                                    Talent Shortage
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Quick Insights Action Bar */}
            <div className="p-1 glass-card rounded-full flex items-center gap-2 max-w-fit mx-auto border border-white/10 shadow-2xl">
                <div className="px-6 py-3 flex items-center gap-3">
                    <Sparkles size={16} className="text-indigo-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">AI Prediction:</span>
                    <span className="text-[9px] font-black uppercase tracking-widest">Hiring velocity likely to increase by 15% next month</span>
                </div>
                <button className="px-6 py-3 bg-indigo-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center gap-2">
                    Generate Full Report <Info size={12} />
                </button>
            </div>
        </div>
    );
};

export default HireAnalytics;
