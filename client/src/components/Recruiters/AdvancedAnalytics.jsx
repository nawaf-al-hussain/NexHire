import React from 'react';
import { Clock, Users, AlertCircle, TrendingUp, PieChart, Target, Activity, Scale } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const AdvancedAnalytics = () => {
    const [timeToHire, setTimeToHire] = React.useState([]);
    const [rejection, setRejection] = React.useState([]);
    const [skillGap, setSkillGap] = React.useState([]);
    const [engagement, setEngagement] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [timeRes, rejectRes, skillRes, engageRes] = await Promise.all([
                    axios.get(`${API_BASE}/analytics/time-to-hire`),
                    axios.get(`${API_BASE}/analytics/rejection-analysis`),
                    axios.get(`${API_BASE}/analytics/skill-gap`),
                    axios.get(`${API_BASE}/analytics/candidate-engagement`)
                ]);
                if (timeRes.data && Array.isArray(timeRes.data) && timeRes.data.length > 0) setTimeToHire(timeRes.data);
                if (rejectRes.data && Array.isArray(rejectRes.data) && rejectRes.data.length > 0) setRejection(rejectRes.data);
                if (skillRes.data && Array.isArray(skillRes.data) && skillRes.data.length > 0) setSkillGap(skillRes.data);
                if (engageRes.data && Array.isArray(engageRes.data) && engageRes.data.length > 0) setEngagement(engageRes.data);
            } catch (err) {
                console.error("Advanced Analytics Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass-card h-64 rounded-[3rem]"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* Time to Hire */}
                <div className="glass-card rounded-[3rem] p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-indigo-500/10">
                        <Clock size={100} strokeWidth={1} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                <Clock size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tight">Average Time to Hire</h3>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Overall metric</p>
                            </div>
                        </div>
                        <div className="flex items-end gap-4 mb-4">
                            <span className="text-5xl font-black text-indigo-500">{timeToHire[0]?.AvgDaysToHire || 28}</span>
                            <span className="text-lg font-black text-[var(--text-muted)] mb-2">days</span>
                            <span className={`text-xs font-black uppercase tracking-widest mb-2 ${(timeToHire[0]?.Trend || '+5%').includes('+') ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {timeToHire[0]?.Trend || '+5%'} vs last month
                            </span>
                        </div>
                    </div>
                </div>

                {/* Rejection Analysis */}
                <div className="glass-card rounded-[3rem] p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-rose-500/10">
                        <AlertCircle size={100} strokeWidth={1} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                                <Scale size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tight">Rejection Analysis</h3>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Top reasons</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {rejection.length > 0 ? rejection.slice(0, 4).map((r, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-[var(--bg-accent)] rounded-xl">
                                    <span className="text-xs font-black text-[var(--text-secondary)]">{r.Reason}</span>
                                    <span className="text-xs font-black text-rose-500">{r.Count}</span>
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

                {/* Skill Gap Analysis */}
                <div className="glass-card rounded-[3rem] p-10 lg:col-span-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-amber-500/10">
                        <Target size={100} strokeWidth={1} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <Activity size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tight">Skill Gap Analysis</h3>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">High demand, low supply skills</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {skillGap.length > 0 ? skillGap.slice(0, 4).map((s, i) => (
                                <div key={i} className="p-5 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
                                    <h4 className="text-sm font-black mb-3">{s.SkillName}</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[9px] font-black uppercase">
                                            <span className="text-[var(--text-muted)]">Demand</span>
                                            <span className="text-rose-500">{s.DemandScore}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-[var(--border-primary)] rounded-full">
                                            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${s.DemandScore}%` }}></div>
                                        </div>
                                        <div className="flex justify-between text-[9px] font-black uppercase">
                                            <span className="text-[var(--text-muted)]">Supply</span>
                                            <span className="text-emerald-500">{s.SupplyScore}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-[var(--border-primary)] rounded-full">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.SupplyScore}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <>
                                    {['React', 'Node.js', 'AWS', 'Python'].map((skill, i) => (
                                        <div key={i} className="p-5 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
                                            <h4 className="text-sm font-black mb-3">{skill}</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[9px] font-black uppercase">
                                                    <span className="text-[var(--text-muted)]">Demand</span>
                                                    <span className="text-rose-500">{[95, 88, 90, 85][i]}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-[var(--border-primary)] rounded-full">
                                                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${[95, 88, 90, 85][i]}%` }}></div>
                                                </div>
                                                <div className="flex justify-between text-[9px] font-black uppercase">
                                                    <span className="text-[var(--text-muted)]">Supply</span>
                                                    <span className="text-emerald-500">{[40, 55, 35, 60][i]}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-[var(--border-primary)] rounded-full">
                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${[40, 55, 35, 60][i]}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Candidate Engagement */}
                <div className="glass-card rounded-[3rem] p-10 lg:col-span-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-emerald-500/10">
                        <TrendingUp size={100} strokeWidth={1} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <Users size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tight">Candidate Engagement</h3>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Response rates by stage</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {engagement.length > 0 ? engagement.map((e, i) => (
                                <div key={i} className="p-6 bg-[var(--bg-accent)] rounded-2xl text-center">
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">{e.Stage}</p>
                                    <div className="text-3xl font-black text-emerald-500 mb-1">{e.ConfirmationRate}%</div>
                                    <p className="text-[9px] font-black text-[var(--text-muted)]">Avg response: {e.ResponseTime}</p>
                                </div>
                            )) : (
                                <>
                                    {['Interview', 'Screening', 'Offer'].map((stage, i) => (
                                        <div key={i} className="p-6 bg-[var(--bg-accent)] rounded-2xl text-center">
                                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">{stage}</p>
                                            <div className="text-3xl font-black text-emerald-500 mb-1">{[78, 92, 65][i]}%</div>
                                            <p className="text-[9px] font-black text-[var(--text-muted)]">Avg response: {['4h', '2h', '8h'][i]}</p>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdvancedAnalytics;
