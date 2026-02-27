import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Smile,
    Meh,
    Frown,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    MessageSquare,
    Mail,
    Phone,
    Video,
    Calendar,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    Plus,
    X,
    Send,
    BarChart3,
    PieChart,
    Loader2
} from 'lucide-react';
import API_BASE from '../../apiConfig';
import SentimentChart from '../Charts/SentimentChart';

/**
 * SentimentTracker - Full sentiment tracking component for candidates
 * Displays sentiment history, emotion breakdown, red flags, and interaction log
 */
const SentimentTracker = ({ candidateId, candidateName = 'Candidate' }) => {
    const [summary, setSummary] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [expandedSection, setExpandedSection] = useState('overview');
    const [refreshing, setRefreshing] = useState(false);

    // Fetch sentiment data
    const fetchSentimentData = async () => {
        if (!candidateId) {
            console.log('SentimentTracker: No candidateId provided');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('SentimentTracker: Fetching data for candidate:', candidateId);
            const [summaryRes, historyRes] = await Promise.all([
                axios.get(`${API_BASE}/candidates/${candidateId}/sentiment/summary`),
                axios.get(`${API_BASE}/candidates/${candidateId}/sentiment`)
            ]);

            console.log('SentimentTracker: Summary response:', summaryRes.data);
            console.log('SentimentTracker: History response:', historyRes.data);

            // Backend returns summary directly, not wrapped in { summary: ... }
            setSummary(summaryRes.data || null);
            setHistory(historyRes.data.history || []);
        } catch (err) {
            console.error('Error fetching sentiment data:', err);
            setError('Failed to load sentiment data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSentimentData();
    }, [candidateId]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchSentimentData();
        setRefreshing(false);
    };

    // Get emotion icon
    const getEmotionIcon = (emotion) => {
        const emotions = {
            happy: { icon: Smile, color: 'text-emerald-500' },
            excited: { icon: TrendingUp, color: 'text-green-500' },
            neutral: { icon: Meh, color: 'text-amber-500' },
            concerned: { icon: AlertTriangle, color: 'text-orange-500' },
            frustrated: { icon: Frown, color: 'text-rose-500' },
            anxious: { icon: TrendingDown, color: 'text-red-500' }
        };
        return emotions[emotion?.toLowerCase()] || emotions.neutral;
    };

    // Get interaction type icon
    const getInteractionIcon = (type) => {
        const types = {
            email: { icon: Mail, color: 'text-indigo-500' },
            interview: { icon: Video, color: 'text-amber-500' },
            call: { icon: Phone, color: 'text-emerald-500' },
            chat: { icon: MessageSquare, color: 'text-rose-500' }
        };
        return types[type?.toLowerCase()] || types.email;
    };

    // Loading state
    if (loading) {
        console.log('SentimentTracker: Rendering loading state');
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Loading Sentiment Data...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        console.log('SentimentTracker: Rendering error state:', error);
        return (
            <div className="glass-card p-8 rounded-[2.5rem] text-center">
                <AlertTriangle className="mx-auto text-rose-500 mb-4" size={32} />
                <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-4">{error}</p>
                <button
                    onClick={fetchSentimentData}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all"
                >
                    Retry
                </button>
            </div>
        );
    }

    // No data state
    console.log('SentimentTracker: Checking no data state. Summary:', summary, 'TotalInteractions:', summary?.TotalInteractions);
    if (!summary || summary.TotalInteractions === 0) {
        console.log('SentimentTracker: Rendering no data state');
        return (
            <>
                <div className="text-center py-8">
                    <BarChart3 className="mx-auto text-[var(--text-muted)] mb-3" size={32} />
                    <p className="text-[var(--text-muted)] mb-2">No sentiment data available yet</p>
                    <p className="text-[10px] text-[var(--text-muted)] mb-4">
                        Sentiment will be automatically analyzed from emails, interviews, and other interactions
                    </p>
                    <button
                        onClick={() => {
                            console.log('Add Interaction button clicked!');
                            setShowAddModal(true);
                        }}
                        className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 mx-auto transition-colors"
                    >
                        <Plus size={16} />
                        Add Interaction
                    </button>
                </div>

                {/* Add Interaction Modal */}
                {showAddModal && (
                    <AddInteractionModal
                        candidateId={candidateId}
                        onClose={() => setShowAddModal(false)}
                        onSuccess={() => {
                            setShowAddModal(false);
                            fetchSentimentData();
                        }}
                    />
                )}
            </>
        );
    }

    // Parse emotion breakdown if available
    const emotionBreakdown = summary.EmotionBreakdown ?
        (typeof summary.EmotionBreakdown === 'string' ? JSON.parse(summary.EmotionBreakdown) : summary.EmotionBreakdown) :
        {};

    // Parse red flags if available
    const redFlagsList = summary.RedFlagsDetected ?
        (typeof summary.RedFlagsDetected === 'string' ? JSON.parse(summary.RedFlagsDetected) : summary.RedFlagsDetected) :
        [];

    // Parse positive indicators if available
    const positiveIndicatorsList = summary.PositiveIndicators ?
        (typeof summary.PositiveIndicators === 'string' ? JSON.parse(summary.PositiveIndicators) : summary.PositiveIndicators) :
        [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-[var(--text-primary)]">
                        Sentiment Analysis
                    </h3>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
                        {candidateName}'s communication sentiment
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2 rounded-xl bg-[var(--bg-accent)] hover:bg-[var(--bg-secondary)] transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={16} className={`text-[var(--text-muted)] ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-3 py-2 bg-[var(--accent)] text-white rounded-xl text-sm font-bold flex items-center gap-2"
                    >
                        <Plus size={14} />
                        Add Interaction
                    </button>
                </div>
            </div>

            {/* Main Chart */}
            <div className="glass-card rounded-2xl p-6">
                <SentimentChart summary={summary} history={history} />
            </div>

            {/* Emotion Breakdown */}
            {Object.keys(emotionBreakdown).length > 0 && (
                <div className="glass-card rounded-2xl p-6">
                    <button
                        onClick={() => setExpandedSection(expandedSection === 'emotions' ? 'overview' : 'emotions')}
                        className="flex items-center justify-between w-full"
                    >
                        <div className="flex items-center gap-3">
                            <PieChart size={20} className="text-[var(--accent)]" />
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                                Emotion Breakdown
                            </p>
                        </div>
                        {expandedSection === 'emotions' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {expandedSection === 'emotions' && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.entries(emotionBreakdown).map(([emotion, count]) => {
                                const { icon: EmotionIcon, color } = getEmotionIcon(emotion);
                                const total = Object.values(emotionBreakdown).reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((count / total) * 100).toFixed(0) : 0;

                                return (
                                    <div key={emotion} className="p-3 bg-[var(--bg-accent)] rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <EmotionIcon size={16} className={color} />
                                            <span className="text-xs font-bold capitalize">{emotion}</span>
                                        </div>
                                        <div className="flex items-end gap-2">
                                            <span className={`text-xl font-black ${color}`}>{count}</span>
                                            <span className="text-[9px] text-[var(--text-muted)] mb-1">({percentage}%)</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Red Flags & Positive Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Red Flags */}
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle size={20} className="text-rose-500" />
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                            Red Flags Detected
                        </p>
                        <span className="ml-auto px-2 py-1 bg-rose-500/10 text-rose-500 rounded-full text-[9px] font-bold">
                            {redFlagsList.length}
                        </span>
                    </div>

                    {redFlagsList.length > 0 ? (
                        <ul className="space-y-2">
                            {redFlagsList.map((flag, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-primary)]">
                                    <span className="text-rose-500 mt-1">•</span>
                                    <span>{flag}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-[var(--text-muted)]">No red flags detected</p>
                    )}
                </div>

                {/* Positive Indicators */}
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingUp size={20} className="text-emerald-500" />
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                            Positive Indicators
                        </p>
                        <span className="ml-auto px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-bold">
                            {positiveIndicatorsList.length}
                        </span>
                    </div>

                    {positiveIndicatorsList.length > 0 ? (
                        <ul className="space-y-2">
                            {positiveIndicatorsList.map((indicator, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-primary)]">
                                    <span className="text-emerald-500 mt-1">•</span>
                                    <span>{indicator}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-[var(--text-muted)]">No positive indicators recorded</p>
                    )}
                </div>
            </div>

            {/* Interaction History */}
            <div className="glass-card rounded-2xl p-6">
                <button
                    onClick={() => setExpandedSection(expandedSection === 'history' ? 'overview' : 'history')}
                    className="flex items-center justify-between w-full"
                >
                    <div className="flex items-center gap-3">
                        <Calendar size={20} className="text-[var(--accent)]" />
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                            Interaction History
                        </p>
                        <span className="px-2 py-1 bg-[var(--bg-accent)] rounded-full text-[9px] font-bold text-[var(--text-muted)]">
                            {history.length} records
                        </span>
                    </div>
                    {expandedSection === 'history' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {expandedSection === 'history' && (
                    <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
                        {history.length > 0 ? (
                            history.map((item, i) => {
                                const { icon: InteractionIcon, color } = getInteractionIcon(item.InteractionType);
                                const sentimentColor = item.SentimentScore >= 0.2 ? 'text-emerald-500' :
                                    item.SentimentScore <= -0.2 ? 'text-rose-500' : 'text-amber-500';

                                return (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-[var(--bg-accent)] rounded-xl">
                                        <InteractionIcon size={16} className={`${color} mt-1`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold capitalize">{item.InteractionType}</span>
                                                <span className={`text-xs font-black ${sentimentColor}`}>
                                                    {item.SentimentScore?.toFixed(2) || 'N/A'}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-[var(--text-muted)] mt-1 truncate">
                                                {item.InteractionContent || 'No content preview'}
                                            </p>
                                            <p className="text-[9px] text-[var(--text-muted)] mt-1">
                                                {item.AnalyzedAt ? new Date(item.AnalyzedAt).toLocaleDateString() : 'Unknown date'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-center text-[var(--text-muted)] py-4">No interaction history</p>
                        )}
                    </div>
                )}
            </div>

            {/* Add Interaction Modal */}
            {showAddModal && (
                <AddInteractionModal
                    candidateId={candidateId}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        fetchSentimentData();
                    }}
                />
            )}
        </div>
    );
};

/**
 * AddInteractionModal - Modal for manually adding an interaction for sentiment analysis
 */
const AddInteractionModal = ({ candidateId, onClose, onSuccess }) => {
    const [interactionType, setInteractionType] = useState('email');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) {
            setError('Please enter interaction content');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await axios.post(`${API_BASE}/candidates/${candidateId}/sentiment`, {
                interactionType,
                rawText: content.trim()
            });
            onSuccess();
        } catch (err) {
            console.error('Error adding interaction:', err);
            setError(err.response?.data?.error || 'Failed to add interaction');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="glass-card rounded-3xl p-8 w-full max-w-lg animate-in zoom-in">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-[var(--text-primary)]">
                        Add Interaction
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--bg-accent)] rounded-xl">
                        <X size={20} className="text-[var(--text-muted)]" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Interaction Type */}
                    <div>
                        <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">
                            Interaction Type
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { type: 'email', icon: Mail, label: 'Email' },
                                { type: 'interview', icon: Video, label: 'Interview' },
                                { type: 'call', icon: Phone, label: 'Call' },
                                { type: 'chat', icon: MessageSquare, label: 'Chat' }
                            ].map(({ type, icon: Icon, label }) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setInteractionType(type)}
                                    className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-colors ${interactionType === type
                                        ? 'bg-[var(--accent)] text-white'
                                        : 'bg-[var(--bg-accent)] text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span className="text-[9px] font-bold uppercase">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">
                            Interaction Content
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={5}
                            placeholder="Paste the email, chat transcript, or notes from the interaction..."
                            className="w-full px-4 py-3 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                            <p className="text-sm text-rose-500">{error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-[var(--bg-accent)] text-[var(--text-primary)] rounded-xl text-sm font-bold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-[var(--accent)] text-white rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Send size={14} />
                                    Analyze Sentiment
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SentimentTracker;
