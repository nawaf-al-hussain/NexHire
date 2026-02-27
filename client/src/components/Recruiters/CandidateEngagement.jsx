import React from 'react';
import { Users, TrendingUp, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const CandidateEngagement = ({ loading, onRefresh }) => {
    const [engagementData, setEngagementData] = React.useState([]);
    const [loadingData, setLoadingData] = React.useState(true);

    React.useEffect(() => {
        fetchEngagement();
    }, []);

    const fetchEngagement = async () => {
        try {
            setLoadingData(true);
            const res = await axios.get(`${API_BASE}/recruiters/engagement`);
            setEngagementData(res.data);
        } catch (err) {
            console.error("Engagement Fetch Error:", err);
        } finally {
            setLoadingData(false);
        }
    };

    const getEngagementColor = (rate) => {
        if (rate >= 80) return 'text-emerald-500';
        if (rate >= 50) return 'text-amber-500';
        return 'text-rose-500';
    };

    const getEngagementBadge = (rate) => {
        if (rate >= 80) return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'High' };
        if (rate >= 50) return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Medium' };
        return { bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Low' };
    };

    if (loadingData) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Loading Engagement Data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card rounded-[2rem] p-6 border border-indigo-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Users size={18} className="text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Total Candidates</span>
                    </div>
                    <div className="text-3xl font-black">{engagementData.length}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Tracked</p>
                </div>

                <div className="glass-card rounded-[2rem] p-6 border border-emerald-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle size={18} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Avg Engagement</span>
                    </div>
                    <div className="text-3xl font-black">
                        {engagementData.length > 0
                            ? Math.round(engagementData.reduce((sum, e) => sum + (e.EngagementRate || 0), 0) / engagementData.length)
                            : 0}%
                    </div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Response Rate</p>
                </div>

                <div className="glass-card rounded-[2rem] p-6 border border-rose-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertCircle size={18} className="text-rose-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Low Engagement</span>
                    </div>
                    <div className="text-3xl font-black text-rose-500">
                        {engagementData.filter(e => (e.EngagementRate || 0) < 50).length}
                    </div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Needs Follow-up</p>
                </div>
            </div>

            {/* Engagement Table */}
            <div className="glass-card rounded-[3rem] p-8">
                <div className="flex items-center gap-3 mb-6">
                    <Users className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Candidate Engagement</h3>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-6">Interview confirmations vs scheduled</p>

                {engagementData.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">No engagement data available</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--border-primary)]">
                                    <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Candidate</th>
                                    <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Interviews</th>
                                    <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Confirmed</th>
                                    <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Engagement Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {engagementData.map((candidate, idx) => {
                                    const badge = getEngagementBadge(candidate.EngagementRate);
                                    return (
                                        <tr key={idx} className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-primary)]/50">
                                            <td className="p-4">
                                                <p className="font-black">{candidate.FullName || 'Unknown'}</p>
                                                <p className="text-[10px] text-[var(--text-muted)]">ID: {candidate.CandidateID}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-3 py-1 bg-[var(--bg-primary)] rounded-lg text-[10px] font-black">
                                                    {candidate.InterviewsScheduled || 0}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black">
                                                    {candidate.ConfirmedInterviews || 0}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${candidate.EngagementRate >= 80 ? 'bg-emerald-500' : candidate.EngagementRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                            style={{ width: `${candidate.EngagementRate || 0}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className={`text-sm font-black ${getEngagementColor(candidate.EngagementRate)}`}>
                                                        {Math.round(candidate.EngagementRate || 0)}%
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black ${badge.bg} ${badge.border} border`}>
                                                        {badge.label}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CandidateEngagement;
