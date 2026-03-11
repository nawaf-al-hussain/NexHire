import React from 'react';
import { Shield, AlertTriangle, CheckCircle, RefreshCw, Search, Filter, AlertCircle, Zap, TrendingUp, Users, Loader2 } from 'lucide-react';
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
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Loading Bias Logs...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="glass-card rounded-[3rem] p-8 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-500/20">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Shield size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Bias Detection Logs</h2>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Track and resolve bias incidents in the hiring process</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card rounded-[2rem] p-6 border border-indigo-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield size={18} className="text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Total Logs</span>
                    </div>
                    <div className="text-3xl font-black">{stats.total}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">All incidents</p>
                </div>
                <div className="glass-card rounded-[2rem] p-6 border border-rose-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle size={18} className="text-rose-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">High Severity</span>
                    </div>
                    <div className="text-3xl font-black text-rose-500">{stats.highSeverity}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Critical incidents</p>
                </div>
                <div className="glass-card rounded-[2rem] p-6 border border-emerald-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle size={18} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Resolved</span>
                    </div>
                    <div className="text-3xl font-black text-emerald-500">{stats.resolved}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Incidents resolved</p>
                </div>
                <div className="glass-card rounded-[2rem] p-6 border border-amber-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Zap size={18} className="text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Unresolved</span>
                    </div>
                    <div className="text-3xl font-black text-amber-500">{stats.unresolved}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Require attention</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bias Overview */}
                <div className="glass-card rounded-[3rem] p-8">
                    <h3 className="text-lg font-black uppercase tracking-tight mb-6">Bias Detection Overview</h3>

                    {logs.length > 0 ? (
                        <div className="space-y-6">
                            {/* Severity Distribution */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-6 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-rose-500 mb-4 flex items-center gap-2">
                                        <AlertTriangle size={16} /> Critical Incidents
                                    </h4>
                                    <div className="space-y-3">
                                        {logs.filter(log => log.Severity >= 4).slice(0, 4).map((log, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <span className="text-sm font-black">{log.DetectionType}</span>
                                                <span className="text-sm font-black text-rose-500">Severity {log.Severity}</span>
                                            </div>
                                        ))}
                                        {logs.filter(log => log.Severity >= 4).length === 0 && (
                                            <div className="text-center text-emerald-500 font-black">No critical incidents</div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-amber-500 mb-4 flex items-center gap-2">
                                        <Zap size={16} /> Unresolved Cases
                                    </h4>
                                    <div className="space-y-3">
                                        {logs.filter(log => !log.IsResolved).slice(0, 4).map((log, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <span className="text-sm font-black">{log.DetectionType}</span>
                                                <span className="text-sm font-black text-amber-500">Pending</span>
                                            </div>
                                        ))}
                                        {logs.filter(log => !log.IsResolved).length === 0 && (
                                            <div className="text-center text-emerald-500 font-black">All incidents resolved</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Detection Types */}
                            <div className="p-6 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
                                <h4 className="text-sm font-black uppercase tracking-widest text-indigo-500 mb-4 flex items-center gap-2">
                                    <TrendingUp size={16} /> Detection Types
                                </h4>
                                <div className="space-y-3">
                                    {['FeedbackBias', 'ScreeningBias', 'InterviewBias'].map((type, i) => {
                                        const count = logs.filter(log => log.DetectionType === type).length;
                                        const unresolved = logs.filter(log => log.DetectionType === type && !log.IsResolved).length;
                                        return (
                                            <div key={i} className="flex items-center justify-between">
                                                <span className="text-sm font-black">{type}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-black text-indigo-500">{count}</span>
                                                    {unresolved > 0 && (
                                                        <span className="text-xs font-black text-amber-500">({unresolved} unresolved)</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-[var(--text-muted)]">
                            <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No bias logs available yet.</p>
                            <p className="text-xs mt-1">Bias detection is active and monitoring the hiring process.</p>
                        </div>
                    )}
                </div>

                {/* Filter Controls */}
                <div className="glass-card rounded-[3rem] p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black uppercase tracking-tight">Filter Controls</h3>
                        <button
                            onClick={fetchLogs}
                            className="p-2 hover:bg-[var(--bg-accent)] rounded-xl transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw className="w-5 h-5 text-[var(--text-muted)]" />
                        </button>
                    </div>

                    {/* Filter Buttons */}
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            {[
                                { key: 'all', label: 'All Logs', icon: <Shield size={16} /> },
                                { key: 'unresolved', label: 'Unresolved', icon: <AlertTriangle size={16} /> },
                                { key: 'resolved', label: 'Resolved', icon: <CheckCircle size={16} /> }
                            ].map(f => (
                                <button
                                    key={f.key}
                                    onClick={() => setFilter(f.key)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${filter === f.key
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-[var(--bg-accent)] border-[var(--border-primary)] hover:bg-[var(--bg-accent)]/50'
                                        }`}
                                >
                                    {f.icon}
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* Filter Summary */}
                        <div className="p-6 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
                            <h4 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Filter Summary</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--text-muted)]">Showing:</span>
                                    <span className="font-black">{filter}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--text-muted)]">Results:</span>
                                    <span className="font-black">{filteredLogs.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--text-muted)]">Total Logs:</span>
                                    <span className="font-black">{logs.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--text-muted)]">Resolution Rate:</span>
                                    <span className="font-black text-emerald-500">
                                        {logs.length > 0 ? Math.round((stats.resolved / logs.length) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs List */}
            <div className="glass-card rounded-[3rem] p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black uppercase tracking-tight">Bias Detection Logs</h3>
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                        {filteredLogs.length} logs found
                    </span>
                </div>

                {filteredLogs.length > 0 ? (
                    <div className="space-y-6">
                        {filteredLogs.map((log) => (
                            <div
                                key={log.DetectionID}
                                className={`p-6 bg-[var(--bg-accent)] rounded-xl border ${log.IsResolved ? 'border-emerald-500/20 opacity-60' : getSeverityBg(log.Severity)} hover:bg-[var(--bg-accent)]/50 transition-colors`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="text-2xl">{getTypeIcon(log.DetectionType)}</div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-black uppercase ${log.DetectionType === 'FeedbackBias' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                    log.DetectionType === 'ScreeningBias' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                                                        'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                    }`}>
                                                    {log.DetectionType}
                                                </span>
                                                <span className={`text-xs font-black ${getSeverityColor(log.Severity)}`}>
                                                    Severity: {log.Severity}/5
                                                </span>
                                                {log.IsResolved && (
                                                    <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase border-emerald-500/20">
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
                                            className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-lg text-xs font-black uppercase hover:bg-emerald-500/20 transition-all border border-emerald-500/20 flex items-center gap-2"
                                        >
                                            <CheckCircle size={14} />
                                            Resolve
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-[var(--text-muted)]">
                        <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No bias logs found with current filter.</p>
                        <p className="text-xs mt-1">Try adjusting the filter settings above.</p>
                    </div>
                )}
            </div>

            {/* Empty State */}
            {logs.length === 0 && !loading && (
                <div className="glass-card rounded-[2.5rem] p-8 text-center">
                    <Shield className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
                    <p className="text-[var(--text-muted)]">No bias detection logs available yet.</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Bias detection is active and will log incidents as they are detected.</p>
                </div>
            )}
        </div>
    );
};

export default BiasLogs;