import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, ArrowRight, CheckCircle2, XCircle, Clock, User, Briefcase, ChevronRight, ShieldCheck, Loader2, Sparkles, Calendar } from 'lucide-react';
import API_BASE from '../../apiConfig';
import ScheduleInterviewModal from './ScheduleInterviewModal';

const ApplicationPipeline = ({ job, isOpen, onClose }) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // applicationID
    const [schedulingApp, setSchedulingApp] = useState(null);
    const [error, setError] = useState('');

    const stages = [
        { id: 1, name: 'Applied', icon: Clock, color: 'text-slate-500' },
        { id: 2, name: 'Screening', icon: Briefcase, color: 'text-indigo-400' },
        { id: 3, name: 'Interview', icon: User, color: 'text-amber-400' },
        { id: 4, name: 'Hired', icon: CheckCircle2, color: 'text-emerald-500' },
        { id: 5, name: 'Rejected', icon: XCircle, color: 'text-rose-500' }
    ];

    useEffect(() => {
        if (isOpen && job) {
            fetchApplications();
        }
    }, [isOpen, job]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/jobs/${job.JobID}/applications`);
            setApplications(res.data);
            setError('');
        } catch (err) {
            console.error("Fetch Applications Error:", err);
            setError('Failed to load application pipeline.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (applicationID, newStatusID) => {
        setActionLoading(applicationID);
        try {
            if (newStatusID === 4) {
                // Hiring process
                await axios.post(`${API_BASE}/applications/${applicationID}/hire`);
            } else {
                await axios.put(`${API_BASE}/applications/${applicationID}/status`, {
                    statusID: newStatusID
                });
            }
            await fetchApplications(); // Refresh list
        } catch (err) {
            alert(err.response?.data?.error || "Status update failed.");
        } finally {
            setActionLoading(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 transition-all duration-300">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose}></div>

            <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-primary)] w-full max-w-7xl h-[85vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300 text-[var(--text-primary)]">
                {/* Header */}
                <div className="p-10 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-accent)]/20">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                            <Briefcase className="text-indigo-500" size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">{job?.JobTitle}</h2>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">Application Pipeline Management</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-6 py-3 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
                            <ShieldCheck size={16} className="text-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{job?.Vacancies} Openings Remaining</span>
                        </div>
                        <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-[var(--bg-accent)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] hover:text-indigo-500 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Pipeline Board */}
                <div className="flex-1 flex gap-6 p-10 overflow-x-auto bg-[var(--bg-secondary)]">
                    {stages.map(stage => {
                        const stageApps = applications.filter(app => app.StatusID === stage.id);
                        return (
                            <div key={stage.id} className="min-w-[320px] max-w-[320px] flex flex-col gap-6">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-[var(--bg-accent)] ${stage.color}`}>
                                            <stage.icon size={16} />
                                        </div>
                                        <h3 className="text-xs font-black uppercase tracking-widest">{stage.name}</h3>
                                    </div>
                                    <span className="text-[10px] font-black text-[var(--text-muted)] bg-[var(--bg-accent)] px-3 py-1 rounded-full">{stageApps.length}</span>
                                </div>

                                <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar pb-10">
                                    {loading ? (
                                        <div className="flex justify-center py-20">
                                            <Loader2 className="w-8 h-8 text-indigo-500/20 animate-spin" />
                                        </div>
                                    ) : stageApps.length === 0 ? (
                                        <div className="border-2 border-dashed border-[var(--border-primary)] rounded-[2rem] h-32 flex items-center justify-center bg-[var(--bg-accent)]/10">
                                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-20">Empty Stage</p>
                                        </div>
                                    ) : (
                                        stageApps.map(app => (
                                            <div key={app.ApplicationID} className="glass-card p-6 rounded-[2rem] hover:bg-indigo-500/[0.02] transition-all group active:scale-95">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-primary)] flex items-center justify-center font-black text-xs text-[var(--text-muted)] group-hover:text-indigo-500">
                                                        {app.FullName.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Applied</div>
                                                        <div className="text-[9px] font-black uppercase tracking-widest">{new Date(app.AppliedDate).toLocaleDateString()}</div>
                                                    </div>
                                                </div>

                                                <h4 className="text-sm font-black">{app.FullName}</h4>
                                                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1 italic">{app.ExperienceLabel || 'Mid-Level'} • {app.CandidateLocation}</p>

                                                <div className="mt-6 pt-4 border-t border-[var(--border-primary)] flex items-center justify-between">
                                                    <div className="text-[10px] font-black text-indigo-500">
                                                        {app.MatchScore ? `${app.MatchScore}% Match` : 'Processing...'}
                                                    </div>

                                                    {actionLoading === app.ApplicationID ? (
                                                        <Loader2 size={14} className="text-indigo-500 animate-spin" />
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            {stage.id < 4 && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(app.ApplicationID, stage.id + 1)}
                                                                    className="p-2 bg-[var(--bg-accent)] text-[var(--text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-all"
                                                                    title="Next Stage"
                                                                >
                                                                    <ArrowRight size={14} />
                                                                </button>
                                                            )}
                                                            {/* ... Finalize Hire button logic (kept same as stage.id === 3 condition above) */}
                                                            {stage.id === 3 && (
                                                                <>
                                                                    <button
                                                                        onClick={() => setSchedulingApp(app)}
                                                                        className="p-2 mr-2 bg-[var(--bg-accent)] text-[var(--text-muted)] hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
                                                                        title="Schedule Interview"
                                                                    >
                                                                        <Calendar size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(app.ApplicationID, 4)}
                                                                        className="px-3 py-1.5 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20"
                                                                    >
                                                                        Finalize Hire
                                                                    </button>
                                                                </>
                                                            )}
                                                            {stage.id < 4 && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(app.ApplicationID, 5)}
                                                                    className="p-2 bg-[var(--bg-accent)] text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                                                    title="Reject"
                                                                >
                                                                    <XCircle size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Info */}
                <div className="p-8 border-t border-[var(--border-primary)] bg-[var(--bg-accent)]/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Sparkles className="text-amber-500" size={18} />
                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Automated screening enabled. Minimal vacancy locking active.</p>
                    </div>
                    <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-30">
                        NexHire Intelligence Pipeline v2.0
                    </div>
                </div>
            </div>

            {schedulingApp && (
                <ScheduleInterviewModal
                    isOpen={!!schedulingApp}
                    onClose={() => setSchedulingApp(null)}
                    application={schedulingApp}
                    onScheduled={() => {
                        fetchApplications(); // Refresh list to show confirmed states
                    }}
                />
            )}
        </div>
    );
};

export default ApplicationPipeline;
