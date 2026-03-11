import React from 'react';
import { Bell, TrendingUp, TrendingDown, Minus, AlertTriangle, Info, DollarSign, Users, Building2, RefreshCw, Loader2 } from 'lucide-react';
import API_BASE from '../../apiConfig';
import axios from 'axios';

const MarketAlerts = () => {
    const [alerts, setAlerts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [refreshing, setRefreshing] = React.useState(false);

    const fetchAlerts = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_BASE}/recruiters/market-alerts`);
            setAlerts(res.data || []);
        } catch (err) {
            console.error("Market Alerts Fetch Error:", err);
            setError(err.response?.data?.error || "Failed to load market alerts");
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchAlerts();
        setRefreshing(false);
    };

    // Group alerts by type
    const groupedAlerts = React.useMemo(() => {
        const groups = {
            'Salary Alert': [],
            'Demand Alert': [],
            'Competitor Alert': []
        };

        alerts.forEach(alert => {
            if (groups[alert.AlertType]) {
                groups[alert.AlertType].push(alert);
            }
        });

        return groups;
    }, [alerts]);

    const getSeverityColor = (severity) => {
        if (severity >= 5) return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
        if (severity >= 3) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    };

    const getSeverityLabel = (severity) => {
        if (severity >= 5) return 'Critical';
        if (severity >= 3) return 'Warning';
        return 'Info';
    };

    const getSeverityIcon = (severity) => {
        if (severity >= 5) return <AlertTriangle className="w-4 h-4" />;
        return <Info className="w-4 h-4" />;
    };

    const getTrendIcon = (trend) => {
        if (trend === 'Rising') return <TrendingUp className="w-4 h-4 text-green-400" />;
        if (trend === 'Falling') return <TrendingDown className="w-4 h-4 text-red-400" />;
        return <Minus className="w-4 h-4 text-gray-400" />;
    };

    const getAlertTypeIcon = (type) => {
        switch (type) {
            case 'Salary Alert': return <DollarSign className="w-5 h-5 text-green-400" />;
            case 'Demand Alert': return <Users className="w-5 h-5 text-blue-400" />;
            case 'Competitor Alert': return <Building2 className="w-5 h-5 text-purple-400" />;
            default: return <Bell className="w-5 h-5 text-gray-400" />;
        }
    };

    const formatSalary = (salary) => {
        if (!salary) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(salary);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Loading Market Alerts...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card p-8 rounded-[2.5rem] text-center">
                <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h3 className="text-sm font-black uppercase tracking-widest mb-2">Error Loading Alerts</h3>
                <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-4">{error}</p>
                <button
                    onClick={fetchAlerts}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const totalAlerts = alerts.length;
    const criticalCount = alerts.filter(a => a.Severity >= 5).length;
    const warningCount = alerts.filter(a => a.Severity >= 3 && a.Severity < 5).length;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Gradient Header */}
            <div className="glass-card rounded-[3rem] p-8 bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <Bell size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Market Alerts</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Stay updated on market trends</p>
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="px-4 py-2 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-amber-500/50 transition-all flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card rounded-[2rem] p-6 border border-indigo-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Bell size={18} className="text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Total Alerts</span>
                    </div>
                    <div className="text-3xl font-black">{totalAlerts}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Active</p>
                </div>
                <div className="glass-card rounded-[2rem] p-6 border border-rose-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle size={18} className="text-rose-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Critical</span>
                    </div>
                    <div className="text-3xl font-black text-rose-500">{criticalCount}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Needs Attention</p>
                </div>
                <div className="glass-card rounded-[2rem] p-6 border border-amber-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Info size={18} className="text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Warnings</span>
                    </div>
                    <div className="text-3xl font-black text-amber-500">{warningCount}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Review Needed</p>
                </div>
            </div>

            {/* Alert Groups */}
            {totalAlerts === 0 ? (
                <div className="p-12 border-2 border-dashed border-[var(--border-primary)] rounded-[3rem] text-center bg-[var(--bg-accent)]/5">
                    <Bell className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-6 opacity-20" />
                    <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-40 mb-4">
                        No market alerts yet
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] opacity-60">
                        Market alerts will appear here when there are significant changes
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Salary Alerts */}
                    {groupedAlerts['Salary Alert'].length > 0 && (
                        <div className="glass-card rounded-[2.5rem] p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <DollarSign className="w-5 h-5 text-emerald-500" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Salary Alerts</h3>
                                <span className="px-3 py-1 text-[10px] font-black bg-emerald-500/10 text-emerald-500 rounded-full">
                                    {groupedAlerts['Salary Alert'].length}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {groupedAlerts['Salary Alert'].map((alert, idx) => (
                                    <div key={idx} className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-primary)]">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-[var(--text-primary)]">{alert.SkillName}</span>
                                                <span className="text-[var(--text-muted)]">•</span>
                                                <span className="text-sm text-[var(--text-muted)]">{alert.Location}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getTrendIcon(alert.SalaryTrend)}
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full border ${getSeverityColor(alert.Severity)}`}>
                                                    {getSeverityLabel(alert.Severity)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 gap-4 mt-3">
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Avg Salary</span>
                                                <p className="text-lg font-bold text-green-400">{formatSalary(alert.AvgSalary)}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Demand</span>
                                                <p className="text-lg font-bold text-blue-400">{alert.DemandScore || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Supply</span>
                                                <p className="text-lg font-bold text-purple-400">{alert.SupplyScore || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Gap</span>
                                                <p className={`text-lg font-bold ${alert.ImbalanceScore > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                    {alert.ImbalanceScore > 0 ? '+' : ''}{alert.ImbalanceScore || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Demand Alerts */}
                    {groupedAlerts['Demand Alert'].length > 0 && (
                        <div className="glass-card rounded-[2.5rem] p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Users className="w-5 h-5 text-blue-500" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Demand Alerts</h3>
                                <span className="px-3 py-1 text-[10px] font-black bg-blue-500/10 text-blue-500 rounded-full">
                                    {groupedAlerts['Demand Alert'].length}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {groupedAlerts['Demand Alert'].map((alert, idx) => (
                                    <div key={idx} className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-primary)]">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-[var(--text-primary)]">{alert.SkillName}</span>
                                                <span className="text-[var(--text-muted)]">•</span>
                                                <span className="text-sm text-[var(--text-muted)]">{alert.Location}</span>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full border ${getSeverityColor(alert.Severity)}`}>
                                                {getSeverityLabel(alert.Severity)}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-4 mt-3">
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Avg Salary</span>
                                                <p className="text-lg font-bold text-green-400">{formatSalary(alert.AvgSalary)}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Demand</span>
                                                <p className="text-lg font-bold text-blue-400">{alert.DemandScore || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Supply</span>
                                                <p className="text-lg font-bold text-purple-400">{alert.SupplyScore || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Gap</span>
                                                <p className={`text-lg font-bold ${alert.ImbalanceScore > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                    {alert.ImbalanceScore > 0 ? '+' : ''}{alert.ImbalanceScore || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Competitor Alerts */}
                    {groupedAlerts['Competitor Alert'].length > 0 && (
                        <div className="glass-card rounded-[2.5rem] p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Building2 className="w-5 h-5 text-purple-500" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Competitor Alerts</h3>
                                <span className="px-3 py-1 text-[10px] font-black bg-purple-500/10 text-purple-500 rounded-full">
                                    {groupedAlerts['Competitor Alert'].length}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {groupedAlerts['Competitor Alert'].map((alert, idx) => (
                                    <div key={idx} className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-primary)]">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <span className="font-bold text-[var(--text-primary)]">{alert.SkillName}</span>
                                                <span className="text-[var(--text-muted)]"> • </span>
                                                <span className="text-sm text-[var(--text-muted)]">{alert.Location}</span>
                                            </div>
                                            <span className="text-lg font-bold text-green-400">{formatSalary(alert.AvgSalary)}</span>
                                        </div>
                                        {alert.Description && (
                                            <p className="text-sm text-[var(--text-muted)] mt-2">{alert.Description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MarketAlerts;
