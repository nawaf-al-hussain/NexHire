import React from 'react';
import { Video, Calendar, Clock, Play, FileText, CheckCircle, ExternalLink } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const VideoInterviews = () => {
    const [interviews, setInterviews] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

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

    const sampleData = [
        { CandidateName: 'John Smith', JobTitle: 'Senior Developer', Platform: 'Zoom', ScheduledAt: '2026-02-25T10:00:00', Duration: 45, RecordingConsent: true, Status: 'Scheduled' },
        { CandidateName: 'Sarah Johnson', JobTitle: 'UX Designer', Platform: 'Microsoft Teams', ScheduledAt: '2026-02-25T14:00:00', Duration: 30, RecordingConsent: true, Status: 'Scheduled' },
        { CandidateName: 'Mike Brown', JobTitle: 'Data Analyst', Platform: 'Google Meet', ScheduledAt: '2026-02-24T11:00:00', Duration: 45, RecordingConsent: false, Status: 'Completed' }
    ];

    const displayData = interviews.length > 0 ? interviews : sampleData;
    const upcoming = displayData.filter(i => i.Status === 'Scheduled');
    const completed = displayData.filter(i => i.Status === 'Completed');

    const getPlatformColor = (platform) => {
        if (platform === 'Zoom') return 'bg-blue-500/10 border-blue-500/30 text-blue-500';
        if (platform === 'Microsoft Teams') return 'bg-purple-500/10 border-purple-500/30 text-purple-500';
        if (platform === 'Google Meet') return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500';
        return 'bg-slate-500/10 border-slate-500/30 text-slate-500';
    };

    if (loading) {
        return <div className="glass-card h-96 rounded-[3rem] animate-pulse"></div>;
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
                                            {interview.Platform}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-xs font-black">{new Date(interview.ScheduledAt).toLocaleDateString()}</div>
                                        <div className="text-[10px] font-bold text-violet-500">{new Date(interview.ScheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                    <button className="px-6 py-3 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-violet-500">
                                        <ExternalLink size={14} /> Join
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {upcoming.length === 0 && <div className="text-center py-10 text-[10px] font-bold text-[var(--text-muted)] uppercase">No upcoming video interviews</div>}
                </div>
            </div>
        </div>
    );
};

export default VideoInterviews;
