import React from 'react';
import { Briefcase, Users, PlusCircle, Target, Sparkles, TrendingUp, Clock, AlertCircle, Calendar, CheckCircle2, RefreshCw, BarChart3, Shield, AlertTriangle, CheckCircle, Timer, Video } from 'lucide-react';
import DashboardShell from '../components/DashboardShell';
import JobList from '../components/Jobs/JobList';
import JobModal from '../components/Jobs/JobModal';
import CandidateMatches from '../components/Jobs/CandidateMatches';
import ApplicationPipeline from '../components/Jobs/ApplicationPipeline';
import JobMatchingView from '../components/Jobs/JobMatchingView';
import TalentPool from '../components/Recruiters/TalentPool';
import HireAnalytics from '../components/Recruiters/HireAnalytics';
import AdvancedAnalytics from '../components/Recruiters/AdvancedAnalytics';
import BiasAnalytics from '../components/Recruiters/BiasAnalytics';
import GhostingRiskDetail from '../components/Recruiters/GhostingRiskDetail';
import SkillVerificationStatus from '../components/Recruiters/SkillVerificationStatus';
import TimeToHireDetail from '../components/Recruiters/TimeToHireDetail';
import VideoInterviews from '../components/Recruiters/VideoInterviews';
import API_BASE from '../apiConfig';
import axios from 'axios';

