import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Star, BrainCircuit, ShieldCheck, ChevronRight, X, Loader2, Target as TargetIcon, Sparkles, Info, User, MapPin, Briefcase, Award } from 'lucide-react';
import API_BASE from '../../apiConfig';
import SkillMatrix from './SkillMatrix';

const CandidateMatches = ({ job, isOpen, onClose }) => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [requiredSkills, setRequiredSkills] = useState([]);

    useEffect(() => {
        if (isOpen && job) {
            fetchMatches();
        }
    }, [isOpen, job]);

    const fetchMatches = async () => {
        setLoading(true);
        try {
            // Concurrent fetch for matches and job skills
            const [matchesRes, jobRes] = await Promise.all([
                axios.get(`${API_BASE}/jobs/${job.JobID}/matches`),
                axios.get(`${API_BASE}/jobs/${job.JobID}`)
            ]);

            setMatches(matchesRes.data);
            setRequiredSkills(jobRes.data.skills || []);
            setError('');
        } catch (err) {
            console.error("Fetch Matches Error:", err);
            setError('Failed to execute matching engine.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-end transition-opacity duration-300">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-[var(--bg-primary)] border-l border-[var(--border-primary)] w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                {/* Header */}
                <div className="p-8 border-b border-[var(--border-primary)] bg-[var(--bg-accent)] flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center relative">
                            <Target className="text-indigo-500" size={28} />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[var(--bg-primary)] animate-pulse"></div>
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight">Talent Match Engine</h2>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">Ranking candidates for: <span className="text-indigo-500">{job?.JobTitle}</span></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] hover:text-indigo-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40 space-y-6">
                            <div className="relative">
                                <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
                                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500/50 w-6 h-6 animate-pulse" />
                            </div>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest animate-pulse">Running Advanced Heuristics...</p>
                        </div>
                    ) : error ? (
                        <div className="p-10 rounded-[2.5rem] bg-rose-500/5 border border-rose-500/10 text-center">
                            <p className="text-rose-500 font-black text-xs uppercase tracking-widest">{error}</p>
                        </div>
                    ) : matches.length === 0 ? (
                        <div className="text-center py-20">
                            <Info className="mx-auto text-[var(--text-muted)] mb-6 opacity-30" size={48} />
                            <h4 className="text-lg font-black text-[var(--text-muted)] uppercase tracking-tighter">No Compatible Matches</h4>
                            <p className="text-xs text-[var(--text-muted)] font-bold mt-2 uppercase tracking-widest italic opacity-50">Try adjusting mandatory skill requirements</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {matches.map((candidate, idx) => (
                                <div key={candidate.CandidateID} className="glass-card p-8 rounded-[2.5rem] hover:bg-indigo-500/[0.02] transition-all group relative overflow-hidden">
                                    {/* Rank Badge */}
                                    <div className="absolute top-0 right-0 p-6 flex flex-col items-end">
                                        <div className="text-4xl font-black text-indigo-500 opacity-10 group-hover:opacity-30 transition-opacity">#{idx + 1}</div>
                                        <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{candidate.MatchCategory}</div>
                                    </div>

                                    <div className="flex items-start gap-6 relative z-10">
                                        <div className="w-20 h-20 rounded-3xl bg-[var(--bg-accent)] border border-[var(--border-primary)] flex items-center justify-center relative overflow-hidden shrink-0 group-hover:border-indigo-500/30 transition-colors">
                                            <User className="text-[var(--text-muted)] group-hover:text-indigo-500 transition-all scale-125" size={32} />
                                            <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-indigo-500/10 to-transparent"></div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-xl font-black group-hover:text-indigo-500 transition-colors">{candidate.FullName}</h4>
                                                <div className="flex gap-4 mt-2">
                                                    <div className="flex items-center gap-2 text-[var(--text-muted)] opacity-60">
                                                        <MapPin size={12} className="text-indigo-500/50" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{candidate.CandidateLocation}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[var(--text-muted)] font-bold">
                                                        <Briefcase size={12} className="text-indigo-500/50" />
                                                        <span className="text-[9px] uppercase tracking-widest">{candidate.YearsOfExperience} YRS EXP</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {(candidate.SkillSummary || '').split(', ').map((skill, sIdx) => (
                                                    <span key={sIdx} className="bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-muted)] text-[8px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="pt-4 flex items-center gap-8">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Technical Fit</span>
                                                    <div className="w-24 h-1.5 bg-[var(--bg-accent)] rounded-full overflow-hidden border border-[var(--border-primary)]">
                                                        <div
                                                            className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                                            style={{ width: `${candidate.TechnicalScore}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Match Score</span>
                                                    <span className="text-2xl font-black tracking-tighter">{candidate.TotalMatchScore}%</span>
                                                </div>
                                            </div>

                                            {/* Advanced Skill Matrix Visualization */}
                                            <SkillMatrix
                                                requiredSkills={requiredSkills}
                                                candidateSkills={(candidate.SkillSummary || '').split(', ')}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-8 flex items-center justify-between pt-6 border-t border-[var(--border-primary)]">
                                        <div className="flex items-center gap-3">
                                            <Award size={16} className="text-amber-500" />
                                            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest italic">{candidate.RecommendedAction}</p>
                                        </div>
                                        <button className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:translate-x-1 transition-all group/btn">
                                            Initiate Pipeline <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-[var(--border-primary)] bg-[var(--bg-accent)]">
                    <div className="glass-card bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-3xl flex items-center gap-5">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                            <Sparkles className="text-indigo-500" size={20} />
                        </div>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] leading-relaxed uppercase tracking-widest">
                            Heuristic matching utilizes <span className="text-[var(--text-primary)]">Technical Proficiency</span>, <span className="text-[var(--text-primary)]">Location Proximity</span>, and <span className="text-[var(--text-primary)]">Engagement History</span> for optimized ranking.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateMatches;
