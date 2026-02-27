import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Smile, Frown, Meh } from 'lucide-react';

/**
 * SentimentChart - Visualizes candidate sentiment data
 * @param {Object} summary - Sentiment summary with AvgSentimentScore, TotalInteractions, etc.
 * @param {Array} history - Array of sentiment records over time
 */
const SentimentChart = ({ summary = {}, history = [], compact = false }) => {
    const avgScore = summary.AvgSentimentScore || 0;
    const totalInteractions = summary.TotalInteractions || 0;
    const redFlags = summary.TotalRedFlags || 0;
    const positiveIndicators = summary.TotalPositiveIndicators || 0;

    // Determine sentiment category
    const getSentimentCategory = (score) => {
        if (score >= 0.5) return { label: 'Very Positive', color: 'text-emerald-500', bg: 'bg-emerald-500' };
        if (score >= 0.2) return { label: 'Positive', color: 'text-green-500', bg: 'bg-green-500' };
        if (score >= -0.2) return { label: 'Neutral', color: 'text-amber-500', bg: 'bg-amber-500' };
        if (score >= -0.5) return { label: 'Negative', color: 'text-orange-500', bg: 'bg-orange-500' };
        return { label: 'Very Negative', color: 'text-rose-500', bg: 'bg-rose-500' };
    };

    const sentiment = getSentimentCategory(avgScore);

    // Get sentiment icon
    const getSentimentIcon = (score) => {
        if (score >= 0.3) return <Smile className="text-emerald-500" size={24} />;
        if (score <= -0.3) return <Frown className="text-rose-500" size={24} />;
        return <Meh className="text-amber-500" size={24} />;
    };

    // Get trend indicator
    const getTrendIndicator = () => {
        // Ensure history is an array
        const historyArray = Array.isArray(history) ? history : [];
        if (historyArray.length < 2) return null;

        const recent = historyArray.slice(0, Math.min(5, historyArray.length));
        const older = historyArray.slice(Math.min(5, historyArray.length), Math.min(10, historyArray.length));

        if (older.length === 0) return null;

        const recentAvg = recent.reduce((sum, r) => sum + (r.SentimentScore || 0), 0) / recent.length;
        const olderAvg = older.reduce((sum, r) => sum + (r.SentimentScore || 0), 0) / older.length;

        const diff = recentAvg - olderAvg;

        if (diff > 0.1) return { icon: TrendingUp, text: 'Improving', color: 'text-emerald-500' };
        if (diff < -0.1) return { icon: TrendingDown, text: 'Declining', color: 'text-rose-500' };
        return { icon: Minus, text: 'Stable', color: 'text-amber-500' };
    };

    const trend = getTrendIndicator();

    // Mini bar chart for history
    const renderMiniChart = () => {
        const historyArray = Array.isArray(history) ? history : [];
        if (!historyArray || historyArray.length === 0) {
            return (
                <div className="flex items-center justify-center h-16 text-[var(--text-muted)]">
                    <p className="text-[9px] font-bold uppercase tracking-widest">No sentiment data yet</p>
                </div>
            );
        }

        const maxBars = 20;
        const bars = historyArray.slice(0, maxBars).reverse();

        return (
            <div className="flex items-end gap-1 h-16">
                {bars.map((item, i) => {
                    const score = item.SentimentScore || 0;
                    const height = Math.abs(score) * 100;
                    const category = getSentimentCategory(score);

                    return (
                        <div
                            key={i}
                            className="flex-1 flex flex-col justify-end h-full"
                            title={`${item.InteractionType}: ${score.toFixed(2)}`}
                        >
                            <div
                                className={`w-full rounded-t-sm ${category.bg} opacity-80`}
                                style={{ height: `${Math.max(height, 10)}%` }}
                            />
                        </div>
                    );
                })}
            </div>
        );
    };

    // Compact view for cards
    if (compact) {
        return (
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    {getSentimentIcon(avgScore)}
                    <span className={`text-sm font-black ${sentiment.color}`}>
                        {avgScore.toFixed(2)}
                    </span>
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 ${trend.color}`}>
                        <trend.icon size={14} />
                        <span className="text-[9px] font-bold uppercase">{trend.text}</span>
                    </div>
                )}
                {redFlags > 0 && (
                    <div className="flex items-center gap-1 text-rose-500">
                        <AlertTriangle size={14} />
                        <span className="text-[9px] font-bold">{redFlags}</span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Main Score Display */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {getSentimentIcon(avgScore)}
                    <div>
                        <div className="flex items-center gap-2">
                            <span className={`text-3xl font-black ${sentiment.color}`}>
                                {avgScore.toFixed(2)}
                            </span>
                            <span className="text-xs font-bold text-[var(--text-muted)]">/ 1.0</span>
                        </div>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${sentiment.color}`}>
                            {sentiment.label}
                        </p>
                    </div>
                </div>

                {trend && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-accent)] ${trend.color}`}>
                        <trend.icon size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{trend.text}</span>
                    </div>
                )}
            </div>

            {/* Sentiment Gauge */}
            <div className="relative">
                <div className="h-3 rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 opacity-30" />
                <div
                    className="absolute top-0 w-4 h-4 rounded-full bg-white border-2 shadow-lg transform -translate-x-1/2"
                    style={{ left: `${((avgScore + 1) / 2) * 100}%` }}
                />
                <div className="flex justify-between mt-2">
                    <span className="text-[9px] font-black text-rose-500">-1.0</span>
                    <span className="text-[9px] font-black text-amber-500">0</span>
                    <span className="text-[9px] font-black text-emerald-500">+1.0</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-[var(--bg-accent)] rounded-xl">
                    <p className="text-lg font-black text-[var(--text-primary)]">{totalInteractions}</p>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Interactions</p>
                </div>
                <div className="text-center p-3 bg-[var(--bg-accent)] rounded-xl">
                    <p className="text-lg font-black text-emerald-500">{positiveIndicators}</p>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Positive</p>
                </div>
                <div className="text-center p-3 bg-[var(--bg-accent)] rounded-xl">
                    <p className="text-lg font-black text-rose-500">{redFlags}</p>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Red Flags</p>
                </div>
                <div className="text-center p-3 bg-[var(--bg-accent)] rounded-xl">
                    <p className="text-lg font-black text-[var(--text-primary)]">
                        {summary.DominantCommunicationStyle || 'N/A'}
                    </p>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Style</p>
                </div>
            </div>

            {/* Mini Chart */}
            <div>
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">
                    Sentiment History (Last {Math.min(history.length, 20)} Interactions)
                </p>
                {renderMiniChart()}
            </div>

            {/* Interaction Type Breakdown */}
            {(summary.EmailCount > 0 || summary.InterviewCount > 0 || summary.CallCount > 0 || summary.ChatCount > 0) && (
                <div className="flex flex-wrap gap-2">
                    {summary.EmailCount > 0 && (
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-[9px] font-bold uppercase">
                            {summary.EmailCount} Emails
                        </span>
                    )}
                    {summary.InterviewCount > 0 && (
                        <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[9px] font-bold uppercase">
                            {summary.InterviewCount} Interviews
                        </span>
                    )}
                    {summary.CallCount > 0 && (
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-bold uppercase">
                            {summary.CallCount} Calls
                        </span>
                    )}
                    {summary.ChatCount > 0 && (
                        <span className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-[9px] font-bold uppercase">
                            {summary.ChatCount} Chats
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default SentimentChart;