const RecruiterDashboard = () => {
    const [isJobModalOpen, setIsJobModalOpen] = React.useState(false);
    const [selectedJobForMatches, setSelectedJobForMatches] = React.useState(null);
    const [selectedJobForPipeline, setSelectedJobForPipeline] = React.useState(null);
    const [refreshJobs, setRefreshJobs] = React.useState(0);
    const [stats, setStats] = React.useState({ totalPool: '...', topMatches: '...', openRoles: '...' });
    const [riskAlerts, setRiskAlerts] = React.useState({ silentRejections: [], ghostingRisk: [] });
    const [funnel, setFunnel] = React.useState([]);
    const [activeTab, setActiveTab] = React.useState('Job Roles');
    const [interviews, setInterviews] = React.useState([]);
    const [interviewsLoading, setInterviewsLoading] = React.useState(false);

    React.useEffect(() => {
        const fetchAnalytics = async () => {
            // Fetch each independently so a failure in one doesn't block the others
            try {
                const statsRes = await axios.get(`${API_BASE}/analytics/stats`);
                setStats(statsRes.data);
            } catch (err) {
                console.error("Stats Fetch Error:", err);
                setStats({ totalPool: '-', topMatches: '-', openRoles: '-' });
            }

            try {
                const riskRes = await axios.get(`${API_BASE}/analytics/risk-alerts`);
                setRiskAlerts(riskRes.data);
            } catch (err) {
                console.error("Risk Alerts Fetch Error:", err);
                setRiskAlerts({ silentRejections: [], ghostingRisk: [] });
            }

            try {
                const funnelRes = await axios.get(`${API_BASE}/analytics/funnel`);
                setFunnel(funnelRes.data);
            } catch (err) {
                console.error("Funnel Fetch Error:", err);
                setFunnel([]);
            }
        };
        fetchAnalytics();
    }, [refreshJobs]);

    const fetchInterviews = React.useCallback(async () => {
        setInterviewsLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/interviews`);
            setInterviews(res.data);
        } catch (err) {
            console.error('Interviews fetch error:', err);
        } finally {
            setInterviewsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (activeTab === 'Interview Sch') fetchInterviews();
    }, [activeTab, fetchInterviews]);

    const recruiterNav = [
        { icon: Briefcase, label: 'Job Roles', active: activeTab === 'Job Roles', onClick: () => setActiveTab('Job Roles') },
        { icon: Users, label: 'Talent Pool', active: activeTab === 'Talent Pool', onClick: () => setActiveTab('Talent Pool') },
        { icon: Target, label: 'Job Matching', active: activeTab === 'Job Matching', onClick: () => setActiveTab('Job Matching') },
        { icon: Clock, label: 'Interview Sch', active: activeTab === 'Interview Sch', onClick: () => setActiveTab('Interview Sch') },
        { icon: Video, label: 'Video Interviews', active: activeTab === 'Video Interviews', onClick: () => setActiveTab('Video Interviews') },
        { icon: TrendingUp, label: 'Hire Analytics', active: activeTab === 'Hire Analytics', onClick: () => setActiveTab('Hire Analytics') },
        { icon: BarChart3, label: 'Insights', active: activeTab === 'Insights', onClick: () => setActiveTab('Insights') },
        { icon: Shield, label: 'Bias Detection', active: activeTab === 'Bias Detection', onClick: () => setActiveTab('Bias Detection') },
        { icon: AlertTriangle, label: 'Ghosting Risk', active: activeTab === 'Ghosting Risk', onClick: () => setActiveTab('Ghosting Risk') },
        { icon: CheckCircle, label: 'Skill Verify', active: activeTab === 'Skill Verify', onClick: () => setActiveTab('Skill Verify') },
        { icon: Timer, label: 'Time to Hire', active: activeTab === 'Time to Hire', onClick: () => setActiveTab('Time to Hire') },
    ];

    const renderMainContent = () => {
        switch (activeTab) {
            case 'Job Roles':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                        <div className="lg:col-span-3 space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Sparkles className="w-5 h-5 text-indigo-500" />
                                <h2 className="text-sm font-black uppercase tracking-widest">Active Job Postings</h2>
                            </div>

                            <JobList
                                refreshTrigger={refreshJobs}
                                onFindMatches={(job) => setSelectedJobForMatches(job)}
                                onOpenPipeline={(job) => setSelectedJobForPipeline(job)}
                                onDeleteJob={async (id) => {
                                    if (window.confirm("Archive this job posting?")) {
                                        try {
                                            await axios.delete(`${API_BASE}/jobs/${id}`);
                                            setRefreshJobs(prev => prev + 1);
                                        } catch (err) {
                                            alert("Failed to archive job.");
                                        }
                                    }
                                }}
                            />
                        </div>

                        <div className="space-y-6">
                            {/* Hiring Funnel Analytics */}
                            <div className="glass-card rounded-[2.5rem] p-8">
                                <div className="flex items-center gap-3 mb-8">
                                    <TrendingUp size={16} className="text-indigo-500" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Hiring Funnel</h3>
                                </div>
                                <div className="space-y-6">
                                    {funnel.length === 0 ? (
                                        <div className="text-center py-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                                            <p className="text-[9px] font-black text-indigo-500/60 uppercase tracking-widest">No Applications Yet</p>
                                        </div>
                                    ) : funnel.map((stage, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                                <span className="text-[var(--text-secondary)]">{stage.StatusName}</span>
                                                <span className="text-[var(--text-primary)]">{stage.ApplicationCount}</span>
                                            </div>
                                            <div className="w-full h-1 bg-[var(--bg-accent)] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)] transition-all duration-1000"
                                                    style={{ width: `${Math.min(100, (stage.ApplicationCount / (stats.totalPool || 1)) * 500)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Predictive Intelligence - Risk Alerts */}
                            <div className="glass-card border-rose-500/20 rounded-[2.5rem] p-8 border">
                                <div className="flex items-center gap-3 mb-8">
                                    <AlertCircle size={16} className="text-rose-500" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Risk Intelligence</h3>
                                </div>

                                <div className="space-y-6">
                                    {riskAlerts.ghostingRisk.length > 0 ? (
                                        riskAlerts.ghostingRisk.map((risk, i) => (
                                            <div key={i} className="flex gap-4 items-start p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10">
                                                <div className="mt-1"><Clock size={14} className="text-rose-500" /></div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-tight">{risk.FullName}</p>
                                                    <p className="text-[9px] font-bold text-rose-500/60 uppercase tracking-widest mt-1">High Ghosting Risk</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">No Critical Risks</p>
                                        </div>
                                    )}

                                    {riskAlerts.silentRejections.map((rejection, i) => (
                                        <div key={i} className="flex gap-4 items-start p-4 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
                                            <div className="mt-1"><AlertCircle size={14} className="text-amber-500" /></div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-tight">{rejection.FullName}</p>
                                                <p className="text-[9px] font-bold text-amber-500/60 uppercase tracking-widest mt-1">Stale Application: {rejection.DaysInactive}d</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'Job Matching':
                return <JobMatchingView />;
            case 'Talent Pool':
                return <TalentPool />;
            case 'Hire Analytics':
                return <HireAnalytics />;
            case 'Insights':
                return <AdvancedAnalytics />;
            case 'Bias Detection':
                return <BiasAnalytics />;
            case 'Ghosting Risk':
                return <GhostingRiskDetail />;
            case 'Skill Verify':
                return <SkillVerificationStatus />;
            case 'Time to Hire':
                return <TimeToHireDetail />;
            case 'Interview Sch': {
                const now = new Date();
                const upcoming = interviews.filter(i => new Date(i.InterviewStart) >= now);
                const past = interviews.filter(i => new Date(i.InterviewStart) < now);
                return (
                    <div className="space-y-10">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                <Calendar className="text-amber-500" size={22} /> Interview Schedule
                            </h2>
                            <button
                                onClick={fetchInterviews}
                                className="p-3 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-xl hover:border-indigo-500/50 transition-all"
                            >
                                <RefreshCw size={16} className={interviewsLoading ? 'animate-spin text-indigo-500' : 'text-[var(--text-muted)]'} />
                            </button>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-4">Upcoming ({upcoming.length})</p>
                            {upcoming.length === 0 ? (
                                <div className="glass-card rounded-[2rem] p-10 text-center border-2 border-dashed border-[var(--border-primary)]">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-30">No upcoming interviews scheduled</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {upcoming.map(iv => (
                                        <div key={iv.ScheduleID} className="glass-card p-8 rounded-[2rem] border border-amber-500/10 hover:border-amber-500/30 transition-all">
                                            <div className="flex items-start justify-between mb-5">
                                                <div>
                                                    <h3 className="text-sm font-black">{iv.CandidateName}</h3>
                                                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1 italic">{iv.JobTitle}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${iv.CandidateConfirmed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                    {iv.CandidateConfirmed ? 'Confirmed' : 'Pending'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
                                                <Clock size={13} className="text-amber-500" />
                                                {new Date(iv.InterviewStart).toLocaleString()} → {new Date(iv.InterviewEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {past.length > 0 && (
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Past ({past.length})</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {past.map(iv => (
                                        <div key={iv.ScheduleID} className="glass-card p-6 rounded-[2rem] opacity-50 hover:opacity-70 transition-all">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-xs font-black">{iv.CandidateName}</h3>
                                                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5 italic">{iv.JobTitle}</p>
                                                </div>
                                                <CheckCircle2 size={16} className="text-[var(--text-muted)]" />
                                            </div>
                                            <p className="text-[10px] font-mono text-[var(--text-muted)]">{new Date(iv.InterviewStart).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            }
            case 'Video Interviews':
                return <VideoInterviews />;
            default:
                return null;
        }
    };

    return (
        <DashboardShell
            title="Recruitment Pipeline"
            subtitle={activeTab}
            navigation={recruiterNav}
        >
            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {[
                    { label: 'Total Pool', value: stats.totalPool, icon: Users, color: 'bg-indigo-600' },
                    { label: 'Top Matches', value: stats.topMatches, icon: Target, color: 'bg-emerald-500' },
                    { label: 'Open Roles', value: stats.openRoles, icon: PlusCircle, color: 'bg-slate-800' },
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-8 rounded-[2rem] flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-[1.5rem] ${stat.color} flex items-center justify-center shadow-lg`}>
                            <stat.icon size={28} className="text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">{stat.label}</p>
                            <h4 className="text-3xl font-black">{stat.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end mb-10">
                <button
                    onClick={() => setIsJobModalOpen(true)}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
                >
                    <PlusCircle size={18} /> Post Job Role
                </button>
            </div>

            {renderMainContent()}

            <JobModal
                isOpen={isJobModalOpen}
                onClose={() => setIsJobModalOpen(false)}
                onJobCreated={() => setRefreshJobs(prev => prev + 1)}
            />

            <CandidateMatches
                job={selectedJobForMatches}
                isOpen={!!selectedJobForMatches}
                onClose={() => setSelectedJobForMatches(null)}
            />

            <ApplicationPipeline
                job={selectedJobForPipeline}
                isOpen={!!selectedJobForPipeline}
                onClose={() => setSelectedJobForPipeline(null)}
            />
        </DashboardShell>
    );
};

export default RecruiterDashboard;
