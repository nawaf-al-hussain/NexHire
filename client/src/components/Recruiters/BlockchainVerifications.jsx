import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API_BASE from '../../apiConfig';
import axios from 'axios';
import {
    Shield,
    Search,
    Plus,
    CheckCircle,
    XCircle,
    Clock,
    FileText,
    RefreshCw,
    Eye,
    Hash,
    Link2,
    Award,
    GraduationCap,
    Briefcase,
    User,
    Globe,
    Lock,
    TrendingUp,
    DollarSign
} from 'lucide-react';

const BlockchainVerifications = () => {
    const { user } = useAuth();
    const [activeView, setActiveView] = useState('dashboard');
    const [dashboardData, setDashboardData] = useState(null);
    const [candidateVerifications, setCandidateVerifications] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [credentialTypeFilter, setCredentialTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchName, setSearchName] = useState('');

    // Modal states
    const [showInitiateModal, setShowInitiateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedVerification, setSelectedVerification] = useState(null);
    const [candidates, setCandidates] = useState([]);

    // Form state for initiating new verification
    const [newVerification, setNewVerification] = useState({
        candidateId: '',
        credentialType: 'Degree',
        issuingAuthority: '',
        metadata: ''
    });

    const credentialTypes = ['Degree', 'Certificate', 'Employment', 'Identity'];
    const statuses = ['Pending', 'Verified', 'Failed', 'Expired'];
    const networks = ['Ethereum', 'Polygon', 'Solana', 'Hyperledger'];

    useEffect(() => {
        fetchDashboardData();
        fetchCandidates();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/recruiters/blockchain-dashboard`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setDashboardData(res.data);
        } catch (err) {
            console.error("Dashboard fetch error:", err.message);
            // Set empty data gracefully instead of showing error
            setDashboardData({
                summary: {
                    TotalVerifications: 0,
                    Pending: 0,
                    Verified: 0,
                    Failed: 0,
                    Degrees: 0,
                    Certificates: 0,
                    Employment: 0,
                    Identity: 0,
                    TotalCost: 0,
                    AvgCost: 0
                },
                byType: [],
                recent: []
            });
            setError(null); // Clear any error message since we're handling gracefully
        } finally {
            setLoading(false);
        }
    };

    const fetchCandidates = async () => {
        try {
            const res = await axios.get(`${API_BASE}/recruiters/talent-pool`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setCandidates(res.data);
        } catch (err) {
            console.error("Candidates fetch error:", err.message);
        }
    };

    const fetchCandidateVerifications = async (candidateId) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (credentialTypeFilter) params.append('credentialType', credentialTypeFilter);
            if (statusFilter) params.append('status', statusFilter);

            const res = await axios.get(
                `${API_BASE}/recruiters/blockchain-verifications/${candidateId}?${params}`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            setCandidateVerifications(res.data);
            setSelectedCandidate(candidates.find(c => c.CandidateID === parseInt(candidateId)));
            setActiveView('candidate');
        } catch (err) {
            console.error("Verifications fetch error:", err.message);
            setError("Failed to load candidate verifications");
        } finally {
            setLoading(false);
        }
    };

    const initiateVerification = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await axios.post(
                `${API_BASE}/recruiters/blockchain-verifications`,
                newVerification,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            setShowInitiateModal(false);
            setNewVerification({ candidateId: '', credentialType: 'Degree', issuingAuthority: '', metadata: '' });
            fetchDashboardData();
            if (selectedCandidate) {
                fetchCandidateVerifications(selectedCandidate.CandidateID);
            }
        } catch (err) {
            console.error("Initiate error:", err.message);
            setError(err.response?.data?.error || "Failed to initiate blockchain verification");
        } finally {
            setLoading(false);
        }
    };

    const updateVerificationStatus = async (verificationId, updateData) => {
        try {
            setLoading(true);
            await axios.put(
                `${API_BASE}/recruiters/blockchain-verifications/${verificationId}`,
                updateData,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            setShowDetailsModal(false);
            fetchDashboardData();
            if (selectedCandidate) {
                fetchCandidateVerifications(selectedCandidate.CandidateID);
            }
        } catch (err) {
            console.error("Update error:", err.message);
            setError("Failed to update blockchain verification");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Verified': return 'text-green-400';
            case 'Pending': return 'text-yellow-400';
            case 'Failed': return 'text-red-400';
            case 'Expired': return 'text-orange-400';
            default: return 'text-gray-400';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Verified':
                return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'Failed':
                return <XCircle className="w-4 h-4 text-red-400" />;
            case 'Pending':
                return <Clock className="w-4 h-4 text-yellow-400" />;
            default:
                return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getCredentialIcon = (type) => {
        switch (type) {
            case 'Degree':
                return <GraduationCap className="w-5 h-5" />;
            case 'Certificate':
                return <Award className="w-5 h-5" />;
            case 'Employment':
                return <Briefcase className="w-5 h-5" />;
            case 'Identity':
                return <User className="w-5 h-5" />;
            default:
                return <FileText className="w-5 h-5" />;
        }
    };

    if (loading && !dashboardData) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-purple-400" />
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Blockchain Credentials</h2>
                        <p className="text-sm text-[var(--text-muted)]">Verify candidate credentials on blockchain with SHA-256 hashing</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchDashboardData}
                        className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                    <button
                        onClick={() => setShowInitiateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Submit Credential
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            {/* Dashboard View */}
            {activeView === 'dashboard' && dashboardData && (
                <div className="space-y-6">
                    {/* Summary Cards - Enhanced */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="glass-card rounded-2xl p-5 border-l-4 border-purple-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Total Verifications</p>
                                    <p className="text-3xl font-bold text-[var(--text-primary)]">{dashboardData.summary?.TotalVerifications || 0}</p>
                                </div>
                                <Shield className="w-10 h-10 text-purple-400 opacity-50" />
                            </div>
                            <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                <TrendingUp className="w-3 h-3 text-green-400" />
                                <span>All time</span>
                            </div>
                        </div>

                        <div className="glass-card rounded-2xl p-5 border-l-4 border-yellow-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Pending</p>
                                    <p className="text-3xl font-bold text-yellow-400">{dashboardData.summary?.Pending || 0}</p>
                                </div>
                                <Clock className="w-10 h-10 text-yellow-400 opacity-50" />
                            </div>
                            <div className="mt-3 text-xs text-yellow-400/60">
                                Awaiting verification
                            </div>
                        </div>

                        <div className="glass-card rounded-2xl p-5 border-l-4 border-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Verified</p>
                                    <p className="text-3xl font-bold text-green-400">{dashboardData.summary?.Verified || 0}</p>
                                </div>
                                <CheckCircle className="w-10 h-10 text-green-400 opacity-50" />
                            </div>
                            <div className="mt-3 text-xs text-green-400/60">
                                Successfully verified
                            </div>
                        </div>

                        <div className="glass-card rounded-2xl p-5 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Total Cost</p>
                                    <p className="text-3xl font-bold text-[var(--text-primary)]">${(dashboardData.summary?.TotalCost || 0).toFixed(0)}</p>
                                </div>
                                <DollarSign className="w-10 h-10 text-blue-400 opacity-50" />
                            </div>
                            <div className="mt-3 text-xs text-[var(--text-muted)]">
                                Avg: ${(dashboardData.summary?.AvgCost || 0).toFixed(2)}
                            </div>
                        </div>
                    </div>

                    {/* Stats by Type - More detailed */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="glass-card rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Verifications by Credential Type</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {credentialTypes.map((type) => {
                                    const typeData = dashboardData.byType?.find(t => t.CredentialType === type) || { Count: 0, Verified: 0 };
                                    return (
                                        <div key={type} className="text-center p-4 bg-[var(--bg-secondary)] rounded-xl">
                                            <div className="flex justify-center mb-2 text-purple-400">
                                                {getCredentialIcon(type)}
                                            </div>
                                            <p className="text-2xl font-bold text-[var(--text-primary)]">{typeData.Count}</p>
                                            <p className="text-xs text-[var(--text-muted)] uppercase">{type}</p>
                                            <p className="text-xs text-green-400">{typeData.Verified} verified</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Network Distribution */}
                        <div className="glass-card rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Blockchain Networks</h3>
                            <div className="space-y-3">
                                {networks.map((network) => (
                                    <div key={network} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Globe className="w-5 h-5 text-purple-400" />
                                            <span className="text-[var(--text-primary)] font-medium">{network}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-bold text-[var(--text-primary)]">
                                                {network === 'Ethereum' ? dashboardData.summary?.TotalVerifications || 0 : 0}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Verifications Table - Enhanced */}
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">Recent Verifications</h3>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                    <input
                                        type="text"
                                        placeholder="Search candidate..."
                                        value={searchName}
                                        onChange={(e) => setSearchName(e.target.value)}
                                        className="pl-9 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-color)]">
                                        <th className="pb-3">Candidate</th>
                                        <th className="pb-3">Credential</th>
                                        <th className="pb-3">Issuing Authority</th>
                                        <th className="pb-3">Network</th>
                                        <th className="pb-3">Status</th>
                                        <th className="pb-3">Verified</th>
                                        <th className="pb-3">Transaction</th>
                                        <th className="pb-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboardData.recent
                                        ?.filter(c => !searchName || c.FullName?.toLowerCase().includes(searchName.toLowerCase()))
                                        .map((verif) => (
                                            <tr key={verif.VerificationID} className="border-b border-[var(--border-color)]/50 hover:bg-[var(--bg-secondary)]/50">
                                                <td className="py-4">
                                                    <button
                                                        onClick={() => fetchCandidateVerifications(verif.CandidateID)}
                                                        className="font-medium text-[var(--text-primary)] hover:text-purple-400"
                                                    >
                                                        {verif.FullName}
                                                    </button>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-purple-400">{getCredentialIcon(verif.CredentialType)}</span>
                                                        <span className="text-[var(--text-secondary)]">{verif.CredentialType}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-[var(--text-secondary)]">{verif.IssuingAuthority}</td>
                                                <td className="py-4">
                                                    <span className="flex items-center gap-1 text-[var(--text-muted)]">
                                                        <Globe className="w-3 h-3" />
                                                        {verif.Network || 'Ethereum'}
                                                    </span>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(verif.VerificationStatus)}
                                                        <span className={getStatusColor(verif.VerificationStatus)}>{verif.VerificationStatus}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-sm text-[var(--text-muted)]">
                                                    {verif.VerifiedAt ? new Date(verif.VerifiedAt).toLocaleDateString() : '—'}
                                                </td>
                                                <td className="py-4">
                                                    <span className="text-xs font-mono text-[var(--text-muted)]">
                                                        {verif.BlockchainTransactionID ? verif.BlockchainTransactionID.substring(0, 12) + '...' : '—'}
                                                    </span>
                                                </td>
                                                <td className="py-4">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedVerification(verif);
                                                            setShowDetailsModal(true);
                                                        }}
                                                        className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4 text-[var(--text-muted)]" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Candidate Detail View */}
            {activeView === 'candidate' && selectedCandidate && (
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setActiveView('dashboard')}
                            className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg"
                        >
                            <RefreshCw className="w-5 h-5 text-[var(--text-muted)] rotate-180" />
                        </button>
                        <div>
                            <h3 className="text-xl font-bold text-[var(--text-primary)]">{selectedCandidate.FullName}</h3>
                            <p className="text-sm text-[var(--text-muted)]">Blockchain Credential History</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-4 flex-wrap">
                        <select
                            value={credentialTypeFilter}
                            onChange={(e) => {
                                setCredentialTypeFilter(e.target.value);
                                fetchCandidateVerifications(selectedCandidate.CandidateID);
                            }}
                            className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)]"
                        >
                            <option value="">All Types</option>
                            {credentialTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                fetchCandidateVerifications(selectedCandidate.CandidateID);
                            }}
                            className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)]"
                        >
                            <option value="">All Statuses</option>
                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* Candidate Verifications List */}
                    <div className="space-y-4">
                        {candidateVerifications.length === 0 ? (
                            <div className="glass-card rounded-2xl p-8 text-center">
                                <Shield className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                                <p className="text-[var(--text-muted)]">No blockchain verifications found for this candidate.</p>
                                <button
                                    onClick={() => {
                                        setNewVerification({ ...newVerification, candidateId: selectedCandidate.CandidateID });
                                        setShowInitiateModal(true);
                                    }}
                                    className="mt-4 text-purple-400 hover:text-purple-300"
                                >
                                    Submit a new credential →
                                </button>
                            </div>
                        ) : (
                            candidateVerifications.map((verif) => (
                                <div key={verif.VerificationID} className="glass-card rounded-2xl p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-[var(--bg-secondary)] rounded-xl text-purple-400">
                                                {getCredentialIcon(verif.CredentialType)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-lg font-bold text-[var(--text-primary)]">{verif.CredentialType}</h4>
                                                    <span className={getStatusColor(verif.VerificationStatus)}>{verif.VerificationStatus}</span>
                                                    {verif.IsImmutable === 1 && (
                                                        <span className="flex items-center gap-1 text-xs text-green-400">
                                                            <Lock className="w-3 h-3" />
                                                            Immutable
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-[var(--text-muted)]">
                                                    <span>Issuer: {verif.IssuingAuthority}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Globe className="w-3 h-3" />
                                                        {verif.Network || 'Ethereum'}
                                                    </span>
                                                    <span>•</span>
                                                    <span>Submitted: {verif.LastChecked ? new Date(verif.LastChecked).toLocaleDateString() : '—'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {verif.VerifiedAt && (
                                                <div className="text-right">
                                                    <p className="text-xs text-[var(--text-muted)] uppercase">Verified</p>
                                                    <p className="text-green-400">{new Date(verif.VerifiedAt).toLocaleDateString()}</p>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setSelectedVerification(verif);
                                                    setShowDetailsModal(true);
                                                }}
                                                className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg"
                                            >
                                                <Eye className="w-5 h-5 text-[var(--text-muted)]" />
                                            </button>
                                        </div>
                                    </div>

                                    {verif.CredentialHash && (
                                        <div className="mt-4 p-3 bg-[var(--bg-secondary)] rounded-lg">
                                            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                                <Hash className="w-4 h-4" />
                                                <span className="font-mono">{verif.CredentialHash}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Initiate Modal */}
            {showInitiateModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="glass-card rounded-[3rem] p-8 w-full max-w-md">
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Submit Credential for Verification</h3>
                        <form onSubmit={initiateVerification} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
                                    Candidate
                                </label>
                                <select
                                    value={newVerification.candidateId}
                                    onChange={(e) => setNewVerification({ ...newVerification, candidateId: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)]"
                                >
                                    <option value="">Select candidate...</option>
                                    {candidates.map(c => (
                                        <option key={c.CandidateID} value={c.CandidateID}>{c.FullName}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
                                    Credential Type
                                </label>
                                <select
                                    value={newVerification.credentialType}
                                    onChange={(e) => setNewVerification({ ...newVerification, credentialType: e.target.value })}
                                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)]"
                                >
                                    {credentialTypes.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
                                    Issuing Authority
                                </label>
                                <input
                                    type="text"
                                    value={newVerification.issuingAuthority}
                                    onChange={(e) => setNewVerification({ ...newVerification, issuingAuthority: e.target.value })}
                                    placeholder="e.g., Stanford University, Google, Government of USA"
                                    required
                                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
                                    Additional Metadata (optional)
                                </label>
                                <textarea
                                    value={newVerification.metadata}
                                    onChange={(e) => setNewVerification({ ...newVerification, metadata: e.target.value })}
                                    rows={3}
                                    placeholder="Credential ID, issue date, expiry date, etc."
                                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)]"
                                />
                            </div>

                            <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                                <p className="text-xs text-purple-400">
                                    A SHA-256 hash will be generated and stored on the blockchain for immutable verification.
                                </p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowInitiateModal(false)}
                                    className="flex-1 px-4 py-3 border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl hover:bg-[var(--bg-secondary)]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl disabled:opacity-50"
                                >
                                    {loading ? 'Submitting...' : 'Submit for Verification'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedVerification && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="glass-card rounded-[3rem] p-8 w-full max-w-lg">
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">
                            {selectedVerification.CredentialType} Verification Details
                        </h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Status</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {getStatusIcon(selectedVerification.VerificationStatus)}
                                        <p className={getStatusColor(selectedVerification.VerificationStatus)}>{selectedVerification.VerificationStatus}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Network</p>
                                    <p className="text-[var(--text-primary)] mt-1 flex items-center gap-1">
                                        <Globe className="w-3 h-3 text-purple-400" />
                                        {selectedVerification.Network || 'Ethereum'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Credential Type</p>
                                    <p className="text-[var(--text-primary)] mt-1">{selectedVerification.CredentialType}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Issuing Authority</p>
                                    <p className="text-[var(--text-primary)] mt-1">{selectedVerification.IssuingAuthority}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Submitted</p>
                                    <p className="text-[var(--text-primary)] mt-1">{selectedVerification.LastChecked ? new Date(selectedVerification.LastChecked).toLocaleString() : '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Verified</p>
                                    <p className="text-[var(--text-primary)] mt-1">{selectedVerification.VerifiedAt ? new Date(selectedVerification.VerifiedAt).toLocaleString() : '—'}</p>
                                </div>
                            </div>

                            {selectedVerification.CredentialHash && (
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Credential Hash (SHA-256)</p>
                                    <p className="text-xs font-mono bg-[var(--bg-secondary)] p-3 rounded-lg text-[var(--text-secondary)] break-all">
                                        {selectedVerification.CredentialHash}
                                    </p>
                                </div>
                            )}

                            {selectedVerification.BlockchainTransactionID && (
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
                                        <Link2 className="w-3 h-3 inline mr-1" />
                                        Blockchain Transaction
                                    </p>
                                    <p className="text-xs font-mono bg-[var(--bg-secondary)] p-3 rounded-lg text-[var(--text-secondary)] break-all">
                                        {selectedVerification.BlockchainTransactionID}
                                    </p>
                                </div>
                            )}

                            {selectedVerification.BlockNumber && (
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Block Number</p>
                                    <p className="text-[var(--text-primary)]">{selectedVerification.BlockNumber}</p>
                                </div>
                            )}

                            {selectedVerification.IsImmutable && (
                                <div className="flex items-center gap-2 text-green-400">
                                    <Lock className="w-4 h-4" />
                                    <span className="text-sm font-medium">Immutable Record</span>
                                </div>
                            )}

                            {/* Update Status Form */}
                            <div className="border-t border-[var(--border-color)] pt-4 mt-4">
                                <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Update Status</p>
                                <div className="flex gap-2 flex-wrap">
                                    {['Verified', 'Failed'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => updateVerificationStatus(selectedVerification.VerificationID, { verificationStatus: status })}
                                            disabled={selectedVerification.VerificationStatus === status}
                                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${status === 'Verified'
                                                ? 'bg-green-900/30 text-green-400 hover:bg-green-600 hover:text-white'
                                                : 'bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowDetailsModal(false)}
                            className="w-full mt-6 px-4 py-3 border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl hover:bg-[var(--bg-secondary)]"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlockchainVerifications;
