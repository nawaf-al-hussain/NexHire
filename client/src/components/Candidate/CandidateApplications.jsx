import React, { useState } from 'react';
import axios from 'axios';
import { CheckCircle2, ChevronRight, ChevronDown, MapPin, Briefcase, Users, Star, AlertTriangle, X } from 'lucide-react';
import API_BASE from '../../apiConfig';

const STATUS_STEPS = ['Applied', 'Screening', 'Interview', 'Hired'];

const getStatusColor = (status) => {
    switch (status) {
        case 'Hired': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        case 'Rejected': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
        case 'Withdrawn': return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        case 'Interview': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        case 'Screening': return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
        default: return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
    }
};

const stepActive = (stepName, currentStatus) => {
    const order = { 'Applied': 1, 'Screening': 2, 'Interview': 3, 'Hired': 4 };
    return (order[currentStatus] || 0) >= (order[stepName] || 99);
};

const CandidateApplications = ({ applications, loading, onRefresh }) => {
    const [expandedApp, setExpandedApp] = useState(null);

    const handleWithdraw = async (applicationID) => {
        const reason = prompt("Please provide a reason for withdrawal:");
        if (reason === null) return;

        try {
            await axios.post(`${API_BASE}/candidates/withdraw`, { applicationID, reason: reason || 'N/A' });
            alert("Application withdrawn successfully.");
            if (onRefresh) onRefresh();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to withdraw application.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Loading Applications...</p>
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="p-12 border-2 border-dashed border-[var(--border-primary)] rounded-[3rem] text-center bg-[var(--bg-accent)]/5">
                <Briefcase className="w-12 h-12 text-indigo-500/20 mx-auto mb-4" />
                <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-40">No active applications found.</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-2 opacity-30">Use <strong>Discover Jobs</strong> to apply for your first role.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-8">
                <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-black uppercase tracking-tighter">Your Application Journey</h2>
                <span className="ml-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest">{applications.length} Total</span>
            </div>

            {applications.map((app) => {
                const isExpanded = expandedApp === app.ApplicationID;
                const canWithdraw = ['Applied', 'Screening', 'Interview'].includes(app.StatusName);

                return (
                    <div key={app.ApplicationID} className={`rounded-[2.5rem] border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-indigo-500/30 bg-indigo-500/[0.02]' : 'border-[var(--border-primary)] bg-[var(--bg-accent)]'}`}>

                        {/* Card Header — always visible */}
                        <div
                            className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer group"
                            onClick={() => setExpandedApp(isExpanded ? null : app.ApplicationID)}
                        >
                            <div className="flex gap-5 items-center">
                                <div className="w-14 h-14 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center font-black text-sm text-[var(--text-muted)] group-hover:text-indigo-500 transition-colors shrink-0">
                                    {(app.JobTitle || '?').substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="text-base font-black group-hover:text-indigo-500 transition-colors leading-tight">{app.JobTitle}</h4>
                                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1">
                                        {app.Location && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                                                <MapPin size={10} className="text-indigo-500" /> {app.Location}
                                            </span>
                                        )}
                                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                                            Applied {new Date(app.AppliedDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                                <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusColor(app.StatusName)}`}>
                                    {app.StatusName}
                                </div>
                                {canWithdraw && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleWithdraw(app.ApplicationID); }}
                                        className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                                    >
                                        Withdraw
                                    </button>
                                )}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text-muted)] transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                                    <ChevronRight size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Progress Timeline */}
                        <div className="px-8 pb-6 flex items-center justify-between border-t border-[var(--border-primary)]">
                            {STATUS_STEPS.map((step, i) => (
                                <React.Fragment key={step}>
                                    <div className="flex flex-col items-center gap-1 z-10">
                                        <div className={`w-3 h-3 rounded-full transition-all ${stepActive(step, app.StatusName) && app.StatusName !== 'Rejected' && app.StatusName !== 'Withdrawn' ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-[var(--border-primary)]'}`}></div>
                                        <span className={`text-[8px] font-black uppercase tracking-widest hidden md:block ${stepActive(step, app.StatusName) && app.StatusName !== 'Rejected' ? 'text-emerald-500' : 'text-[var(--text-muted)] opacity-40'}`}>{step}</span>
                                    </div>
                                    {i < STATUS_STEPS.length - 1 && (
                                        <div className={`flex-1 h-[2px] transition-all ${stepActive(STATUS_STEPS[i + 1], app.StatusName) && app.StatusName !== 'Rejected' && app.StatusName !== 'Withdrawn' ? 'bg-emerald-500' : 'bg-[var(--border-primary)]'}`}></div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Expanded Job Detail Panel */}
                        {isExpanded && (
                            <div className="px-8 pb-8 space-y-6 border-t border-indigo-500/10 pt-6 animate-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {app.MinExperience !== undefined && (
                                        <div className="p-4 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)]">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Min. Experience</p>
                                            <p className="text-sm font-black">{app.MinExperience} yr{app.MinExperience !== 1 ? 's' : ''}</p>
                                        </div>
                                    )}
                                    {app.Vacancies !== undefined && (
                                        <div className="p-4 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)]">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Openings</p>
                                            <p className="text-sm font-black">{app.Vacancies}</p>
                                        </div>
                                    )}
                                    {app.MatchScore !== undefined && app.MatchScore !== null && (
                                        <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-500 mb-1">Match Score</p>
                                            <p className="text-sm font-black text-indigo-500">{Math.round(app.MatchScore)}%</p>
                                        </div>
                                    )}
                                </div>

                                {app.Description && (
                                    <div className="p-5 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)]">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Job Description</p>
                                        <p className="text-xs leading-relaxed text-[var(--text-secondary)] line-clamp-6">{app.Description}</p>
                                    </div>
                                )}

                                {app.RejectionReason && (
                                    <div className="p-4 bg-rose-500/5 rounded-2xl border border-rose-500/20 flex items-start gap-3">
                                        <AlertTriangle size={16} className="text-rose-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-rose-500 mb-1">Rejection Reason</p>
                                            <p className="text-xs text-[var(--text-secondary)]">{app.RejectionReason}</p>
                                        </div>
                                    </div>
                                )}

                                {app.WithdrawalReason && (
                                    <div className="p-4 bg-slate-500/5 rounded-2xl border border-slate-500/20 flex items-start gap-3">
                                        <X size={16} className="text-slate-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Withdrawal Reason</p>
                                            <p className="text-xs text-[var(--text-secondary)]">{app.WithdrawalReason}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default CandidateApplications;
