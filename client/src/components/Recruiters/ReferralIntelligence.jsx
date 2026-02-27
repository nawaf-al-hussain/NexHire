import React from 'react';
import {
    Users, TrendingUp, Award, Clock, Target, RefreshCw, ChevronRight, Link2,
    CheckCircle, XCircle, AlertCircle, UserPlus, Network, BarChart3, DollarSign,
    Star, Briefcase, MapPin, Calendar, Filter, Lightbulb, Zap, User
} from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const ReferralIntelligence = () => {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [activeView, setActiveView] = React.useState('overview');

    // Job-specific referral suggestions state
    const [jobs, setJobs] = React.useState([]);
    const [selectedJobId, setSelectedJobId] = React.useState('');
    const [jobSuggestions, setJobSuggestions] = React.useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = React.useState(false);
    const [suggestionsError, setSuggestionsError] = React.useState(null);

    // Fetch jobs list for the dropdown
    const fetchJobs = React.useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE}/jobs`);
            if (res.data && Array.isArray(res.data)) {
                setJobs(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch jobs:", err);
        }
    }, []);

    // Fetch job-specific referral suggestions
    const fetchJobSuggestions = React.useCallback(async (jobId) => {
        if (!jobId) {
            setJobSuggestions([]);
            return;
        }

        setSuggestionsLoading(true);
        setSuggestionsError(null);

        try {
            const res = await axios.get(`${API_BASE}/recruiters/referral-suggestions/${jobId}`);
            setJobSuggestions(res.data || []);
        } catch (err) {
            console.error("Job Suggestions Error:", err);
            setSuggestionsError(err.response?.data?.error || "Failed to load job suggestions");
        } finally {
            setSuggestionsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    // Handle job selection change
    const handleJobChange = (e) => {
        const jobId = e.target.value;
        setSelectedJobId(jobId);
        if (jobId) {
            fetchJobSuggestions(jobId);
        } else {
            setJobSuggestions([]);
        }
    };

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_BASE}/recruiters/referral-intelligence`);
            setData(res.data);
        } catch (err) {
            console.error("Referral Intelligence Error:", err);
            setError(err.response?.data?.error || "Failed to load referral intelligence");
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getOutcomeBadge = (outcome) => {
        switch (outcome) {
            case 'Successful':
                return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'Unsuccessful':
                return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            default:
                return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        }
    };

    const getStrengthColor = (strength) => {
        // ConnectionStrength is 1-10, convert to percentage for display
        const pct = strength * 10;
        if (pct >= 80) return 'text-emerald-500';
        if (pct >= 50) return 'text-amber-500';
        return 'text-rose-500';
    };

    const getTrustBadge = (trust) => {
        switch (trust) {
            case 'High':
                return 'bg-emerald-500/10 text-emerald-500';
            case 'Medium':
                return 'bg-amber-500/10 text-amber-500';
            default:
                return 'bg-slate-500/10 text-slate-500';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                <span className="ml-3 text-sm font-black uppercase tracking-widest text-[var(--text-muted)]">Loading Referral Intelligence...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card rounded-[2rem] p-12 text-center border border-rose-500/20">
                <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
                <p className="text-rose-500 font-bold">{error}</p>
                <button
                    onClick={fetchData}
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm"
                >
                    Retry
                </button>
            </div>
        );
    }

    const summary = data?.summary || {};
    const topReferrers = data?.topReferrers || [];
    const recentReferrals = data?.recentReferrals || [];
    const networkAnalysis = data?.networkAnalysis || [];
    const outcomeBreakdown = data?.outcomeBreakdown || [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <Network className="text-indigo-500" size={28} />
                        Referral Intelligence
                    </h2>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                        Track referral performance, network strength, and optimize your referral pipeline
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className="p-3 rounded-xl bg-[var(--bg-accent)] hover:bg-indigo-500/10 transition-all"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <div className="glass-card rounded-2xl p-5 border border-[var(--border-primary)]">
                    <div className="flex items-center gap-2 mb-2">
                        <Users size={14} className="text-indigo-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Total</span>
                    </div>
                    <div className="text-2xl font-black">{summary.TotalReferrals || 0}</div>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-[var(--border-primary)]">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={14} className="text-emerald-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Hired</span>
                    </div>
                    <div className="text-2xl font-black text-emerald-500">{summary.SuccessfulHires || 0}</div>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-[var(--border-primary)]">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock size={14} className="text-amber-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Pending</span>
                    </div>
                    <div className="text-2xl font-black text-amber-500">{summary.PendingReferrals || 0}</div>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-[var(--border-primary)]">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={14} className="text-blue-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Success Rate</span>
                    </div>
                    <div className="text-2xl font-black text-blue-500">{summary.SuccessRate || 0}%</div>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-[var(--border-primary)]">
                    <div className="flex items-center gap-2 mb-2">
                        <Star size={14} className="text-purple-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Avg Quality</span>
                    </div>
                    <div className="text-2xl font-black text-purple-500">{summary.AvgQualityScore?.toFixed(1) || 0}</div>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-[var(--border-primary)]">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign size={14} className="text-emerald-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Bonus Paid</span>
                    </div>
                    <div className="text-2xl font-black text-emerald-500">${summary.TotalBonusPaid || 0}</div>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-[var(--border-primary)]">
                    <div className="flex items-center gap-2 mb-2">
                        <UserPlus size={14} className="text-indigo-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Referrers</span>
                    </div>
                    <div className="text-2xl font-black">{summary.ActiveReferrers || 0}</div>
                </div>
            </div>

            {/* View Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {['overview', 'referrers', 'referrals', 'network', 'suggestions'].map(view => (
                    <button
                        key={view}
                        onClick={() => setActiveView(view)}
                        className={`px-6 py-3 text-sm font-bold rounded-xl whitespace-nowrap transition-all ${activeView === view
                            ? 'bg-indigo-500 text-white'
                            : 'bg-[var(--bg-accent)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                            }`}
                    >
                        {view === 'overview' && 'Overview'}
                        {view === 'referrers' && 'Top Referrers'}
                        {view === 'referrals' && 'Recent Referrals'}
                        {view === 'network' && 'Network Analysis'}
                        {view === 'suggestions' && 'AI Suggestions'}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeView === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Outcome Breakdown */}
                    <div className="glass-card rounded-[2rem] p-8 border border-[var(--border-primary)]">
                        <h3 className="text-sm font-black uppercase tracking-widest text-indigo-500 mb-6 flex items-center gap-2">
                            <BarChart3 size={16} /> Outcome by Relationship
                        </h3>
                        {outcomeBreakdown.length > 0 ? (
                            <div className="space-y-4">
                                {outcomeBreakdown.map((item, i) => (
                                    <div key={i} className="p-4 bg-[var(--bg-accent)] rounded-xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold">{item.RelationshipType || 'Unknown'}</span>
                                            <span className="text-sm text-[var(--text-muted)]">{item.TotalReferrals} referrals</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs">
                                            <span className="flex items-center gap-1 text-emerald-500">
                                                <CheckCircle size={12} /> {item.Successful} hired
                                            </span>
                                            <span className="flex items-center gap-1 text-rose-500">
                                                <XCircle size={12} /> {item.Unsuccessful} failed
                                            </span>
                                            <span className="flex items-center gap-1 text-amber-500">
                                                <Clock size={12} /> {item.Pending} pending
                                            </span>
                                        </div>
                                        <div className="mt-3 flex h-2 rounded-full overflow-hidden bg-[var(--bg-primary)]">
                                            {item.Successful > 0 && (
                                                <div
                                                    className="bg-emerald-500"
                                                    style={{ width: `${(item.Successful / item.TotalReferrals) * 100}%` }}
                                                />
                                            )}
                                            {item.Unsuccessful > 0 && (
                                                <div
                                                    className="bg-rose-500"
                                                    style={{ width: `${(item.Unsuccessful / item.TotalReferrals) * 100}%` }}
                                                />
                                            )}
                                            {item.Pending > 0 && (
                                                <div
                                                    className="bg-amber-500"
                                                    style={{ width: `${(item.Pending / item.TotalReferrals) * 100}%` }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-[var(--text-muted)]">
                                No outcome breakdown data available
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="space-y-6">
                        {/* Top Referrer Preview */}
                        <div className="glass-card rounded-[2rem] p-8 border border-[var(--border-primary)]">
                            <h3 className="text-sm font-black uppercase tracking-widest text-purple-500 mb-6 flex items-center gap-2">
                                <Award size={16} /> Top Referrer
                            </h3>
                            {topReferrers.length > 0 ? (
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                        <User size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-black text-lg">{topReferrers[0].ReferrerName}</div>
                                        <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                                            <span>{topReferrers[0].TotalReferrals} referrals</span>
                                            <span>{topReferrers[0].SuccessfulReferrals} hired</span>
                                            <span>{topReferrers[0].ConversionRate}% conversion</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-emerald-500">${topReferrers[0].TotalBonusEarned || 0}</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Bonus Earned</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-[var(--text-muted)]">
                                    No referrer data available
                                </div>
                            )}
                        </div>

                        {/* Recent Activity */}
                        <div className="glass-card rounded-[2rem] p-8 border border-[var(--border-primary)]">
                            <h3 className="text-sm font-black uppercase tracking-widest text-blue-500 mb-6 flex items-center gap-2">
                                <Clock size={16} /> Recent Activity
                            </h3>
                            {recentReferrals.slice(0, 3).length > 0 ? (
                                <div className="space-y-3">
                                    {recentReferrals.slice(0, 3).map((ref, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-[var(--bg-accent)] rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                                    <User size={14} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold">{ref.ReferrerName} → {ref.ReferredCandidateName}</div>
                                                    <div className="text-[10px] text-[var(--text-muted)]">{ref.JobTitle}</div>
                                                </div>
                                            </div>
                                            <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full border ${getOutcomeBadge(ref.Outcome)}`}>
                                                {ref.Outcome}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-[var(--text-muted)]">
                                    No recent referrals
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeView === 'referrers' && (
                <div className="glass-card rounded-[2rem] p-8 border border-[var(--border-primary)]">
                    <h3 className="text-sm font-black uppercase tracking-widest text-purple-500 mb-6 flex items-center gap-2">
                        <Award size={16} /> Top Referrers Leaderboard
                    </h3>
                    {topReferrers.length > 0 ? (
                        <div className="space-y-3">
                            {topReferrers.map((referrer, i) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-[var(--bg-accent)] rounded-xl hover:bg-indigo-500/5 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${i === 0 ? 'bg-amber-500/10 text-amber-500' :
                                            i === 1 ? 'bg-slate-400/10 text-slate-400' :
                                                i === 2 ? 'bg-orange-500/10 text-orange-500' :
                                                    'bg-indigo-500/10 text-indigo-500'
                                            }`}>
                                            #{i + 1}
                                        </div>
                                        <div>
                                            <div className="font-black text-lg">{referrer.ReferrerName}</div>
                                            <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                                                <span className="flex items-center gap-1">
                                                    <Users size={12} /> {referrer.TotalReferrals} referrals
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle size={12} className="text-emerald-500" /> {referrer.SuccessfulReferrals} hired
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <div className="text-xl font-black text-blue-500">{referrer.ConversionRate}%</div>
                                            <div className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Conversion</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xl font-black text-purple-500">{referrer.AvgQualityScore?.toFixed(1) || 0}</div>
                                            <div className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Avg Quality</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xl font-black text-emerald-500">${referrer.TotalBonusEarned || 0}</div>
                                            <div className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Bonus</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-[var(--text-muted)]">
                            <Award size={48} className="mx-auto mb-4 opacity-30" />
                            No referrer data available
                        </div>
                    )}
                </div>
            )}

            {activeView === 'referrals' && (
                <div className="glass-card rounded-[2rem] p-8 border border-[var(--border-primary)]">
                    <h3 className="text-sm font-black uppercase tracking-widest text-blue-500 mb-6 flex items-center gap-2">
                        <Link2 size={16} /> Recent Referrals
                    </h3>
                    {recentReferrals.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-primary)]">
                                        <th className="text-left pb-4">Referrer</th>
                                        <th className="text-left pb-4">Referred</th>
                                        <th className="text-left pb-4">Job</th>
                                        <th className="text-left pb-4">Relationship</th>
                                        <th className="text-left pb-4">Strength</th>
                                        <th className="text-left pb-4">Date</th>
                                        <th className="text-left pb-4">Outcome</th>
                                        <th className="text-right pb-4">Bonus</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentReferrals.map((ref, i) => (
                                        <tr key={i} className="border-b border-[var(--border-primary)]/50 hover:bg-[var(--bg-accent)]/50">
                                            <td className="py-4">
                                                <div className="font-bold">{ref.ReferrerName}</div>
                                            </td>
                                            <td className="py-4">
                                                <div className="font-bold">{ref.ReferredCandidateName}</div>
                                            </td>
                                            <td className="py-4">
                                                <span className="text-sm">{ref.JobTitle}</span>
                                            </td>
                                            <td className="py-4">
                                                <span className="text-xs px-2 py-1 bg-indigo-500/10 text-indigo-500 rounded-full">
                                                    {ref.RelationshipType || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <span className={`font-bold ${getStrengthColor(ref.ReferralStrength)}`}>
                                                    {ref.ReferralStrength || 0}%
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <span className="text-sm text-[var(--text-muted)]">
                                                    {ref.ReferralDate ? new Date(ref.ReferralDate).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full border ${getOutcomeBadge(ref.Outcome)}`}>
                                                    {ref.Outcome}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right">
                                                <span className="font-bold text-emerald-500">${ref.BonusAmount || 0}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-[var(--text-muted)]">
                            <Link2 size={48} className="mx-auto mb-4 opacity-30" />
                            No referral data available
                        </div>
                    )}
                </div>
            )}

            {activeView === 'network' && (
                <div className="glass-card rounded-[2rem] p-8 border border-[var(--border-primary)]">
                    <h3 className="text-sm font-black uppercase tracking-widest text-emerald-500 mb-6 flex items-center gap-2">
                        <Network size={16} /> Network Strength Analysis
                    </h3>
                    {networkAnalysis.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {networkAnalysis.map((network, i) => (
                                <div key={i} className="p-5 bg-[var(--bg-accent)] rounded-xl hover:bg-indigo-500/5 transition-all">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold">{network.FullName}</div>
                                            <div className="text-[10px] text-[var(--text-muted)]">{network.TotalConnections} connections</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div>
                                            <div className="text-[var(--text-muted)]">Avg Strength</div>
                                            <div className={`font-black ${getStrengthColor(network.AvgConnectionStrength)}`}>
                                                {network.AvgConnectionStrength ? (network.AvgConnectionStrength * 10).toFixed(0) : 0}%
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[var(--text-muted)]">Strong Connections</div>
                                            <div className="font-black text-emerald-500">{network.HighTrustConnections}</div>
                                        </div>
                                    </div>
                                    {network.LastNetworkInteraction && (
                                        <div className="mt-3 text-[10px] text-[var(--text-muted)]">
                                            Last interaction: {new Date(network.LastNetworkInteraction).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-[var(--text-muted)]">
                            <Network size={48} className="mx-auto mb-4 opacity-30" />
                            No network analysis data available
                        </div>
                    )}
                </div>
            )}

            {activeView === 'suggestions' && (
                <div className="glass-card rounded-[2rem] p-8 border border-[var(--border-primary)]">
                    <h3 className="text-sm font-black uppercase tracking-widest text-amber-500 mb-6 flex items-center gap-2">
                        <Lightbulb size={16} /> AI Referral Suggestions
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] mb-6">
                        Select a job to get AI-powered referral suggestions based on the job's required skills and candidate network connections.
                    </p>

                    {/* Job Selection */}
                    <div className="flex gap-4 mb-8">
                        <select
                            value={selectedJobId}
                            onChange={handleJobChange}
                            className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-primary)] text-[var(--text-primary)] font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Select a job...</option>
                            {jobs.map(job => (
                                <option key={job.JobID} value={job.JobID}>
                                    {job.JobTitle} - {job.Location}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => selectedJobId && fetchJobSuggestions(selectedJobId)}
                            disabled={!selectedJobId || suggestionsLoading}
                            className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {suggestionsLoading ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
                            Get Suggestions
                        </button>
                    </div>

                    {/* Error State */}
                    {suggestionsError && (
                        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                            <p className="text-rose-500 font-bold text-sm">{suggestionsError}</p>
                        </div>
                    )}

                    {/* Loading State */}
                    {suggestionsLoading && (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                            <span className="ml-3 text-sm font-black uppercase tracking-widest text-[var(--text-muted)]">Analyzing Networks...</span>
                        </div>
                    )}

                    {/* Results */}
                    {!suggestionsLoading && jobSuggestions.length > 0 && (
                        <div className="space-y-4">
                            {jobSuggestions.map((suggestion, i) => (
                                <div key={i} className="p-6 bg-[var(--bg-accent)] rounded-xl hover:bg-indigo-500/5 transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${i === 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                                                #{i + 1}
                                            </div>
                                            <div>
                                                <div className="font-black text-lg">{suggestion.ReferrerName}</div>
                                                <div className="text-xs text-[var(--text-muted)]">
                                                    Historical Conversion: {suggestion.HistoricalConversionRate}% | Skills Match: {suggestion.SkillsMatchPercent?.toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-amber-500">{suggestion.ReferrerQualityScore?.toFixed(1) || 0}</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Quality Score</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-4">
                                        <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${suggestion.EstimatedSuccessProbability?.includes('High') ? 'bg-emerald-500/10 text-emerald-500' :
                                            suggestion.EstimatedSuccessProbability?.includes('Medium') ? 'bg-amber-500/10 text-amber-500' :
                                                'bg-rose-500/10 text-rose-500'
                                            }`}>
                                            {suggestion.EstimatedSuccessProbability}
                                        </span>
                                    </div>

                                    {/* Potential Referrals */}
                                    {suggestion.PotentialReferrals && suggestion.PotentialReferrals.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-[var(--border-primary)]">
                                            <div className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
                                                Potential Referrals ({suggestion.PotentialReferrals.length})
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {suggestion.PotentialReferrals.slice(0, 4).map((ref, j) => (
                                                    <div key={j} className="p-3 bg-[var(--bg-primary)] rounded-lg">
                                                        <div className="font-bold text-sm">{ref.FullName}</div>
                                                        <div className="text-xs text-[var(--text-muted)]">
                                                            {ref.YearsOfExperience} years exp | {ref.MatchingSkillsCount} matching skills
                                                        </div>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <span className="text-xs text-[var(--text-muted)]">Fit Score: {ref.FitScore}</span>
                                                            <span className={`text-xs font-bold ${getStrengthColor(ref.ConnectionStrength)}`}>
                                                                {ref.ConnectionStrength * 10}% strength
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!suggestionsLoading && selectedJobId && jobSuggestions.length === 0 && !suggestionsError && (
                        <div className="text-center py-12 text-[var(--text-muted)]">
                            <Lightbulb size={48} className="mx-auto mb-4 opacity-30" />
                            <p>No referral suggestions found for this job.</p>
                            <p className="text-xs mt-2">Try selecting a different job or ensure you have candidates with network connections in the system.</p>
                        </div>
                    )}

                    {/* No Job Selected */}
                    {!selectedJobId && !suggestionsLoading && (
                        <div className="text-center py-12 text-[var(--text-muted)]">
                            <Lightbulb size={48} className="mx-auto mb-4 opacity-30" />
                            <p>Select a job above to get AI-powered referral suggestions</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReferralIntelligence;
