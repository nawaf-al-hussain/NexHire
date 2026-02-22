import React, { useState } from 'react';
import { FileText, CheckCircle, AlertCircle, Loader2, TrendingUp } from 'lucide-react';

const ResumeScore = ({ resumeData, loading }) => {
    const [analyzing, setAnalyzing] = useState(false);

    if (loading || analyzing) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                    {analyzing ? 'Analyzing Resume...' : 'Loading Resume Analysis...'}
                </p>
            </div>
        );
    }

    // Default data if none exists
    const data = resumeData || {
        overallScore: 72,
        factors: [
            { factor: 'Good length', points: 20 },
            { factor: 'Skills section complete', points: 30 },
            { factor: 'Strong experience', points: 25 },
            { factor: 'Add a professional summary', points: 0 }
        ]
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-500';
        if (score >= 60) return 'text-amber-500';
        return 'text-rose-500';
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
                <FileText className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-black uppercase tracking-tighter">Resume Score</h2>
            </div>

            {/* Overall Score */}
            <div className="glass-card p-8 rounded-[2.5rem]">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black uppercase tracking-widest">Overall Quality Score</h3>
                    <span className={`text-4xl font-black ${getScoreColor(data.overallScore)}`}>
                        {data.overallScore}/100
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-6 bg-[var(--bg-accent)] rounded-full overflow-hidden mb-6">
                    <div
                        className={`h-full transition-all duration-1000 ${data.overallScore >= 80 ? 'bg-emerald-500' :
                                data.overallScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                        style={{ width: `${data.overallScore}%` }}
                    ></div>
                </div>

                <p className="text-xs text-[var(--text-muted)] text-center">
                    {data.overallScore >= 80 ? 'Excellent resume! You\'re ready to apply.' :
                        data.overallScore >= 60 ? 'Good resume. Consider improving the factors below.' :
                            'Needs improvement. Update your resume to increase your chances.'}
                </p>
            </div>

            {/* Factors */}
            <div className="glass-card p-8 rounded-[2.5rem]">
                <h3 className="text-sm font-black uppercase tracking-widest mb-6">Score Factors</h3>

                <div className="space-y-4">
                    {data.factors && data.factors.map((factor, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
                            <div className="flex items-center gap-3">
                                {factor.points > 0 ? (
                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-rose-500" />
                                )}
                                <span className="text-xs font-black">{factor.factor}</span>
                            </div>
                            <span className={`text-xs font-black ${factor.points > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                +{factor.points} pts
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tips */}
            <div className="bg-[var(--bg-accent)] rounded-[2.5rem] p-8 border border-[var(--border-primary)]">
                <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest">How to Improve</h3>
                </div>
                <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                        Add a compelling professional summary at the top
                    </li>
                    <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                        Include quantifiable achievements (e.g., "increased sales by 25%")
                    </li>
                    <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                        Tailor your skills section to match job requirements
                    </li>
                    <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                        Keep it to 1-2 pages maximum
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default ResumeScore;
