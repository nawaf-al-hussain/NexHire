import React from 'react';
import { Calendar, Clock, MapPin, User, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const CandidateInterviews = ({ interviews, loading, onConfirm }) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Fetching Schedule...</p>
            </div>
        );
    }

    if (interviews.length === 0) {
        return (
            <div className="p-12 border-2 border-dashed border-[var(--border-primary)] rounded-[3rem] text-center bg-[var(--bg-accent)]/5">
                <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-40">No interviews scheduled yet.</p>
            </div>
        );
    }

    const handleConfirm = async (scheduleID) => {
        try {
            await axios.post(`${API_BASE}/candidates/confirm-interview`, { scheduleID });
            if (onConfirm) onConfirm();
        } catch (err) {
            console.error("Confirm Interview Error:", err);
            alert("Failed to confirm interview.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-black uppercase tracking-tighter">Upcoming Interviews</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {interviews.map((interview) => (
                    <div key={interview.ScheduleID} className="group bg-[var(--bg-accent)] p-8 rounded-[2.5rem] border border-[var(--border-primary)] hover:border-indigo-500/50 transition-all relative overflow-hidden">
                        <div className="flex items-start justify-between mb-6">
                            <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                                <Calendar className="w-6 h-6 text-indigo-500" />
                            </div>
                            <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${interview.CandidateConfirmed ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                                {interview.CandidateConfirmed ? 'Confirmed' : 'Action Required'}
                            </div>
                        </div>

                        <h4 className="text-xl font-black mb-1 leading-tight">{interview.JobTitle}</h4>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-6">Round: Technical Assessment</p>

                        <div className="space-y-3 mb-8">
                            <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                                <Clock size={14} className="text-indigo-500" />
                                <span className="text-xs font-bold">{new Date(interview.InterviewStart).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                                <MapPin size={14} className="text-indigo-500" />
                                <span className="text-xs font-bold">{interview.JobLocation} (Remote)</span>
                            </div>
                            <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                                <User size={14} className="text-indigo-500" />
                                <span className="text-xs font-bold">Interviewer: {interview.RecruiterName}</span>
                            </div>
                        </div>

                        {interview.CandidateConfirmed ? (
                            <button className="w-full py-4 bg-indigo-500/10 text-indigo-500 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-500/20 transition-all">
                                <ExternalLink size={14} /> Join Meeting
                            </button>
                        ) : (
                            <button
                                onClick={() => handleConfirm(interview.ScheduleID)}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all"
                            >
                                Confirm Attendance
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CandidateInterviews;
