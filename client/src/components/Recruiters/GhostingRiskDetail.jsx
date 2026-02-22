import React from 'react';
import { AlertTriangle, Users, Clock, MessageSquare, TrendingDown, Shield } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const GhostingRiskDetail = () => {
    const [ghostingData, setGhostingData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE}/analytics/ghosting-detail`);
                if (res.data && Array.isArray(res.data)) {
                    setGhostingData(res.data);
                }
            } catch (err) {
                console.error("Ghosting Detail Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getRiskColor = (level) => {
        if (level === 'High') return 'text-rose-500';
        if (level === 'Medium') return 'text-amber-500';
        return 'text-emerald-500';
    };

    const getRiskBg = (level) => {
        if (level === 'High') return 'bg-rose-500/10 border-rose-500/20';
        if (level === 'Medium') return 'bg-amber-500/10 border-amber-500/20';
        return 'bg-emerald-500/10 border-emerald-500/20';
    };

    const sampleData = [
        { CandidateName: 'John Smith', JobTitle: 'Senior Developer', OverallRiskScore: 85, OverallRiskLevel: 'High', ResponseTimeHours: 72, CommunicationFrequency: 'Low', LastContactDate: '2026-02-15', DaysSinceLastContact: 5 },
        { CandidateName: 'Sarah Johnson', JobTitle: 'UX Designer', OverallRiskScore: 72, OverallRiskLevel: 'Medium', ResponseTimeHours: 48, CommunicationFrequency: 'Medium', LastContactDate: '2026-02-18', DaysSinceLastContact: 3 },
        { CandidateName: 'Mike Brown', JobTitle: 'Data Analyst', OverallRiskScore: 65, OverallRiskLevel: 'Medium', ResponseTimeHours: 36, CommunicationFrequency: 'Medium', LastContactDate: '2026-02-19', DaysSinceLastContact: 2 },
        { CandidateName: 'Emily Davis', JobTitle: 'Product Manager', OverallRiskScore: 45, OverallRiskLevel: 'Low', ResponseTimeHours: 12, CommunicationFrequency: 'High', LastContactDate: '2026-02-20', DaysSinceLastContact: 1 },
        { CandidateName: 'Alex Wilson', JobTitle: 'DevOps Engineer', OverallRiskScore: 78, OverallRiskLevel: 'High', ResponseTimeHours: 96, CommunicationFrequency: 'Low', LastContactDate: '2026-02-14', DaysSinceLastContact: 6 }
    ];

    const displayData = ghostingData.length > 0 ? ghostingData : sampleData;

    if (loading) {
        return (
            <div className="glass-card h-96 rounded-[3rem] animate-pulse"></div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Header */}
            <div className="glass-card rounded-[3rem] p-8 bg-gradient-to-r from-rose-500/5 to-orange-500/5 border border-rose-500/20">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                        <Shield size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Ghosting Risk Analysis</h2>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Detailed candidate ghosting prediction</p>
                    </div>
                </div>
            </div>

            {/* Risk Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card rounded-[2rem] p-6 border border-rose-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle size={18} className="text-rose-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">High Risk</span>
                    </div>
                    <div className="text-3xl font-black">{displayData.filter(d => d.OverallRiskLevel === 'High').length}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Candidates</p>
                </div>
                <div className="glass-card rounded-[2rem] p-6 border border-amber-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingDown size={18} className="text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Medium Risk</span>
                    </div>
                    <div className="text-3xl font-black">{displayData.filter(d => d.OverallRiskLevel === 'Medium').length}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Candidates</p>
                </div>
                <div className="glass-card rounded-[2rem] p-6 border border-emerald-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Users size={18} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Low Risk</span>
                    </div>
                    <div className="text-3xl font-black">{displayData.filter(d => d.OverallRiskLevel === 'Low').length}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Candidates</p>
                </div>
            </div>

            {/* Detailed List */}
            <div className="glass-card rounded-[3rem] p-8">
                <h3 className="text-lg font-black uppercase tracking-tight mb-6">All Candidates Risk Assessment</h3>
                <div className="space-y-4">
                    {displayData.slice(0, 10).map((candidate, i) => (
                        <div key={i} className={`p-5 rounded-2xl border ${getRiskBg(candidate.OverallRiskLevel)}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h4 className="text-sm font-black">{candidate.CandidateName || 'Unknown'}</h4>
                                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{candidate.JobTitle || 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                    <div className={`text-lg font-black ${getRiskColor(candidate.OverallRiskLevel)}`}>
                                        {candidate.OverallRiskScore || 0}%
                                    </div>
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${getRiskColor(candidate.OverallRiskLevel)}`}>
                                        {candidate.OverallRiskLevel || 'Low'} Risk
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-[9px] font-black uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <Clock size={12} className="text-[var(--text-muted)]" />
                                    <span className="text-[var(--text-muted)]">Response:</span>
                                    <span>{candidate.ResponseTimeHours || 0}h</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MessageSquare size={12} className="text-[var(--text-muted)]" />
                                    <span className="text-[var(--text-muted)]">Frequency:</span>
                                    <span>{candidate.CommunicationFrequency || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users size={12} className="text-[var(--text-muted)]" />
                                    <span className="text-[var(--text-muted)]">Last Contact:</span>
                                    <span>{candidate.DaysSinceLastContact || 0}d ago</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GhostingRiskDetail;
