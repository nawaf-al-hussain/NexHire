import React from 'react';
import { Clock, Users, Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const TimeToHireDetail = () => {
    const [timeData, setTimeData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE}/analytics/time-to-hire-detail`);
                if (res.data && Array.isArray(res.data)) {
                    setTimeData(res.data);
                }
            } catch (err) {
                console.error("Time to Hire Detail Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getDurationColor = (days) => {
        if (days <= 14) return 'text-emerald-500';
        if (days <= 30) return 'text-amber-500';
        return 'text-rose-500';
    };

    const getDurationBg = (days) => {
        if (days <= 14) return 'bg-emerald-500/10 border-emerald-500/20';
        if (days <= 30) return 'bg-amber-500/10 border-amber-500/20';
        return 'bg-rose-500/10 border-rose-500/20';
    };

    const sampleData = [
        { CandidateName: 'John Smith', JobTitle: 'Senior Developer', AppliedDate: '2026-01-10', HiredDate: '2026-02-05', DaysToHire: 26, ApplicationStatus: 'Hired', Source: 'LinkedIn' },
        { CandidateName: 'Sarah Johnson', JobTitle: 'UX Designer', AppliedDate: '2026-01-15', HiredDate: '2026-01-28', DaysToHire: 13, ApplicationStatus: 'Hired', Source: 'Referral' },
        { CandidateName: 'Mike Brown', JobTitle: 'Data Analyst', AppliedDate: '2026-01-20', HiredDate: '2026-02-18', DaysToHire: 29, ApplicationStatus: 'Hired', Source: 'Job Board' },
        { CandidateName: 'Emily Davis', JobTitle: 'Product Manager', AppliedDate: '2026-02-01', HiredDate: '2026-02-20', DaysToHire: 19, ApplicationStatus: 'Hired', Source: 'Direct' },
        { CandidateName: 'Alex Wilson', JobTitle: 'DevOps Engineer', AppliedDate: '2026-01-05', HiredDate: '2026-02-15', DaysToHire: 41, ApplicationStatus: 'Hired', Source: 'LinkedIn' },
        { CandidateName: 'Jessica Lee', JobTitle: 'Frontend Developer', AppliedDate: '2026-02-10', HiredDate: null, DaysToHire: null, ApplicationStatus: 'In Process', Source: 'Referral' }
    ];

    const displayData = timeData.length > 0 ? timeData : sampleData;

    const hired = displayData.filter(d => d.ApplicationStatus === 'Hired');
    const avgDays = hired.length > 0 ? Math.round(hired.reduce((sum, d) => sum + (d.DaysToHire || 0), 0) / hired.length) : 0;
    const fastHires = hired.filter(d => d.DaysToHire <= 14).length;
    const slowHires = hired.filter(d => d.DaysToHire > 30).length;

    if (loading) {
        return (
            <div className="glass-card h-96 rounded-[3rem] animate-pulse"></div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="glass-card rounded-[3rem] p-8 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border border-blue-500/20">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Clock size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Time-to-Hire Details</h2>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Individual candidate hiring timelines</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card rounded-[2rem] p-6 border border-blue-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Users size={18} className="text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Total Hired</span>
                    </div>
                    <div className="text-3xl font-black">{hired.length}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Candidates</p>
                </div>
                <div className="glass-card rounded-[2rem] p-6 border border-indigo-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp size={18} className="text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Average Days</span>
                    </div>
                    <div className="text-3xl font-black">{avgDays}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">To Hire</p>
                </div>
                <div className="glass-card rounded-[2rem] p-6 border border-emerald-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle size={18} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Fast Hire</span>
                    </div>
                    <div className="text-3xl font-black">{fastHires}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">14 Days or Less</p>
                </div>
                <div className="glass-card rounded-[2rem] p-6 border border-rose-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertCircle size={18} className="text-rose-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Slow Hire</span>
                    </div>
                    <div className="text-3xl font-black">{slowHires}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Over 30 Days</p>
                </div>
            </div>

            <div className="glass-card rounded-[3rem] p-8">
                <h3 className="text-lg font-black uppercase tracking-tight mb-6">Candidate Hiring Timelines</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-primary)]">
                                <th className="text-left pb-4 pr-4">Candidate</th>
                                <th className="text-left pb-4 pr-4">Position</th>
                                <th className="text-left pb-4 pr-4">Applied</th>
                                <th className="text-left pb-4 pr-4">Hired</th>
                                <th className="text-left pb-4 pr-4">Days</th>
                                <th className="text-left pb-4 pr-4">Source</th>
                                <th className="text-left pb-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-primary)]">
                            {displayData.slice(0, 15).map((item, i) => (
                                <tr key={i} className="group hover:bg-[var(--bg-accent)] transition-colors">
                                    <td className="py-4 pr-4">
                                        <span className="text-sm font-black">{item.CandidateName || 'Unknown'}</span>
                                    </td>
                                    <td className="py-4 pr-4">
                                        <span className="text-xs font-bold text-[var(--text-secondary)]">{item.JobTitle || 'N/A'}</span>
                                    </td>
                                    <td className="py-4 pr-4">
                                        <span className="text-xs font-bold text-[var(--text-muted)]">
                                            {item.AppliedDate ? new Date(item.AppliedDate).toLocaleDateString() : '-'}
                                        </span>
                                    </td>
                                    <td className="py-4 pr-4">
                                        <span className="text-xs font-bold text-[var(--text-muted)]">
                                            {item.HiredDate ? new Date(item.HiredDate).toLocaleDateString() : '-'}
                                        </span>
                                    </td>
                                    <td className="py-4 pr-4">
                                        {item.DaysToHire ? (
                                            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-black ${getDurationBg(item.DaysToHire)}`}>
                                                {item.DaysToHire} days
                                            </span>
                                        ) : (
                                            <span className="text-xs font-bold text-[var(--text-muted)]">-</span>
                                        )}
                                    </td>
                                    <td className="py-4 pr-4">
                                        <span className="text-xs font-bold text-[var(--text-secondary)]">{item.Source || 'N/A'}</span>
                                    </td>
                                    <td className="py-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${item.ApplicationStatus === 'Hired'
                                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                            }`}>
                                            {item.ApplicationStatus || 'Unknown'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TimeToHireDetail;
