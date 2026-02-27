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
    AlertTriangle,
    FileText,
    RefreshCw,
    Filter,
    Download,
    Eye,
    Loader2
} from 'lucide-react';

const BackgroundChecks = () => {
    const { user } = useAuth();
    const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' or 'candidate'
    const [dashboardData, setDashboardData] = useState(null);
    const [candidateChecks, setCandidateChecks] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [checkTypeFilter, setCheckTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchName, setSearchName] = useState('');

    // Modal states
    const [showInitiateModal, setShowInitiateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedCheck, setSelectedCheck] = useState(null);
    const [candidates, setCandidates] = useState([]);

    // Form state for initiating new check
    const [newCheck, setNewCheck] = useState({
        candidateId: '',
        checkType: 'Criminal',
        vendor: '',
        notes: ''
    });

    const checkTypes = ['Criminal', 'Education', 'Employment', 'Credit', 'Reference', 'Drug'];
    const statuses = ['Requested', 'InProgress', 'Completed', 'Failed', 'Cleared', 'Adverse'];
    const resultOptions = ['Clear', 'Consider', 'Adverse', 'Inconclusive'];

    useEffect(() => {
        fetchDashboardData();
        fetchCandidates();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/recruiters/background-checks-dashboard`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setDashboardData(res.data);
        } catch (err) {
            console.error("Dashboard fetch error:", err.message);
            setError("Failed to load dashboard data");
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

    const fetchCandidateChecks = async (candidateId) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (checkTypeFilter) params.append('checkType', checkTypeFilter);
            if (statusFilter) params.append('status', statusFilter);

            const res = await axios.get(
                `${API_BASE}/recruiters/background-checks/${candidateId}?${params}`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            setCandidateChecks(res.data);
            setSelectedCandidate(candidates.find(c => c.CandidateID === parseInt(candidateId)));
            setActiveView('candidate');
        } catch (err) {
            console.error("Checks fetch error:", err.message);
            setError("Failed to load candidate checks");
        } finally {
            setLoading(false);
        }
    };

    const initiateCheck = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await axios.post(
                `${API_BASE}/recruiters/background-checks`,
                newCheck,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            setShowInitiateModal(false);
            setNewCheck({ candidateId: '', checkType: 'Criminal', vendor: '', notes: '' });
            fetchDashboardData();
            if (selectedCandidate) {
                fetchCandidateChecks(selectedCandidate.CandidateID);
            }
        } catch (err) {
            console.error("Initiate error:", err.message);
            setError(err.response?.data?.error || "Failed to initiate background check");
        } finally {
            setLoading(false);
        }
    };

    const updateCheckStatus = async (checkId, updateData) => {
        try {
            setLoading(true);
            await axios.put(
                `${API_BASE}/recruiters/background-checks/${checkId}`,
                updateData,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            setShowDetailsModal(false);
            fetchDashboardData();
            if (selectedCandidate) {
                fetchCandidateChecks(selectedCandidate.CandidateID);
            }
        } catch (err) {
            console.error("Update error:", err.message);
            setError("Failed to update background check");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Cleared':
            case 'Clear':
                return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'Completed':
                return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'InProgress':
                return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'Requested':
                return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
            case 'Failed':
            case 'Adverse':
                return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            default:
                return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Cleared':
            case 'Clear':
                return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case 'Failed':
            case 'Adverse':
                return <XCircle className="w-4 h-4 text-rose-500" />;
            case 'InProgress':
                return <Clock className="w-4 h-4 text-amber-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getRiskBadge = (level) => {
        if (!level) return null;
        const colors = {
            1: 'bg-green-900 text-green-300',
            2: 'bg-yellow-900 text-yellow-300',
            3: 'bg-orange-900 text-orange-300',
            4: 'bg-red-900 text-red-300',
            5: 'bg-red-950 text-red-200 border border-red-500'
        };
        return (
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${colors[level] || colors[1]}`}>
                Risk: {level}/5
            </span>
        );
    };

    if (loading && !dashboardData) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                    Loading Background Checks...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <div>
                        <h2 className="text-lg font-black uppercase tracking-tighter">Background Checks</h2>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Manage candidate background verification</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowInitiateModal(true)}
                        className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Initiate Check
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
                    {/* Summary Cards - Gold Standard */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="glass-card rounded-[2rem] p-6 border border-blue-500/20">
                            <div className="flex items-center gap-3 mb-2">
                                <Shield size={18} className="text-blue-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Total Checks</span>
                            </div>
                            <div className="text-3xl font-black">{dashboardData.summary?.TotalChecks || 0}</div>
                            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">All time</p>
                        </div>

                        <div className="glass-card rounded-[2rem] p-6 border border-amber-500/20">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock size={18} className="text-amber-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Pending</span>
                            </div>
                            <div className="text-3xl font-black text-amber-500">{(dashboardData.summary?.Pending || 0) + (dashboardData.summary?.InProgress || 0)}</div>
                            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">In progress</p>
                        </div>

                        <div className="glass-card rounded-[2rem] p-6 border border-emerald-500/20">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle size={18} className="text-emerald-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Cleared</span>
                            </div>
                            <div className="text-3xl font-black text-emerald-500">{dashboardData.summary?.Cleared || 0}</div>
                            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Successfully cleared</p>
                        </div>

                        <div className="glass-card rounded-[2rem] p-6 border border-purple-500/20">
                            <div className="flex items-center gap-3 mb-2">
                                <FileText size={18} className="text-purple-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">Total Cost</span>
                            </div>
                            <div className="text-3xl font-black">${(dashboardData.summary?.TotalCost || 0).toFixed(0)}</div>
                            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Verification expenses</p>
                        </div>
                    </div>

                    {/* Stats by Type */}
                    <div className="glass-card rounded-[2.5rem] p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Shield className="w-5 h-5 text-indigo-500" />
                            <h3 className="text-sm font-black uppercase tracking-widest">Checks by Type</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {dashboardData.byType?.map((type) => (
                                <div key={type.CheckType} className="text-center p-4 bg-[var(--bg-secondary)] rounded-xl">
                                    <p className="text-2xl font-bold text-[var(--text-primary)]">{type.Count}</p>
                                    <p className="text-xs text-[var(--text-muted)] uppercase">{type.CheckType}</p>
                                    <p className="text-xs text-green-400">{type.Completed} completed</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Checks Table */}
                    <div className="glass-card rounded-[2.5rem] p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Shield className="w-5 h-5 text-indigo-500" />
                            <h3 className="text-sm font-black uppercase tracking-widest">Recent Checks</h3>
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
                                    <tr className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-primary)]">
                                        <th className="text-left pb-4 pr-4">Candidate</th>
                                        <th className="text-left pb-4 pr-4">Type</th>
                                        <th className="text-left pb-4 pr-4">Status</th>
                                        <th className="text-left pb-4 pr-4">Result</th>
                                        <th className="text-left pb-4 pr-4">Risk</th>
                                        <th className="text-left pb-4 pr-4">Initiated</th>
                                        <th className="text-left pb-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-primary)]">
                                    {dashboardData.recent
                                        ?.filter(c => !searchName || c.FullName?.toLowerCase().includes(searchName.toLowerCase()))
                                        .map((check) => (
                                            <tr key={check.CheckID} className="group hover:bg-[var(--bg-accent)] transition-colors">
                                                <td className="py-4 pr-4">
                                                    <button
                                                        onClick={() => fetchCandidateChecks(check.CandidateID)}
                                                        className="text-sm font-black hover:text-blue-500 transition-colors"
                                                    >
                                                        {check.FullName}
                                                    </button>
                                                </td>
                                                <td className="py-4 pr-4 text-xs font-bold text-[var(--text-secondary)]">{check.CheckType}</td>
                                                <td className="py-4 pr-4">
                                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusColor(check.Status)}`}>
                                                        {check.Status}
                                                    </span>
                                                </td>
                                                <td className="py-4 pr-4">
                                                    {check.Result ? (
                                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${check.Result === 'Clear' ? 'bg-emerald-500/10 text-emerald-500' :
                                                                check.Result === 'Adverse' ? 'bg-rose-500/10 text-rose-500' :
                                                                    'bg-amber-500/10 text-amber-500'
                                                            }`}>
                                                            {check.Result}
                                                        </span>
                                                    ) : <span className="text-[var(--text-muted)]">—</span>}
                                                </td>
                                                <td className="py-4 pr-4">{getRiskBadge(check.RiskLevel)}</td>
                                                <td className="py-4 pr-4 text-xs font-bold text-[var(--text-muted)]">
                                                    {check.InitiatedAt ? new Date(check.InitiatedAt).toLocaleDateString() : '—'}
                                                </td>
                                                <td className="py-4">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedCheck(check);
                                                            setShowDetailsModal(true);
                                                        }}
                                                        className="w-10 h-10 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-indigo-500 transition-all"
                                                    >
                                                        <Eye size={18} />
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
                            <p className="text-sm text-[var(--text-muted)]">Background Check History</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-4 flex-wrap">
                        <select
                            value={checkTypeFilter}
                            onChange={(e) => {
                                setCheckTypeFilter(e.target.value);
                                fetchCandidateChecks(selectedCandidate.CandidateID);
                            }}
                            className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)]"
                        >
                            <option value="">All Types</option>
                            {checkTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                fetchCandidateChecks(selectedCandidate.CandidateID);
                            }}
                            className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)]"
                        >
                            <option value="">All Statuses</option>
                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* Candidate Checks List */}
                    <div className="space-y-4">
                        {candidateChecks.length === 0 ? (
                            <div className="glass-card rounded-2xl p-8 text-center">
                                <Shield className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                                <p className="text-[var(--text-muted)]">No background checks found for this candidate.</p>
                                <button
                                    onClick={() => {
                                        setNewCheck({ ...newCheck, candidateId: selectedCandidate.CandidateID });
                                        setShowInitiateModal(true);
                                    }}
                                    className="mt-4 text-blue-400 hover:text-blue-300"
                                >
                                    Initiate a new check →
                                </button>
                            </div>
                        ) : (
                            candidateChecks.map((check) => (
                                <div key={check.CheckID} className="glass-card rounded-2xl p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-[var(--bg-secondary)] rounded-xl">
                                                {getStatusIcon(check.Status)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-lg font-bold text-[var(--text-primary)]">{check.CheckType} Check</h4>
                                                    <span className={getStatusColor(check.Status)}>{check.Status}</span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-[var(--text-muted)]">
                                                    <span>Vendor: {check.Vendor}</span>
                                                    <span>•</span>
                                                    <span>ID: {check.RequestID}</span>
                                                    <span>•</span>
                                                    <span>Initiated: {check.InitiatedAt ? new Date(check.InitiatedAt).toLocaleDateString() : '—'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {check.Result && (
                                                <div className="text-right">
                                                    <p className="text-xs text-[var(--text-muted)] uppercase">Result</p>
                                                    <p className={`font-bold ${check.Result === 'Clear' ? 'text-green-400' : check.Result === 'Adverse' ? 'text-red-400' : 'text-yellow-400'}`}>
                                                        {check.Result}
                                                    </p>
                                                </div>
                                            )}
                                            {getRiskBadge(check.RiskLevel)}
                                            <button
                                                onClick={() => {
                                                    setSelectedCheck(check);
                                                    setShowDetailsModal(true);
                                                }}
                                                className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg"
                                            >
                                                <Eye className="w-5 h-5 text-[var(--text-muted)]" />
                                            </button>
                                        </div>
                                    </div>

                                    {check.Findings && (
                                        <div className="mt-4 p-4 bg-[var(--bg-secondary)] rounded-xl">
                                            <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Findings</p>
                                            <p className="text-sm text-[var(--text-secondary)]">{check.Findings}</p>
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
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Initiate Background Check</h3>
                        <form onSubmit={initiateCheck} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
                                    Candidate
                                </label>
                                <select
                                    value={newCheck.candidateId}
                                    onChange={(e) => setNewCheck({ ...newCheck, candidateId: e.target.value })}
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
                                    Check Type
                                </label>
                                <select
                                    value={newCheck.checkType}
                                    onChange={(e) => setNewCheck({ ...newCheck, checkType: e.target.value })}
                                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)]"
                                >
                                    {checkTypes.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
                                    Vendor (optional)
                                </label>
                                <input
                                    type="text"
                                    value={newCheck.vendor}
                                    onChange={(e) => setNewCheck({ ...newCheck, vendor: e.target.value })}
                                    placeholder="e.g., Checkr, HireRight, Internal"
                                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
                                    Notes
                                </label>
                                <textarea
                                    value={newCheck.notes}
                                    onChange={(e) => setNewCheck({ ...newCheck, notes: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)]"
                                />
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
                                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50"
                                >
                                    {loading ? 'Initiating...' : 'Initiate Check'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedCheck && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="glass-card rounded-[3rem] p-8 w-full max-w-lg">
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">
                            {selectedCheck.CheckType} Check Details
                        </h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Status</p>
                                    <p className={getStatusColor(selectedCheck.Status)}>{selectedCheck.Status}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Result</p>
                                    <p className={selectedCheck.Result === 'Clear' ? 'text-green-400' : selectedCheck.Result === 'Adverse' ? 'text-red-400' : 'text-yellow-400'}>
                                        {selectedCheck.Result || 'Pending'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Vendor</p>
                                    <p className="text-[var(--text-primary)]">{selectedCheck.Vendor}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Request ID</p>
                                    <p className="text-[var(--text-primary)] font-mono text-sm">{selectedCheck.RequestID}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Initiated</p>
                                    <p className="text-[var(--text-primary)]">{selectedCheck.InitiatedAt ? new Date(selectedCheck.InitiatedAt).toLocaleString() : '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Completed</p>
                                    <p className="text-[var(--text-primary)]">{selectedCheck.CompletedAt ? new Date(selectedCheck.CompletedAt).toLocaleString() : '—'}</p>
                                </div>
                                {selectedCheck.Cost && (
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Cost</p>
                                        <p className="text-[var(--text-primary)]">${selectedCheck.Cost}</p>
                                    </div>
                                )}
                                {selectedCheck.TurnaroundDays && (
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Turnaround</p>
                                        <p className="text-[var(--text-primary)]">{selectedCheck.TurnaroundDays} days</p>
                                    </div>
                                )}
                            </div>

                            {selectedCheck.Findings && (
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Findings</p>
                                    <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)] p-3 rounded-lg">
                                        {selectedCheck.Findings}
                                    </p>
                                </div>
                            )}

                            {selectedCheck.Notes && (
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Notes</p>
                                    <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)] p-3 rounded-lg">
                                        {selectedCheck.Notes}
                                    </p>
                                </div>
                            )}

                            {/* Update Status Form */}
                            <div className="border-t border-[var(--border-color)] pt-4 mt-4">
                                <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Update Status</p>
                                <div className="flex gap-2 flex-wrap">
                                    {['InProgress', 'Completed'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => updateCheckStatus(selectedCheck.CheckID, { status })}
                                            disabled={selectedCheck.Status === status}
                                            className="px-3 py-1.5 text-sm bg-[var(--bg-secondary)] hover:bg-blue-600 hover:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {status}
                                        </button>
                                    ))}
                                    {['Cleared', 'Clear'].map(result => (
                                        <button
                                            key={result}
                                            onClick={() => updateCheckStatus(selectedCheck.CheckID, { status: 'Completed', result })}
                                            disabled={selectedCheck.Result === result}
                                            className="px-3 py-1.5 text-sm bg-green-900/30 text-green-400 hover:bg-green-600 hover:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {result}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => updateCheckStatus(selectedCheck.CheckID, { status: 'Adverse', result: 'Adverse' })}
                                        className="px-3 py-1.5 text-sm bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                                    >
                                        Adverse
                                    </button>
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

export default BackgroundChecks;
