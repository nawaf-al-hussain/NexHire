import React from 'react';
import { Shield, CheckCircle, XCircle, Clock, Award, AlertTriangle, RefreshCw, User, FileText, Star, X } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const SkillVerificationStatus = () => {
    const [skillData, setSkillData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [verificationModal, setVerificationModal] = React.useState(false);
    const [selectedSkill, setSelectedSkill] = React.useState(null);
    const [verificationLevel, setVerificationLevel] = React.useState('');
    const [verificationNotes, setVerificationNotes] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE}/analytics/skill-verification`);
                if (res.data && Array.isArray(res.data)) {
                    // Map backend data to frontend expected format
                    const mappedData = res.data.map(item => {
                        let mappedStatus = 'Pending';
                        if (item.VerificationStatus?.includes('Verified')) mappedStatus = 'Verified';
                        if (item.VerificationStatus === 'Verification Failed') mappedStatus = 'Failed';
                        if (item.VerificationStatus === 'Not Verified') mappedStatus = 'Pending';

                        let mappedClaimedLevel = item.ClaimedLevel;
                        if (mappedClaimedLevel && !isNaN(mappedClaimedLevel)) {
                            const levelNum = parseInt(mappedClaimedLevel);
                            if (levelNum >= 9) mappedClaimedLevel = 'Expert';
                            else if (levelNum >= 7) mappedClaimedLevel = 'Advanced';
                            else if (levelNum >= 4) mappedClaimedLevel = 'Intermediate';
                            else mappedClaimedLevel = 'Beginner';
                        }

                        return {
                            CandidateID: item.CandidateID,
                            CandidateName: item.FullName,
                            SkillName: item.SkillName,
                            ClaimedLevel: mappedClaimedLevel,
                            VerifiedLevel: item.VerificationScore ? `${item.VerificationScore}%` : '-',
                            Status: mappedStatus,
                            VerificationDate: item.VerifiedAt,
                            ExpiryDate: item.ExpiryDate
                        };
                    });
                    setSkillData(mappedData);
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

    const openVerificationModal = (item) => {
        setSelectedSkill(item);
        setVerificationLevel(item.ClaimedLevel || '');
        setVerificationNotes('');
        setVerificationModal(true);
    };

    const handleVerify = async (approved) => {
        if (!selectedSkill) return;
        setSubmitting(true);
        try {
            // In a real app, this would call the API
            // await axios.post(`${API_BASE}/analytics/verify-skill`, {
            //     candidateId: selectedSkill.CandidateID,
            //     skillName: selectedSkill.SkillName,
            //     verifiedLevel: verificationLevel,
            //     status: approved ? 'Verified' : 'Failed',
            //     notes: verificationNotes
            // });

            // For now, update local state
            const updatedData = skillData.map(item => {
                if (item.CandidateName === selectedSkill.CandidateName && item.SkillName === selectedSkill.SkillName) {
                    return {
                        ...item,
                        Status: approved ? 'Verified' : 'Failed',
                        VerifiedLevel: approved ? verificationLevel : 'Failed',
                        VerificationDate: new Date().toISOString().split('T')[0],
                        ExpiryDate: approved ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null
                    };
                }
                return item;
            });
            setSkillData(updatedData);
            setVerificationModal(false);
            setSelectedSkill(null);
        } catch (err) {
            console.error('Verification Error:', err);
        } finally {
            setSubmitting(false);
        }
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
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                <span className="ml-3 text-sm font-black uppercase tracking-widest text-[var(--text-muted)]">Loading Skill Verification...</span>
            </div>
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
                                <th className="text-left pb-4 pr-4">Expiry</th>
                                <th className="text-left pb-4">Action</th>
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
                                    <td className="py-4">
                                        {item.Status === 'Pending' && (
                                            <button
                                                onClick={() => openVerificationModal(item)}
                                                className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                                            >
                                                Verify
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Verification Modal */}
            {verificationModal && selectedSkill && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        onClick={() => setVerificationModal(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative w-full max-w-lg bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-cyan-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-tight">Manual Verification</h3>
                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Approve or reject skill claim</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setVerificationModal(false)}
                                className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center hover:bg-[var(--bg-accent)] transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Candidate & Skill Info */}
                        <div className="mb-6 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
                            <div className="flex items-center gap-3 mb-3">
                                <User size={16} className="text-cyan-500" />
                                <span className="text-sm font-black">{selectedSkill.CandidateName}</span>
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                                <FileText size={16} className="text-blue-500" />
                                <span className="text-sm font-bold">{selectedSkill.SkillName}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Star size={16} className="text-amber-500" />
                                <span className="text-xs font-bold text-[var(--text-muted)]">Claimed Level: </span>
                                <span className="text-sm font-black text-amber-500">{selectedSkill.ClaimedLevel}</span>
                            </div>
                        </div>

                        {/* Verification Form */}
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
                                    Verified Level
                                </label>
                                <select
                                    value={verificationLevel}
                                    onChange={(e) => setVerificationLevel(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-sm font-bold focus:outline-none focus:border-cyan-500"
                                >
                                    <option value="">Select level...</option>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                    <option value="Expert">Expert</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={verificationNotes}
                                    onChange={(e) => setVerificationNotes(e.target.value)}
                                    placeholder="Add verification notes..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-sm font-bold focus:outline-none focus:border-cyan-500 resize-none"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleVerify(false)}
                                disabled={submitting || !verificationLevel}
                                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-white text-sm font-black uppercase tracking-wider hover:shadow-lg hover:shadow-rose-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <XCircle size={18} />
                                    Reject
                                </div>
                            </button>
                            <button
                                onClick={() => handleVerify(true)}
                                disabled={submitting || !verificationLevel}
                                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-black uppercase tracking-wider hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <CheckCircle size={18} />
                                    Approve
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkillVerificationStatus;
