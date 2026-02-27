import React, { useState } from 'react';
import { FileText, Upload, Play, Brain, MessageSquare, AlertCircle, CheckCircle, X, Mic, Activity, Target, Clock } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const InterviewTranscription = ({ scheduleId, candidateName, jobTitle, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [transcriptionId, setTranscriptionId] = useState(null);
    const [transcriptionText, setTranscriptionText] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState(null);
    const [step, setStep] = useState('upload'); // upload, process, results

    const handleCreateTranscription = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await axios.post(`${API_BASE}/interviews/transcription`, {
                scheduleId
            });

            if (res.data.success) {
                setTranscriptionId(res.data.transcriptionId);
                setStep('process');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create transcription record.');
        } finally {
            setLoading(false);
        }
    };

    const handleProcessTranscription = async () => {
        if (!transcriptionText.trim()) {
            setError('Please enter transcription text to process.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await axios.post(`${API_BASE}/interviews/transcription/${transcriptionId}/process`, {
                transcriptionText
            });

            if (res.data.success) {
                setAnalysis(res.data.analysis);
                setStep('results');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to process transcription.');
        } finally {
            setLoading(false);
        }
    };

    const getSentimentColor = (score) => {
        if (score >= 0.5) return 'text-emerald-500';
        if (score >= 0) return 'text-yellow-500';
        return 'text-rose-500';
    };

    const getSentimentLabel = (score) => {
        if (score >= 0.5) return 'Very Positive';
        if (score >= 0.2) return 'Positive';
        if (score >= -0.2) return 'Neutral';
        if (score >= -0.5) return 'Negative';
        return 'Very Negative';
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-card rounded-[3rem] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Interview Transcription</h2>
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">
                                {candidateName} • {jobTitle}
                            </p>
                        </div>
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--bg-accent)] transition-colors">
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 flex items-center gap-2">
                        <AlertCircle size={16} className="text-rose-500" />
                        <span className="text-xs font-bold text-rose-500">{error}</span>
                    </div>
                )}

                {/* Step 1: Upload/Create */}
                {step === 'upload' && (
                    <div className="space-y-6">
                        <div className="p-8 border-2 border-dashed border-violet-500/30 rounded-2xl text-center">
                            <Upload size={48} className="mx-auto text-violet-500 mb-4" />
                            <h3 className="text-lg font-black uppercase">Start Transcription</h3>
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mt-2">
                                Create a new transcription record for this interview
                            </p>
                            <button
                                onClick={handleCreateTranscription}
                                disabled={loading}
                                className="mt-6 px-8 py-4 bg-violet-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-violet-500 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Start Transcription'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Enter Transcription */}
                {step === 'process' && (
                    <div className="space-y-6">
                        <div className="p-4 bg-violet-500/10 rounded-xl border border-violet-500/20 flex items-center gap-3">
                            <CheckCircle size={20} className="text-violet-500" />
                            <span className="text-xs font-bold text-violet-500">Transcription record created. Enter interview transcript below.</span>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
                                <Mic size={14} />
                                Interview Transcript
                            </label>
                            <textarea
                                value={transcriptionText}
                                onChange={(e) => setTranscriptionText(e.target.value)}
                                placeholder="Enter the interview transcript here...&#10;&#10;Example: The candidate discussed their experience with React and Node.js. They mentioned leading a team of 5 developers..."
                                className="w-full h-64 p-4 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl text-sm focus:outline-none focus:border-violet-500 resize-none"
                            />
                            <p className="text-[8px] font-bold text-[var(--text-muted)] mt-2">
                                Enter the full interview transcript for AI analysis
                            </p>
                        </div>

                        <button
                            onClick={handleProcessTranscription}
                            disabled={loading || !transcriptionText.trim()}
                            className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-black uppercase tracking-widest hover:from-violet-500 hover:to-purple-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                'Processing...'
                            ) : (
                                <>
                                    <Brain size={20} />
                                    Analyze Transcription
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Step 3: Results */}
                {step === 'results' && analysis && (
                    <div className="space-y-6">
                        {/* Key Topics */}
                        <div className="p-6 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
                            <div className="flex items-center gap-3 mb-4">
                                <Target size={18} className="text-violet-500" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-violet-500">Key Topics</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {analysis.keyTopics.split(', ').map((topic, i) => (
                                    <span key={i} className="px-4 py-2 bg-violet-500/10 text-violet-500 rounded-full text-xs font-bold uppercase">
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Sentiment & Filler Words */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
                                <div className="flex items-center gap-3 mb-4">
                                    <Activity size={18} className={getSentimentColor(analysis.sentimentScore)} />
                                    <h3 className="text-xs font-black uppercase tracking-widest">Sentiment</h3>
                                </div>
                                <div className={`text-3xl font-black ${getSentimentColor(analysis.sentimentScore)}`}>
                                    {getSentimentLabel(analysis.sentimentScore)}
                                </div>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] mt-1">
                                    Score: {analysis.sentimentScore}
                                </p>
                            </div>

                            <div className="p-6 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
                                <div className="flex items-center gap-3 mb-4">
                                    <MessageSquare size={18} className="text-amber-500" />
                                    <h3 className="text-xs font-black uppercase tracking-widest">Filler Words</h3>
                                </div>
                                <div className="text-3xl font-black text-amber-500">
                                    {analysis.fillerWordCount}
                                </div>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] mt-1">
                                    occurrences detected
                                </p>
                            </div>
                        </div>

                        {/* Action Items */}
                        <div className="p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                            <div className="flex items-center gap-3 mb-4">
                                <CheckCircle size={18} className="text-emerald-500" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-emerald-500">Action Items</h3>
                            </div>
                            <ul className="space-y-2">
                                {analysis.actionItems.split('; ').map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm font-bold">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Transcript Preview */}
                        <div className="p-6 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
                            <div className="flex items-center gap-3 mb-4">
                                <FileText size={18} className="text-[var(--text-muted)]" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Transcript Preview</h3>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] line-clamp-6">
                                {transcriptionText}
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-[var(--bg-accent)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-2xl font-black uppercase tracking-widest hover:border-violet-500/30 transition-all"
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InterviewTranscription;
