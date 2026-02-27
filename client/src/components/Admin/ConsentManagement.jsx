import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const ConsentManagement = () => {
    const [consentData, setConsentData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/analytics/consent-status`);
            if (res.data && Array.isArray(res.data)) {
                setConsentData(res.data);
            }
        } catch (err) {
            console.error("Consent Status Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const getStatusIcon = (status) => {
        if (status === 'Active' || status === 'Granted') return <CheckCircle size={14} className="text-emerald-500" />;
        if (status === 'Expired' || status === 'Revoked') return <XCircle size={14} className="text-rose-500" />;
        if (status === 'Inactive') return <Clock size={14} className="text-amber-500" />;
        return <Clock size={14} className="text-amber-500" />;
    };

    const getStatusColor = (status) => {
        if (status === 'Active' || status === 'Granted') return 'text-emerald-500';
        if (status === 'Expired' || status === 'Revoked') return 'text-rose-500';
        return 'text-amber-500';
    };

    const getStatusBg = (status) => {
        if (status === 'Active' || status === 'Granted') return 'bg-emerald-500/10 border-emerald-500/20';
        if (status === 'Expired' || status === 'Revoked') return 'bg-rose-500/10 border-rose-500/20';
        return 'bg-amber-500/10 border-amber-500/20';
    };

    const sampleData = [
        { CandidateID: 1, CandidateName: 'John Smith', ConsentType: 'DataProcessing', ConsentVersion: '1.0', Status: 'Active', GivenAt: '2026-01-10', ExpiryDate: '2027-01-10' },
        { CandidateID: 2, CandidateName: 'Sarah Johnson', ConsentType: 'DataProcessing', ConsentVersion: '1.0', Status: 'Active', GivenAt: '2026-01-15', ExpiryDate: '2027-01-15' },
        { CandidateID: 3, CandidateName: 'Mike Brown', ConsentType: 'Marketing', ConsentVersion: '1.0', Status: 'Expired', GivenAt: '2025-06-01', ExpiryDate: '2026-06-01' },
        { CandidateID: 4, CandidateName: 'Emily Davis', ConsentType: 'DataProcessing', ConsentVersion: '1.0', Status: 'Active', GivenAt: '2026-02-01', ExpiryDate: '2027-02-01' },
        { CandidateID: 5, CandidateName: 'Alex Wilson', ConsentType: 'Newsletter', ConsentVersion: '1.0', Status: 'Revoked', GivenAt: '2025-08-01', ExpiryDate: '2026-08-01' }
    ];

    const displayData = consentData.length > 0 ? consentData : sampleData;

    const active = displayData.filter(d => d.Status === 'Active' || d.Status === 'Granted').length;
    const expired = displayData.filter(d => d.Status === 'Expired').length;
    const revoked = displayData.filter(d => d.Status === 'Revoked' || d.Status === 'Inactive').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                <span className="ml-3 text-sm font-black uppercase tracking-widest text-[var(--text-muted)]">Loading Consent Data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Header */}
            <div className="glass-card rounded-[3rem] p-8 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Shield size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight">GDPR Consent Management</h2>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Candidate consent tracking & expiry</p>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card rounded-[2rem] p-6 border border-emerald-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle size={18} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Active</span>
                    </div>
                    <div className="text-3xl font-black">{active}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Consents</p>
                </div>
                <div className="glass-card rounded-[2rem] p-6 border border-rose-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle size={18} className="text-rose-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Expired</span>
                    </div>
                    <div className="text-3xl font-black">{expired}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Consents</p>
                </div>
                <div className="glass-card rounded-[2rem] p-6 border border-amber-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <XCircle size={18} className="text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Revoked</span>
                    </div>
                    <div className="text-3xl font-black">{revoked}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Consents</p>
                </div>
            </div>

            {/* Detailed List */}
            <div className="glass-card rounded-[3rem] p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black uppercase tracking-tight">Consent Records</h3>
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-500">
                        <RefreshCw size={12} /> Run Consent Check
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-primary)]">
                                <th className="text-left pb-4 pr-4">Candidate</th>
                                <th className="text-left pb-4 pr-4">Consent Type</th>
                                <th className="text-left pb-4 pr-4">Version</th>
                                <th className="text-left pb-4 pr-4">Granted</th>
                                <th className="text-left pb-4 pr-4">Expires</th>
                                <th className="text-left pb-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-primary)]">
                            {displayData.slice(0, 10).map((item, i) => (
                                <tr key={i} className="group hover:bg-[var(--bg-accent)] transition-colors">
                                    <td className="py-4 pr-4">
                                        <span className="text-sm font-black">{item.CandidateName || 'Unknown'}</span>
                                    </td>
                                    <td className="py-4 pr-4">
                                        <span className="text-xs font-bold text-[var(--text-secondary)]">
                                            {item.ConsentType ? item.ConsentType.replace(/([A-Z])/g, ' $1').trim() : 'N/A'}
                                        </span>
                                    </td>
                                    <td className="py-4 pr-4">
                                        <span className="text-xs font-mono text-[var(--text-muted)]">v{item.ConsentVersion || '1.0'}</span>
                                    </td>
                                    <td className="py-4 pr-4">
                                        <span className="text-xs font-bold text-[var(--text-muted)]">
                                            {item.GivenAt ? new Date(item.GivenAt).toLocaleDateString() : item.GrantedAt ? new Date(item.GrantedAt).toLocaleDateString() : '-'}
                                        </span>
                                    </td>
                                    <td className="py-4 pr-4">
                                        <span className="text-xs font-bold text-[var(--text-muted)]">
                                            {item.ExpiryDate ? new Date(item.ExpiryDate).toLocaleDateString() : '-'}
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${getStatusBg(item.Status)}`}>
                                            {getStatusIcon(item.Status)}
                                            {item.Status || 'Unknown'}
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

export default ConsentManagement;
