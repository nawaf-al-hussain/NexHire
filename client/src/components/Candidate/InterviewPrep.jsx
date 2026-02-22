import React, { useState } from 'react';
import { FileText, Video, CheckCircle, Clock, Sparkles, Loader2, Play } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const InterviewPrep = ({ prepMaterials, loading, onGenerate, applications }) => {
    const [generating, setGenerating] = React.useState(false);
    const [selectedJob, setSelectedJob] = React.useState('');

    const handleGenerate = async () => {
        if (!selectedJob) {
            alert('Please select a job first.');
            return;
        }
        setGenerating(true);
        try {
            await axios.post(`${API_BASE}/candidates/interview-prep/generate`, { jobID: selectedJob });
            alert('Interview prep generated successfully!');
        } catch (err) {
            console.error('Generate Interview Prep Error:', err);
            alert('Failed to generate interview prep. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    if (loading || generating) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                    {generating ? 'Generating Interview Prep...' : 'Loading Interview Materials...'}
                </p>
            </div>
        );
    }

    // Sample prep data
    const samplePrep = [
        { title: 'System Design Fundamentals', type: 'Video', duration: '45 min', difficulty: 'Intermediate' },
        { title: 'Behavioral Questions Guide', type: 'Article', duration: '15 min', difficulty: 'Beginner' },
        { title: 'Code Challenge Practice', type: 'Lab', duration: '60 min', difficulty: 'Advanced' }
    ];

    const displayData = (prepMaterials && prepMaterials.length > 0) ? prepMaterials : samplePrep;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-lg font-black uppercase tracking-tighter">Interview Preparation</h2>
                </div>
            </div>

            {/* Generate New Prep */}
            <div className="glass-card p-8 rounded-[2.5rem]">
                <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Generate Personalized Prep</h3>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <select
                        value={selectedJob}
                        onChange={(e) => setSelectedJob(e.target.value)}
                        className="flex-1 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500"
                    >
                        <option value="">Select a job you've applied for...</option>
                        {applications && applications.map((app) => (
                            <option key={app.ApplicationID} value={app.JobID}>
                                {app.JobTitle} - {app.StatusName}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        <Sparkles size={16} />
                        Generate Prep
                    </button>
                </div>
            </div>

            {/* Prep Materials */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {displayData.map((prep, index) => (
                    <div
                        key={index}
                        className="glass-card p-8 rounded-[2.5rem] hover:border-indigo-500/30 transition-all group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                    {prep.type === 'Video' ? (
                                        <Video className="w-6 h-6 text-indigo-500" />
                                    ) : prep.type === 'Article' ? (
                                        <FileText className="w-6 h-6 text-amber-500" />
                                    ) : (
                                        <Play className="w-6 h-6 text-rose-500" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black">{prep.title || 'Interview Question Patterns'}</h3>
                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">
                                        {prep.type || 'Video'} • {prep.duration || '30 min'}
                                    </p>
                                </div>
                            </div>
                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${(prep.difficulty || 'Intermediate') === 'Advanced'
                                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                    : (prep.difficulty || 'Intermediate') === 'Beginner'
                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                }`}>
                                {prep.difficulty || 'Intermediate'}
                            </span>
                        </div>

                        <p className="text-xs text-[var(--text-muted)] mb-6 line-clamp-2">
                            Master common interview patterns and questions for {prep.difficulty || 'all levels'} candidates.
                            Includes detailed explanations and sample answers.
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-primary)]">
                            <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)]">
                                <Clock size={14} />
                                {prep.duration || '30 min'} remaining
                            </div>
                            <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all">
                                <Play size={14} />
                                Start
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tips */}
            <div className="bg-[var(--bg-accent)] rounded-[2.5rem] p-8 border border-[var(--border-primary)]">
                <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Interview Success Tips</h3>
                </div>
                <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                        Practice the STAR method for behavioral questions
                    </li>
                    <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                        Review the job description for key skills to highlight
                    </li>
                    <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                        Prepare your own questions for the interviewer
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default InterviewPrep;
