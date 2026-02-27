import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../../apiConfig';
import { TrendingUp, TrendingDown, Minus, History, Award, BarChart3, Calendar, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

/**
 * RankingHistory Component
 * Displays a candidate's ranking history across jobs with trend analysis
 * 
 * @param {number} candidateId - The candidate ID to fetch ranking history for
 * @param {string} candidateName - The candidate's name for display
 */
const RankingHistory = ({ candidateId, candidateName }) => {
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'chart'

    useEffect(() => {
        if (candidateId) {
            fetchRankingHistory();
        }
    }, [candidateId]);

    const fetchRankingHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_BASE}/recruiters/ranking-history/${candidateId}`);
            setHistory(res.data.history || []);
            setStats(res.data.stats || null);
        } catch (err) {
            console.error('Failed to fetch ranking history:', err);
            setError('Failed to load ranking history');
            // Use demo data if API fails
            setHistory(getDemoData());
            setStats(getDemoStats());
        } finally {
            setLoading(false);
        }
    };

    const getDemoData = () => [
        { HistoryID: 1, JobID: 1, JobTitle: 'Senior React Developer', MatchScore: 85.5, CalculatedAt: '2025-12-15T10:30:00' },
        { HistoryID: 2, JobID: 2, JobTitle: 'Full Stack Engineer', MatchScore: 78.2, CalculatedAt: '2025-12-10T14:20:00' },
        { HistoryID: 3, JobID: 3, JobTitle: 'Frontend Developer', MatchScore: 92.1, CalculatedAt: '2025-12-05T09:15:00' },
        { HistoryID: 4, JobID: 1, JobTitle: 'Senior React Developer', MatchScore: 82.0, CalculatedAt: '2025-11-28T11:45:00' },
        { HistoryID: 5, JobID: 4, JobTitle: 'UI/UX Developer', MatchScore: 88.7, CalculatedAt: '2025-11-20T16:00:00' },
    ];

    const getDemoStats = () => ({
        totalRankings: 5,
        avgScore: 85.30,
        highestScore: 92.1,
        lowestScore: 78.2,
        scoreTrend: 'improving'
    });

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getScoreColor = (score) => {
        if (score >= 85) return 'text-emerald-500';
        if (score >= 70) return 'text-amber-500';
        return 'text-red-500';
    };

    const getScoreBg = (score) => {
        if (score >= 85) return 'bg-emerald-500/10 border-emerald-500/30';
        if (score >= 70) return 'bg-amber-500/10 border-amber-500/30';
        return 'bg-red-500/10 border-red-500/30';
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'improving':
                return <TrendingUp className="w-5 h-5 text-emerald-500" />;
            case 'declining':
                return <TrendingDown className="w-5 h-5 text-red-500" />;
            default:
                return <Minus className="w-5 h-5 text-gray-400" />;
        }
    };

    const getTrendText = (trend) => {
        switch (trend) {
            case 'improving':
                return <span className="text-emerald-500">Improving</span>;
            case 'declining':
                return <span className="text-red-500">Declining</span>;
            default:
                return <span className="text-gray-400">Stable</span>;
        }
    };

    // Prepare chart data (reverse for chronological order)
    const chartData = [...history].reverse().map((item, index) => ({
        name: formatDate(item.CalculatedAt),
        score: item.MatchScore,
        job: item.JobTitle?.substring(0, 15) + '...'
    }));

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
                <span className="ml-3 text-sm font-medium text-[var(--text-muted)]">Loading ranking history...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10">
                        <History className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">
                            Ranking History
                        </h3>
                        <p className="text-xs text-[var(--text-muted)]">
                            {candidateName ? `${candidateName}'s match score evolution` : 'Match score evolution over time'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchRankingHistory}
                    className="p-2 rounded-lg hover:bg-[var(--bg-accent)] transition-colors"
                    title="Refresh"
                >
                    <RefreshCw className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="glass-card p-4 rounded-xl">
                        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                            Total Rankings
                        </div>
                        <div className="text-2xl font-black text-[var(--text-primary)]">
                            {stats.totalRankings}
                        </div>
                    </div>
                    <div className="glass-card p-4 rounded-xl">
                        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                            Average Score
                        </div>
                        <div className="text-2xl font-black text-indigo-500">
                            {stats.avgScore}%
                        </div>
                    </div>
                    <div className="glass-card p-4 rounded-xl">
                        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                            Highest Score
                        </div>
                        <div className="text-2xl font-black text-emerald-500">
                            {stats.highestScore}%
                        </div>
                    </div>
                    <div className="glass-card p-4 rounded-xl">
                        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                            Lowest Score
                        </div>
                        <div className="text-2xl font-black text-amber-500">
                            {stats.lowestScore}%
                        </div>
                    </div>
                    <div className="glass-card p-4 rounded-xl">
                        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                            Trend
                        </div>
                        <div className="flex items-center gap-2">
                            {getTrendIcon(stats.scoreTrend)}
                            <span className="text-lg font-black">
                                {getTrendText(stats.scoreTrend)}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* View Toggle */}
            <div className="flex gap-2">
                <button
                    onClick={() => setViewMode('timeline')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'timeline'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-[var(--bg-accent)] text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]'
                        }`}
                >
                    Timeline
                </button>
                <button
                    onClick={() => setViewMode('chart')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'chart'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-[var(--bg-accent)] text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]'
                        }`}
                >
                    Chart
                </button>
            </div>

            {/* Content */}
            {history.length === 0 ? (
                <div className="text-center py-12">
                    <History className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
                    <p className="text-sm font-medium text-[var(--text-muted)]">
                        No ranking history available
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                        Rankings will appear here when the candidate is matched with jobs
                    </p>
                </div>
            ) : viewMode === 'timeline' ? (
                /* Timeline View */
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {history.map((item, index) => (
                        <div
                            key={item.HistoryID || index}
                            className={`glass-card p-4 rounded-xl border ${getScoreBg(item.MatchScore)} transition-all hover:scale-[1.01]`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`text-3xl font-black ${getScoreColor(item.MatchScore)}`}>
                                        {item.MatchScore}%
                                    </div>
                                    <div>
                                        <div className="font-bold text-[var(--text-primary)]">
                                            {item.JobTitle || `Job #${item.JobID}`}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(item.CalculatedAt)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {item.MatchScore >= 85 && (
                                        <Award className="w-5 h-5 text-emerald-500" title="High Match" />
                                    )}
                                    {index === 0 && (
                                        <span className="px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase">
                                            Latest
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Chart View */
                <div className="glass-card p-6 rounded-xl">
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                                    stroke="var(--border-primary)"
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                                    stroke="var(--border-primary)"
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--bg-primary)',
                                        border: '1px solid var(--border-primary)',
                                        borderRadius: '12px'
                                    }}
                                    formatter={(value) => [`${value}%`, 'Match Score']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, fill: '#6366f1' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Bar Chart by Job */}
                    <div className="mt-6">
                        <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">
                            Scores by Job
                        </h4>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={history.slice(0, 10)} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                                    <XAxis
                                        type="number"
                                        domain={[0, 100]}
                                        tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                                        stroke="var(--border-primary)"
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="JobTitle"
                                        tick={{ fill: 'var(--text-muted)', fontSize: 9 }}
                                        stroke="var(--border-primary)"
                                        width={120}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--bg-primary)',
                                            border: '1px solid var(--border-primary)',
                                            borderRadius: '12px'
                                        }}
                                        formatter={(value) => [`${value}%`, 'Match Score']}
                                    />
                                    <Bar
                                        dataKey="MatchScore"
                                        fill="#6366f1"
                                        radius={[0, 4, 4, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="text-center py-4 text-amber-500 text-xs">
                    <p>{error} - Showing demo data</p>
                </div>
            )}
        </div>
    );
};

export default RankingHistory;
