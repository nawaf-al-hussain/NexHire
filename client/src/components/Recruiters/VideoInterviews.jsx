import React from 'react';
import { Video, Calendar, Clock, Play, FileText, CheckCircle, ExternalLink, MessageSquarePlus, RefreshCw } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';
import InterviewFeedback from './InterviewFeedback';
import InterviewTranscription from './InterviewTranscription';

const VideoInterviews = () => {
    const [interviews, setInterviews] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [feedbackModal, setFeedbackModal] = React.useState(null);
    const [transcriptionModal, setTranscriptionModal] = React.useState(null);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE}/interviews`);
                if (res.data && Array.isArray(res.data)) {
                    setInterviews(res.data);
                }
            } catch (err) {
                console.error("Video Interviews Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Sample data for demo purposes when no interviews exist
    const sampleData = [
        { ScheduleID: 1, CandidateName: 'John Smith', JobTitle: 'Senior Developer', Platform: 'Zoom', InterviewStart: new Date(Date.now() + 86400000).toISOString(), Duration: 45, Status: 'Upcoming', ApplicationID: 1 },
        { ScheduleID: 2, CandidateName: 'Sarah Johnson', JobTitle: 'UX Designer', Platform: 'Microsoft Teams', InterviewStart: new Date(Date.now() + 172800000).toISOString(), Duration: 30, Status: 'Upcoming', ApplicationID: 2 },
        { ScheduleID: 3, CandidateName: 'Mike Brown', JobTitle: 'Data Analyst', Platform: 'Google Meet', InterviewStart: new Date(Date.now() - 86400000).toISOString(), Duration: 45, Status: 'Completed', ApplicationID: 3 }
    ];

    // Use real data from API, fallback to sample data
    const displayData = interviews.length > 0 ? interviews : sampleData;
    const upcoming = displayData.filter(i => i.Status === 'Upcoming' || i.Status === 'Scheduled');
    const completed = displayData.filter(i => i.Status === 'Completed');

    const getPlatformColor = (platform) => {
        if (platform === 'Zoom') return 'bg-blue-500/10 border-blue-500/30 text-blue-500';
        if (platform === 'Microsoft Teams') return 'bg-purple-500/10 border-purple-500/30 text-purple-500';
        if (platform === 'Google Meet') return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500';
        return 'bg-slate-500/10 border-slate-500/30 text-slate-500';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                <span className="ml-3 text-sm font-black uppercase tracking-widest text-[var(--text-muted)]">Loading Video Interviews...</span>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="glass-card rounded-[3rem] p-8 bg-gradient-to-r from-violet-500/5 to-purple-500/5 border border-violet-500/20">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                        <Video size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Video Interviews</h2>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Manage video interview scheduling</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card rounded-[2rem] p-6 border border-violet-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Calendar size={18} className="text-violet-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-violet-500">Upcoming</span>
                    </div>
                    <div className="text-3xl font-black">{upcoming.length}</div>
                </div>
                <div className="glass-card rounded-[2rem] p-6 border border-emerald-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle size={18} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Completed</span>
                    </div>
                    <div className="text-3xl font-black">{completed.length}</div>
                </div>
                <div className="glass-card rounded-[2rem] p-6 border border-blue-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Clock size={18} className="text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Total Hours</span>
                    </div>
                    <div className="text-3xl font-black">{displayData.reduce((sum, i) => sum + (i.Duration || 0), 0)}</div>
                </div>
            </div>

            {/* Upcoming Interviews Section */}
            {upcoming.length > 0 && (
                <div className="glass-card rounded-[3rem] p-10">
                    <h3 className="text-lg font-black uppercase tracking-tight mb-8">Upcoming Video Interviews</h3>
                    <div className="space-y-4">
                        {upcoming.map((interview, i) => (
                            <div key={i} className="p-6 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)] hover:border-violet-500/30 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                                            <Video size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black">{interview.CandidateName}</h4>
                                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">{interview.JobTitle}</p>
                                            <span className={`inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase border mt-2 ${getPlatformColor(interview.Platform)}`}>
                                                {interview.Platform || 'Video Call'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-xs font-black">{interview.InterviewStart ? new Date(interview.InterviewStart).toLocaleDateString() : 'N/A'}</div>
                                            <div className="text-[10px] font-bold text-violet-500">{interview.InterviewStart ? new Date(interview.InterviewStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                                        </div>
                                        <button className="px-6 py-3 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-violet-500">
                                            <ExternalLink size={14} /> Join
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Past Interviews with Feedback Option */}
            <div className="glass-card rounded-[3rem] p-10">
                <h3 className="text-lg font-black uppercase tracking-tight mb-8">Past Video Interviews</h3>
                <div className="space-y-4">
                    {completed.map((interview, i) => (
                        <div key={i} className="p-6 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)] hover:border-emerald-500/30 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <Video size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black">{interview.CandidateName}</h4>
                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">{interview.JobTitle}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-xs font-black">{interview.InterviewStart ? new Date(interview.InterviewStart).toLocaleDateString() : 'N/A'}</div>
                                    </div>
                                    {/* Feedback Button - only if ApplicationID is available */}
                                    {interview.ApplicationID && (
                                        <>
                                            <button
                                                onClick={() => setTranscriptionModal({
                                                    scheduleId: interview.ScheduleID,
                                                    candidateName: interview.CandidateName,
                                                    jobTitle: interview.JobTitle
                                                })}
                                                className="px-6 py-3 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-violet-500"
                                            >
                                                <FileText size={14} /> Transcription
                                            </button>
                                            <button
                                                onClick={() => setFeedbackModal({
                                                    applicationId: interview.ApplicationID,
                                                    candidateName: interview.CandidateName,
                                                    jobTitle: interview.JobTitle
                                                })}
                                                className="px-6 py-3 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-purple-500"
                                            >
                                                <MessageSquarePlus size={14} /> Feedback
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {completed.length === 0 && <div className="text-center py-10 text-[10px] font-bold text-[var(--text-muted)] uppercase">No past video interviews</div>}
                </div>
            </div>

            {/* Feedback Modal */}
            {feedbackModal && (
                <InterviewFeedback
                    applicationId={feedbackModal.applicationId}
                    candidateName={feedbackModal.candidateName}
                    jobTitle={feedbackModal.jobTitle}
                    onClose={() => setFeedbackModal(null)}
                    onSubmitSuccess={() => {
                        // Optionally refresh data
                    }}
                />
            )}

            {/* Transcription Modal */}
            {transcriptionModal && (
                <InterviewTranscription
                    scheduleId={transcriptionModal.scheduleId}
                    candidateName={transcriptionModal.candidateName}
                    jobTitle={transcriptionModal.jobTitle}
                    onClose={() => setTranscriptionModal(null)}
                />
            )}
        </div>
    );
};

export default VideoInterviews;
