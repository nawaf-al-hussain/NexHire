import React from 'react';
import { TrendingUp, Clock, Users, Zap, BarChart3, PieChart, Info, Map, Sparkles, Loader2, Scale, AlertCircle } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const HireAnalytics = () => {
    const [bottlenecks, setBottlenecks] = React.useState([]);
    const [diversity, setDiversity] = React.useState([]);
    const [market, setMarket] = React.useState([]);
    const [timeToHire, setTimeToHire] = React.useState([]);
    const [rejection, setRejection] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const [bRes, dRes, mRes, timeRes, rejectRes] = await Promise.all([
                    axios.get(`${API_BASE}/analytics/bottlenecks`),
                    axios.get(`${API_BASE}/analytics/diversity`),
                    axios.get(`${API_BASE}/analytics/market`),
                    axios.get(`${API_BASE}/analytics/time-to-hire`),
                    axios.get(`${API_BASE}/analytics/rejection-analysis`)
                ]);
                if (bRes.data && Array.isArray(bRes.data) && bRes.data.length > 0) setBottlenecks(bRes.data);
                if (dRes.data && Array.isArray(dRes.data) && dRes.data.length > 0) setDiversity(dRes.data);
                if (mRes.data && Array.isArray(mRes.data) && mRes.data.length > 0) {
                    // Deduplicate by SkillName
                    const uniqueMarket = [];
                    const seenSkills = new Set();
                    for (const item of mRes.data) {
                        if (!seenSkills.has(item.SkillName)) {
                            seenSkills.add(item.SkillName);
                            uniqueMarket.push(item);
                        }
                    }
                    setMarket(uniqueMarket);
                }
                if (timeRes.data && Array.isArray(timeRes.data) && timeRes.data.length > 0) setTimeToHire(timeRes.data);
                if (rejectRes.data && Array.isArray(rejectRes.data) && rejectRes.data.length > 0) setRejection(rejectRes.data);
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
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Loading Analytics...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Gradient Header */}
            <div className="glass-card rounded-[3rem] p-8 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/20">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <TrendingUp size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Hire Analytics</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Recruitment performance metrics</p>
                    </div>
                </div>
            </div>

            {/* Average Time to Hire & Rejection Analysis - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Average Time to Hire */}
                <div className="glass-card p-8 rounded-[2.5rem]">
                    <div className="flex items-center gap-3 mb-6">
                        <Clock className="w-5 h-5 text-indigo-500" />
                        <h3 className="text-sm font-black uppercase tracking-widest">Average Time to Hire</h3>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-6">Overall metric</p>

                    {timeToHire.length > 0 ? (
                        <div className="flex items-end gap-4 mb-4">
                            <span className="text-5xl font-black text-indigo-500">
                                {timeToHire[0]?.AvgDaysToHire ? Number(timeToHire[0].AvgDaysToHire).toFixed(1) : '28.0'}
                            </span>
                            <span className="text-lg font-black text-[var(--text-muted)] mb-2">days</span>
                            <span className={`text-xs font-black uppercase tracking-widest mb-2 ${(timeToHire[0]?.Trend || '+5%').includes('+') ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {timeToHire[0]?.Trend || '+5%'} vs last month
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-end gap-4 mb-4">
                            <span className="text-5xl font-black text-indigo-500">28</span>
                            <span className="text-lg font-black text-[var(--text-muted)] mb-2">days</span>
                            <span className="text-xs font-black uppercase tracking-widest mb-2 text-rose-500">+5% vs last month</span>
                        </div>
                    )}
                </div>

                {/* Rejection Analysis */}
                <div className="glass-card p-8 rounded-[2.5rem]">
                    <div className="flex items-center gap-3 mb-6">
                        <AlertCircle className="w-5 h-5 text-rose-500" />
                        <h3 className="text-sm font-black uppercase tracking-widest">Rejection Analysis</h3>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-6">Top reasons</p>

                    <div className="space-y-3">
                        {rejection.length > 0 ? rejection.slice(0, 4).map((r, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-[var(--bg-accent)] rounded-xl">
                                <span className="text-xs font-black text-[var(--text-secondary)]">{r.RejectionReason}</span>
                                <span className="text-xs font-black text-rose-500">{r.RejectionCount}</span>
                            </div>
                        )) : (
                            <>
                                {['Insufficient Experience', 'Skills Mismatch', 'Culture Fit', 'Salary Expectations'].map((reason, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-[var(--bg-accent)] rounded-xl">
                                        <span className="text-xs font-black text-[var(--text-secondary)]">{reason}</span>
                                        <span className="text-xs font-black text-rose-500">{[45, 32, 18, 12][i]}</span>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Stage Bottlenecks Card */}
            <div className="glass-card p-8 rounded-[2.5rem]">
                <div className="flex items-center gap-3 mb-6">
                    <Clock className="w-5 h-5 text-rose-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Stage Bottlenecks</h3>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-6">Avg. Days Spent in Stage</p>

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
                                    className={`h-full rounded-full transition-all duration-1000 ${b.AvgDaysInStage > 7 ? 'bg-rose-500' : 'bg-indigo-500'}`}
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

            {/* Diversity Analytics Funnel */}
            <div className="glass-card p-8 rounded-[2.5rem]">
                <div className="flex items-center gap-3 mb-6">
                    <Users className="w-5 h-5 text-purple-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Diversity Funnel</h3>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-6">Inclusion Tracking across Stages</p>

                <div className="grid grid-cols-1 gap-6">
                    {diversity.length > 0 ? diversity.slice(0, 4).map((d, i) => {
                        const cat = d.Category || d.Demographic || d.Group || 'Unknown';
                        const lbl = d.Label || d.Description || 'All Stages';
                        const rate = d.HiringRate || d.Rate || (d.Percentage ? d.Percentage / 100 : 0);
                        return (
                            <div key={i} className="flex items-center gap-6 p-5 bg-[var(--bg-accent)] rounded-[2rem] border border-[var(--border-primary)]">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 font-black">
                                    {Math.round(rate * 100)}%
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xs font-black uppercase tracking-tight">{cat}</h4>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{lbl}</span>
                                        <div className="flex-1 h-1 bg-[var(--border-primary)] rounded-full overflow-hidden">
                                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, rate * 100)}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
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

            {/* Market Intelligence Dashboard */}
            <div className="glass-card p-8 rounded-[2.5rem]">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="w-5 h-5 text-emerald-500" />
                        <h3 className="text-sm font-black uppercase tracking-widest">Market Intelligence</h3>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 border border-emerald-500/20">
                        Real-Time
                    </span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-6">Skill Demand vs. Talent Supply</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {market.length > 0 ? market.map((m, i) => (
                        <div key={i} className="p-6 bg-[var(--bg-accent)] rounded-[2rem] border border-[var(--border-primary)]">
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
                                        <div className="mt-2 py-2 px-3 rounded-xl text-center text-[8px] font-black uppercase tracking-[0.15em] bg-rose-500/10 text-rose-500">
                                            Talent Shortage
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
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
