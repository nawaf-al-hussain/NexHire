import React from 'react';
import { Shield, CheckCircle, XCircle, Clock, Award, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const SkillVerificationStatus = () => {
    const [skillData, setSkillData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE}/analytics/skill-verification`);
                if (res.data && Array.isArray(res.data)) {
                    setSkillData(res.data);
                }
            } catch (err) {
                console.error("Skill Verification Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getStatusIcon = (status) => {
        if (status === 'Verified') return <CheckCircle size={14} className="text-emerald-500" />;
        if (status === 'Pending') return <Clock size={14} className="text-amber-500" />;
        return <XCircle size={14} className="text-rose-500" />;
    };

    const getStatusColor = (status) => {
        if (status === 'Verified') return 'text-emerald-500';
        if (status === 'Pending') return 'text-amber-500';
        return 'text-rose-500';
    };

    const getStatusBg = (status) => {
        if (status === 'Verified') return 'bg-emerald-500/10 border-emerald-500/20';
        if (status === 'Pending') return 'bg-amber-500/10 border-amber-500/20';
        return 'bg-rose-500/10 border-rose-500/20';
    };

    const sampleData = [
        { CandidateName: 'John Smith', SkillName: 'React', ClaimedLevel: 'Expert', VerifiedLevel: 'Expert', Status: 'Verified', VerificationDate: '2026-01-15', ExpiryDate: '2027-01-15' },
        { CandidateName: 'John Smith', SkillName: 'Node.js', ClaimedLevel: 'Intermediate', VerifiedLevel: 'Intermediate', Status: 'Verified', VerificationDate: '2026-01-15', ExpiryDate: '2027-01-15' },
        { CandidateName: 'Sarah Johnson', SkillName: 'Python', ClaimedLevel: 'Expert', VerifiedLevel: 'Advanced', Status: 'Verified', VerificationDate: '2026-02-01', ExpiryDate: '2027-02-01' },
        { CandidateName: 'Sarah Johnson', SkillName: 'AWS', ClaimedLevel: 'Intermediate', VerifiedLevel: null, Status: 'Pending', VerificationDate: null, ExpiryDate: null },
        { CandidateName: 'Mike Brown', SkillName: 'SQL', ClaimedLevel: 'Expert', VerifiedLevel: null, Status: 'Pending', VerificationDate: null, ExpiryDate: null },
        { CandidateName: 'Emily Davis', SkillName: 'Java', ClaimedLevel: 'Advanced', VerifiedLevel: 'Beginner', Status: 'Failed', VerificationDate: '2026-01-20', ExpiryDate: null },
        { CandidateName: 'Alex Wilson', SkillName: 'Docker', ClaimedLevel: 'Intermediate', VerifiedLevel: 'Intermediate', Status: 'Verified', VerificationDate: '2026-02-10', ExpiryDate: '2027-02-10' }
    ];

    const displayData = skillData.length > 0 ? skillData : sampleData;

    // Calculate stats
    const verified = displayData.filter(d => d.Status === 'Verified').length;
    const pending = displayData.filter(d => d.Status === 'Pending').length;
    const failed = displayData.filter(d => d.Status === 'Failed').length;

    if (loading) {
        return (
            <div className="glass-card h-96 rounded-[3rem] animate-pulse"></div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Header */}
            <div className="glass-card rounded-[3rem] p-8 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border border-cyan-500/20">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                        <Shield size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Skill Verification Status</h2>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Claimed vs verified skills tracking</p>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card rounded-[2rem] p-6 border border-emerald-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle size={18} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Verified</span>
                    </div>
                    <div className="text-3xl font-black">{verified}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Skills</p>
                </div>
                <div className="glass-card rounded-[2rem] p-6 border border-amber-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Clock size={18} className="text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Pending</span>
                    </div>
                    <div className="text-3xl font-black">{pending}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Skills</p>
                </div>
                <div className="glass-card rounded-[2rem] p-6 border border-rose-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <XCircle size={18} className="text-rose-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Failed</span>
                    </div>
                    <div className="text-3xl font-black">{failed}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Skills</p>
                </div>
            </div>

            {/* Detailed List */}
            <div className="glass-card rounded-[3rem] p-8">
                <h3 className="text-lg font-black uppercase tracking-tight mb-6">All Skill Verifications</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-primary)]">
                                <th className="text-left pb-4 pr-4">Candidate</th>
                                <th className="text-left pb-4 pr-4">Skill</th>
                                <th className="text-left pb-4 pr-4">Claimed</th>
                                <th className="text-left pb-4 pr-4">Verified</th>
                                <th className="text-left pb-4 pr-4">Status</th>
                                <th className="text-left pb-4">Expiry</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-primary)]">
                            {displayData.slice(0, 15).map((item, i) => (
                                <tr key={i} className="group hover:bg-[var(--bg-accent)] transition-colors">
                                    <td className="py-4 pr-4">
                                        <span className="text-sm font-black">{item.CandidateName || 'Unknown'}</span>
                                    </td>
                                    <td className="py-4 pr-4">
                                        <span className="text-sm font-black">{item.SkillName || 'N/A'}</span>
                                    </td>
                                    <td className="py-4 pr-4">
                                        <span className="text-xs font-bold text-[var(--text-secondary)]">{item.ClaimedLevel || 'N/A'}</span>
                                    </td>
                                    <td className="py-4 pr-4">
                                        <span className="text-xs font-bold text-emerald-500">{item.VerifiedLevel || '-'}</span>
                                    </td>
                                    <td className="py-4 pr-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${getStatusBg(item.Status)}`}>
                                            {getStatusIcon(item.Status)}
                                            {item.Status || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        <span className="text-xs font-bold text-[var(--text-muted)]">
                                            {item.ExpiryDate ? new Date(item.ExpiryDate).toLocaleDateString() : '-'}
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

export default SkillVerificationStatus;
