import React from 'react';
import { MapPin, Users, Calendar, Trash2, ExternalLink, ShieldCheck, Target } from 'lucide-react';

const JobCard = ({ job, onDelete, onFindMatches, onOpenPipeline }) => {
    return (
        <div className="glass-card p-8 rounded-[2rem] hover:bg-indigo-500/[0.02] transition-all group relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors"></div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
                <div className="flex gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center font-black text-xl text-[var(--text-muted)] group-hover:text-indigo-400 transition-colors shrink-0">
                        {job.JobTitle.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h4 className="text-xl font-black group-hover:text-indigo-500 transition-colors">{job.JobTitle}</h4>
                            {job.IsActive && (
                                <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-emerald-500/20">
                                    <ShieldCheck size={10} /> Active
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-4 mt-3">
                            <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                <MapPin size={14} className="text-indigo-500/50" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{job.Location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                <Users size={14} className="text-indigo-500/50" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{job.Vacancies} Vacancies</span>
                            </div>
                            <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                <Calendar size={14} className="text-indigo-500/50" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">EXP: {job.MinExperience}+ YRS</span>
                            </div>
                        </div>

                        <p className="text-xs text-[var(--text-secondary)] font-medium mt-4 leading-relaxed line-clamp-2 max-w-xl opacity-70">
                            {job.Description}
                        </p>
                    </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-4 shrink-0">
                    <div className="text-right">
                        <div className="text-2xl font-black text-indigo-500">{job.ApplicationCount || 0}</div>
                        <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Applicants</div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onDelete(job.JobID)}
                            className="p-3 bg-[var(--bg-accent)] border border-[var(--border-primary)] hover:border-rose-500/30 hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 transition-all rounded-xl"
                            title="Archive Job"
                        >
                            <Trash2 size={16} />
                        </button>
                        <button
                            onClick={onOpenPipeline}
                            className="p-3 bg-[var(--bg-accent)] border border-[var(--border-primary)] hover:border-indigo-500/30 hover:bg-indigo-500/10 text-[var(--text-muted)] hover:text-indigo-500 transition-all rounded-xl flex items-center gap-2 group/pipe"
                            title="View Active Pipeline"
                        >
                            <ExternalLink size={16} className="group-hover/pipe:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest pr-1">Pipeline</span>
                        </button>
                        <button
                            onClick={onFindMatches}
                            className="p-3 bg-indigo-600 border border-indigo-500 hover:bg-indigo-500 text-white transition-all rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 group/match"
                            title="Find Best Matches"
                        >
                            <Target size={16} className="group-hover/match:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest pr-1">Match Talent</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobCard;
