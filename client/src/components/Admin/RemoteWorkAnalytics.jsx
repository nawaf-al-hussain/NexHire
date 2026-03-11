import React from 'react';
import {
    MapPin, Users, Clock, Globe, AlertTriangle, CheckCircle, TrendingUp,
    Monitor, MessageCircle, Zap
} from 'lucide-react';
import RemoteWorkChart from '../Charts/RemoteWorkChart';

const RemoteWorkAnalytics = ({ data, loading }) => {
    // Calculate summary statistics
    const stats = React.useMemo(() => {
        if (!data || data.length === 0) return null;

        const avgScore = data.reduce((sum, d) => sum + (d.RemoteScore || 0), 0) / data.length;
        const excellentMatches = data.filter(d => d.CompatibilityAssessment === 'Excellent Match').length;
        const goodMatches = data.filter(d => d.CompatibilityAssessment === 'Good Match').length;
        const moderateMatches = data.filter(d => d.CompatibilityAssessment === 'Moderate Match').length;
        const poorMatches = data.filter(d => d.CompatibilityAssessment === 'Poor Match').length;

        const avgWorkspace = data.reduce((sum, d) => sum + (d.WorkspaceQuality || 0), 0) / data.length;
        const avgTimezone = data.reduce((sum, d) => sum + (d.TimezoneAlignment || 0), 0) / data.length;
        const avgCommunication = data.reduce((sum, d) => sum + (d.CommunicationPreference || 0), 0) / data.length;
        const avgDistraction = data.reduce((sum, d) => sum + (d.DistractionResistance || 0), 0) / data.length;
        const avgMotivation = data.reduce((sum, d) => sum + (d.SelfMotivationScore || 0), 0) / data.length;
        const avgOverlap = data.reduce((sum, d) => sum + (d.OverlapHours || 0), 0) / data.length;

        return {
            avgScore: avgScore.toFixed(1),
            excellentMatches,
            goodMatches,
            moderateMatches,
            poorMatches,
            totalCandidates: data.length,
            avgWorkspace: avgWorkspace.toFixed(1),
            avgTimezone: avgTimezone.toFixed(1),
            avgCommunication: avgCommunication.toFixed(1),
            avgDistraction: avgDistraction.toFixed(1),
            avgMotivation: avgMotivation.toFixed(1),
            avgOverlap: avgOverlap.toFixed(1)
        };
    }, [data]);

    // Factor data for radar chart visualization
    const factorData = React.useMemo(() => {
        if (!stats) return [];
        return [
            { factor: 'Workspace', score: parseFloat(stats.avgWorkspace) * 10, fullMark: 100 },
            { factor: 'Timezone', score: parseFloat(stats.avgTimezone) * 10, fullMark: 100 },
            { factor: 'Communication', score: parseFloat(stats.avgCommunication) * 10, fullMark: 100 },
            { factor: 'Distraction', score: parseFloat(stats.avgDistraction) * 10, fullMark: 100 },
            { factor: 'Motivation', score: parseFloat(stats.avgMotivation) * 10, fullMark: 100 }
        ];
    }, [stats]);

    const getAssessmentColor = (assessment) => {
        switch (assessment) {
            case 'Excellent Match': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
            case 'Good Match': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
            case 'Moderate Match': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
            case 'Poor Match': return 'text-rose-500 bg-rose-500/10 border-rose-500/30';
            default: return 'text-slate-500 bg-slate-500/10 border-slate-500/30';
        }
    };

    const getScoreColor = (score) => {
        if (score >= 70) return 'text-emerald-500';
        if (score >= 40) return 'text-amber-500';
        return 'text-rose-500';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                <span className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)]">Loading Remote Data...</span>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="glass-card p-8 rounded-[2.5rem]">
                <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Remote Work Compatibility</h3>
                </div>
                <div className="text-center py-10 text-xs font-black text-[var(--text-muted)] opacity-50 uppercase tracking-widest">
                    No remote compatibility data. Connect to database or seed RemoteCompatibility table.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Gradient Header */}
            <div className="glass-card rounded-[3rem] p-8 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border border-blue-500/20">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Globe size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Remote Work Analytics</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Remote work compatibility and timezone insights</p>
                    </div>
                </div>
            </div>

            {/* Summary Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card rounded-2xl p-6 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-4 h-4 text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Avg Remote Score</span>
                    </div>
                    <div className={`text-3xl font-black ${getScoreColor(stats.avgScore)}`}>
                        {stats.avgScore}%
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-6 border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Excellent Matches</span>
                    </div>
                    <div className="text-3xl font-black text-emerald-500">
                        {stats.excellentMatches}
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-6 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Poor Matches</span>
                    </div>
                    <div className="text-3xl font-black text-amber-500">
                        {stats.poorMatches}
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-6 border border-violet-500/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-violet-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-violet-500">Avg Overlap Hours</span>
                    </div>
                    <div className="text-3xl font-black text-violet-500">
                        {stats.avgOverlap}h
                    </div>
                </div>
            </div>

            {/* Role Compatibility Chart */}
            <div className="glass-card p-8 rounded-[2.5rem]">
                <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Role Remote Compatibility</h3>
                </div>
                <RemoteWorkChart data={data} />
            </div>

            {/* Factor Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Candidate Factors */}
                <div className="glass-card p-8 rounded-[2.5rem]">
                    <div className="flex items-center gap-3 mb-6">
                        <Users className="w-5 h-5 text-indigo-500" />
                        <h3 className="text-sm font-black uppercase tracking-widest">Candidate Factor Averages</h3>
                    </div>
                    <div className="space-y-4">
                        {[
                            { label: 'Workspace Quality', value: stats.avgWorkspace, max: 10 },
                            { label: 'Timezone Alignment', value: stats.avgTimezone, max: 10 },
                            { label: 'Communication', value: stats.avgCommunication, max: 10 },
                            { label: 'Distraction Resistance', value: stats.avgDistraction, max: 10 },
                            { label: 'Self Motivation', value: stats.avgMotivation, max: 10 }
                        ].map((factor, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="font-bold">{factor.label}</span>
                                    <span className={`font-black ${getScoreColor(factor.value * 10)}`}>
                                        {factor.value}/{factor.max}
                                    </span>
                                </div>
                                <div className="h-2 bg-[var(--bg-accent)] rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${factor.value >= 7 ? 'bg-emerald-500' :
                                            factor.value >= 4 ? 'bg-amber-500' : 'bg-rose-500'
                                            }`}
                                        style={{ width: `${(factor.value / factor.max) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Match Distribution */}
                <div className="glass-card p-8 rounded-[2.5rem]">
                    <div className="flex items-center gap-3 mb-6">
                        <MapPin className="w-5 h-5 text-violet-500" />
                        <h3 className="text-sm font-black uppercase tracking-widest">Match Distribution</h3>
                    </div>
                    <div className="space-y-4">
                        {[
                            { label: 'Excellent Match', count: stats.excellentMatches, color: 'emerald', percent: (stats.excellentMatches / stats.totalCandidates * 100).toFixed(0) },
                            { label: 'Good Match', count: stats.goodMatches, color: 'blue', percent: (stats.goodMatches / stats.totalCandidates * 100).toFixed(0) },
                            { label: 'Moderate Match', count: stats.moderateMatches, color: 'amber', percent: (stats.moderateMatches / stats.totalCandidates * 100).toFixed(0) },
                            { label: 'Poor Match', count: stats.poorMatches, color: 'rose', percent: (stats.poorMatches / stats.totalCandidates * 100).toFixed(0) }
                        ].map((match, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold">{match.label}</span>
                                        <span className="font-black">{match.count} ({match.percent}%)</span>
                                    </div>
                                    <div className="h-3 bg-[var(--bg-accent)] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full bg-${match.color}-500`}
                                            style={{ width: `${match.percent}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Compatibility Assessment Table */}
            <div className="glass-card p-8 rounded-[2.5rem]">
                <div className="flex items-center gap-3 mb-6">
                    <Users className="w-5 h-5 text-orange-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Detailed Compatibility Assessment</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--border-primary)]">
                                <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Candidate</th>
                                <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Role</th>
                                <th className="text-center py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Score</th>
                                <th className="text-center py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Assessment</th>
                                <th className="text-center py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Timezone Overlap</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.slice(0, 10).map((row, i) => (
                                <tr key={i} className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-accent)] transition-colors">
                                    <td className="py-4 px-4">
                                        <div className="text-sm font-black">{row.FullName || 'N/A'}</div>
                                        <div className="text-[10px] text-[var(--text-muted)]">{row.CandidateLocation || 'Unknown'}</div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="text-sm font-bold">{row.Role || row.JobTitle || 'N/A'}</div>
                                        <div className="text-[10px] text-[var(--text-muted)]">{row.JobLocation || 'Unknown'}</div>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <span className={`text-lg font-black ${getScoreColor(row.RemoteScore || 0)}`}>
                                            {row.RemoteScore || 0}%
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getAssessmentColor(row.CompatibilityAssessment)}`}>
                                            {row.CompatibilityAssessment || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <div className="text-sm font-bold">{row.OverlapHours || 0}h</div>
                                        <div className="text-[10px] text-[var(--text-muted)]">Score: {row.OverlapScore || 0}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {data.length > 10 && (
                    <div className="text-center py-4 text-[10px] font-bold text-[var(--text-muted)] uppercase">
                        Showing 10 of {data.length} candidates
                    </div>
                )}
            </div>
        </div>
    );
};

export default RemoteWorkAnalytics;