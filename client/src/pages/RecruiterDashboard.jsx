import React from 'react';
import { Briefcase, Users, PlusCircle, Target, Sparkles, TrendingUp, Clock, AlertCircle, Calendar, CheckCircle2, RefreshCw, BarChart3, Shield, AlertTriangle, CheckCircle, Timer, Video, Link2, Activity, Bot, Bell, Network, MessageSquare, FileCheck, Brain, UserCheck, Lightbulb, ShieldAlert } from 'lucide-react';
import DashboardShell from '../components/DashboardShell';
import JobList from '../components/Jobs/JobList';
import JobModal from '../components/Jobs/JobModal';
import CandidateMatches from '../components/Jobs/CandidateMatches';
import ApplicationPipeline from '../components/Jobs/ApplicationPipeline';
import TalentPool from '../components/Recruiters/TalentPool';
import HireAnalytics from '../components/Recruiters/HireAnalytics';
import GhostingRiskDetail from '../components/Recruiters/GhostingRiskDetail';
import SkillVerificationStatus from '../components/Recruiters/SkillVerificationStatus';
import TimeToHireDetail from '../components/Recruiters/TimeToHireDetail';
import VideoInterviews from '../components/Recruiters/VideoInterviews';
import CandidateEngagement from '../components/Recruiters/CandidateEngagement';
import ExternalPlatformSync from '../components/Recruiters/ExternalPlatformSync';
import ScreeningBot from '../components/Recruiters/ScreeningBot';
import MarketAlerts from '../components/Recruiters/MarketAlerts';
import ReferralIntelligence from '../components/Recruiters/ReferralIntelligence';
import InterviewQuestionsGenerator from '../components/Recruiters/InterviewQuestionsGenerator';
import BackgroundChecks from '../components/Recruiters/BackgroundChecks';
import BlockchainVerifications from '../components/Recruiters/BlockchainVerifications';
import HireSuccessPredictor from '../components/Recruiters/HireSuccessPredictor';
import OnboardingSuccessPredictor from '../components/Recruiters/OnboardingSuccessPredictor';
import InterviewFatigueReducer from '../components/Recruiters/InterviewFatigueReducer';
import AutoRejectionLog from '../components/Recruiters/AutoRejectionLog';
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
        if (activeTab === 'Interview Schedule') fetchInterviews();
    }, [activeTab, fetchInterviews]);

    const recruiterNav = [
        // Core Daily Tasks (most frequent)
        { icon: Briefcase, label: 'Job Roles', active: activeTab === 'Job Roles', onClick: () => setActiveTab('Job Roles') },
        { icon: Users, label: 'Talent Pool', active: activeTab === 'Talent Pool', onClick: () => setActiveTab('Talent Pool') },
        { icon: Clock, label: 'Interview Schedule', active: activeTab === 'Interview Schedule', onClick: () => setActiveTab('Interview Schedule') },
        { icon: Video, label: 'Video Interviews', active: activeTab === 'Video Interviews', onClick: () => setActiveTab('Video Interviews') },
        // Candidate Management
        { icon: CheckCircle, label: 'Skill Verify', active: activeTab === 'Skill Verify', onClick: () => setActiveTab('Skill Verify') },
        { icon: FileCheck, label: 'Background Checks', active: activeTab === 'Background Checks', onClick: () => setActiveTab('Background Checks') },
        { icon: Activity, label: 'Engagement', active: activeTab === 'Engagement', onClick: () => setActiveTab('Engagement') },
        { icon: Link2, label: 'Platform Sync', active: activeTab === 'Platform Sync', onClick: () => setActiveTab('Platform Sync') },
        // Analytics & Intelligence
        { icon: TrendingUp, label: 'Hire Analytics', active: activeTab === 'Hire Analytics', onClick: () => setActiveTab('Hire Analytics') },
        { icon: Timer, label: 'Time to Hire', active: activeTab === 'Time to Hire', onClick: () => setActiveTab('Time to Hire') },
        { icon: Network, label: 'Referral Intel', active: activeTab === 'Referral Intel', onClick: () => setActiveTab('Referral Intel') },
        { icon: Bell, label: 'Market Alerts', active: activeTab === 'Market Alerts', onClick: () => setActiveTab('Market Alerts') },
        // Risk & Compliance
        { icon: AlertTriangle, label: 'Ghosting Risk', active: activeTab === 'Ghosting Risk', onClick: () => setActiveTab('Ghosting Risk') },
        // AI & Predictions
        { icon: MessageSquare, label: 'AI Questions', active: activeTab === 'AI Questions', onClick: () => setActiveTab('AI Questions') },
        { icon: Brain, label: 'Hire Predictor', active: activeTab === 'Hire Predictor', onClick: () => setActiveTab('Hire Predictor') },
        { icon: UserCheck, label: 'Onboarding', active: activeTab === 'Onboarding', onClick: () => setActiveTab('Onboarding') },
        { icon: Lightbulb, label: 'Interview Fatigue', active: activeTab === 'Interview Fatigue', onClick: () => setActiveTab('Interview Fatigue') },
        { icon: Shield, label: 'Blockchain Verif', active: activeTab === 'Blockchain Verif', onClick: () => setActiveTab('Blockchain Verif') },
    ];

    const renderMainContent = () => {
        switch (activeTab) {
            case 'Job Roles':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                        <div className="lg:col-span-3 space-y-6">
                            <JobList
                                refreshTrigger={refreshJobs}
                                onFindMatches={(job) => setSelectedJobForMatches(job)}
                                onOpenPipeline={(job) => setSelectedJobForPipeline(job)}
                                onDeleteJob={async (id) => {
                                    if (window.confirm("Archive this job posting?")) {
                                        try {
                                            // Update isActive to false instead of deleting
                                            await axios.put(`${API_BASE}/jobs/${id}`, { isActive: false });
                                            setRefreshJobs(prev => prev + 1);
                                        } catch (err) {
                                            alert("Failed to archive job.");
                                        }
                                    }
                                }}
                                onUpdateJob={() => {
                                    setRefreshJobs(prev => prev + 1);
                                }}
                                onOpenJobModal={() => setIsJobModalOpen(true)}
                                onOpenScreeningBot={() => setActiveTab('Screening Bot')}
                                onOpenAutoRejection={() => setActiveTab('Auto Rejection')}
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

            case 'Talent Pool':
                return <TalentPool />;
            case 'Hire Analytics':
                return <HireAnalytics />;
            case 'Ghosting Risk':
                return <GhostingRiskDetail />;
            case 'Skill Verify':
                return <SkillVerificationStatus />;
            case 'Background Checks':
                return <BackgroundChecks />;
            case 'Time to Hire':
                return <TimeToHireDetail />;
            case 'Interview Schedule': {
                const now = new Date();
                const upcoming = interviews.filter(i => new Date(i.InterviewStart) >= now);
                const past = interviews.filter(i => new Date(i.InterviewStart) < now);
                return (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        {/* Gradient Header */}
                        <div className="glass-card rounded-[3rem] p-8 bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                        <Calendar size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black uppercase tracking-tight">Interview Schedule</h2>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Manage your interviews</p>
                                    </div>
                                </div>
                                <button
                                    onClick={fetchInterviews}
                                    className="p-3 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-xl hover:border-amber-500/50 transition-all"
                                >
                                    <RefreshCw size={16} className={interviewsLoading ? 'animate-spin text-amber-500' : 'text-[var(--text-muted)]'} />
                                </button>
                            </div>
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
            case 'Engagement':
                return <CandidateEngagement />;
            case 'Platform Sync':
                return <ExternalPlatformSync />;
            case 'Screening Bot':
                return <ScreeningBot onGoBack={() => setActiveTab('Job Roles')} />;
            case 'Market Alerts':
                return <MarketAlerts />;
            case 'Referral Intel':
                return <ReferralIntelligence />;
            case 'AI Questions':
                return <InterviewQuestionsGenerator />;
            case 'Hire Predictor':
                return <HireSuccessPredictor />;
            case 'Onboarding':
                return <OnboardingSuccessPredictor />;
            case 'Blockchain Verif':
                return <BlockchainVerifications />;
            case 'Interview Fatigue':
                return <InterviewFatigueReducer />;
            case 'Auto Rejection':
                return <AutoRejectionLog onGoBack={() => setActiveTab('Job Roles')} />;
            default:
                return null;
        }
    };

    // Show header (action buttons) only for tabs that need it - removed as buttons are now inline in each component

    return (
        <DashboardShell
            title="Recruitment Pipeline"
            subtitle={activeTab}
            navigation={recruiterNav}
            onProfileClick={() => { }}
        >
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
