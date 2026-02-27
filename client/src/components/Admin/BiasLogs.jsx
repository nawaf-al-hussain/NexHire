import React from 'react';
import { Shield, AlertTriangle, CheckCircle, RefreshCw, Search, Filter } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const BiasLogs = () => {
    const [logs, setLogs] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState('all');

    React.useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/analytics/bias-logs`);
            setLogs(res.data || []);
        } catch (err) {
            console.error("Fetch logs error:", err);
        } finally {
            setLoading(false);
        }
    };

    const resolveLog = async (id) => {
        try {
            await axios.put(`${API_BASE}/analytics/bias-logs/${id}/resolve`);
            fetchLogs();
        } catch (err) {
            console.error("Resolve error:", err);
        }
    };

    const getSeverityColor = (severity) => {
        if (severity >= 4) return 'text-rose-500';
        if (severity >= 2) return 'text-amber-500';
        return 'text-blue-500';
    };

    const getSeverityBg = (severity) => {
        if (severity >= 4) return 'bg-rose-500/10 border-rose-500/20';
        if (severity >= 2) return 'bg-amber-500/10 border-amber-500/20';
        return 'bg-blue-500/10 border-blue-500/20';
    };

    const getTypeIcon = (type) => {
        if (type === 'FeedbackBias') return '💬';
        if (type === 'ScreeningBias') return '📋';
        if (type === 'InterviewBias') return '🎯';
        return '⚠️';
    };

    const filteredLogs = logs.filter(log => {
        if (filter === 'all') return true;
        if (filter === 'resolved') return log.IsResolved;
        if (filter === 'unresolved') return !log.IsResolved;
        return true;
    });

    const stats = {
        total: logs.length,
        resolved: logs.filter(l => l.IsResolved).length,
        unresolved: logs.filter(l => !l.IsResolved).length,
        highSeverity: logs.filter(l => l.Severity >= 4 && !l.IsResolved).length
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                <span className="ml-3 text-sm font-black uppercase tracking-widest text-[var(--text-muted)]">Loading Bias Logs...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <Shield className="text-rose-500" size={28} />
                        Bias Detection Logs
                    </h2>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                        Track and resolve bias incidents in the hiring process
                    </p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="p-3 rounded-xl bg-[var(--bg-accent)] hover:bg-rose-500/10 transition-all"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card rounded-2xl p-5 border border-[var(--border-primary)]">
                    <div className="flex items-center gap-2 mb-2">
                        <Shield size={14} className="text-indigo-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Total</span>
                    </div>
                    <div className="text-3xl font-black text-indigo-500">{stats.total}</div>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-[var(--border-primary)]">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={14} className="text-rose-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">High Severity</span>
                    </div>
                    <div className="text-3xl font-black text-rose-500">{stats.highSeverity}</div>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-[var(--border-primary)]">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={14} className="text-emerald-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Resolved</span>
                    </div>
                    <div className="text-3xl font-black text-emerald-500">{stats.resolved}</div>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-[var(--border-primary)]">
                    <div className="flex items-center gap-2 mb-2">
                        <Filter size={14} className="text-amber-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Unresolved</span>
                    </div>
                    <div className="text-3xl font-black text-amber-500">{stats.unresolved}</div>
                </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
                {['all', 'unresolved', 'resolved'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${filter === f
                                ? 'bg-indigo-600 text-white'
                                : 'bg-[var(--bg-accent)] border border-[var(--border-primary)]'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Logs List */}
            {filteredLogs.length === 0 ? (
                <div className="glass-card rounded-[2rem] p-12 text-center border-2 border-dashed border-[var(--border-primary)]">
                    <Shield size={48} className="mx-auto text-indigo-500/30 mb-4" />
                    <p className="text-[var(--text-muted)] font-bold">No bias logs found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredLogs.map((log) => (
                        <div
                            key={log.DetectionID}
                            className={`glass-card rounded-[2rem] p-6 border ${log.IsResolved ? 'border-emerald-500/20 opacity-60' : getSeverityBg(log.Severity)}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="text-2xl">{getTypeIcon(log.DetectionType)}</div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 text-xs font-black uppercase">
                                                {log.DetectionType}
                                            </span>
                                            <span className={`text-xs font-black ${getSeverityColor(log.Severity)}`}>
                                                Severity: {log.Severity}/5
                                            </span>
                                            {log.IsResolved && (
                                                <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase">
                                                    Resolved
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-bold mb-2">{log.Details}</p>
                                        {log.SuggestedActions && (
                                            <p className="text-xs text-[var(--text-muted)] mb-2">
                                                <strong>Suggested Action:</strong> {log.SuggestedActions}
                                            </p>
                                        )}
                                        <div className="flex gap-4 text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">
                                            <span>Detected: {new Date(log.DetectedAt).toLocaleString()}</span>
                                            {log.RecruiterName && <span>By: {log.RecruiterName}</span>}
                                            {log.ResolvedAt && <span>Resolved: {new Date(log.ResolvedAt).toLocaleString()}</span>}
                                        </div>
                                    </div>
                                </div>
                                {!log.IsResolved && (
                                    <button
                                        onClick={() => resolveLog(log.DetectionID)}
                                        className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-lg text-xs font-black uppercase hover:bg-emerald-500/20 transition-all"
                                    >
                                        <CheckCircle size={14} className="inline mr-1" />
                                        Resolve
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BiasLogs;
