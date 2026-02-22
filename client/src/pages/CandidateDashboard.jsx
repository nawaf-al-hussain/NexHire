import React from 'react';
import { Search, MapPin, Bookmark, Compass, Star, Zap, Target, Bell, TrendingUp, BookOpen, Trophy, FileText, DollarSign } from 'lucide-react';
import DashboardShell from '../components/DashboardShell';
import axios from 'axios';
import API_BASE from '../apiConfig';

// Import New Components
import CandidateApplications from '../components/Candidate/CandidateApplications';
import CandidateInterviews from '../components/Candidate/CandidateInterviews';
import CandidateSkillsVerification from '../components/Candidate/CandidateSkillsVerification';
import SkillManagementModal from '../components/Candidate/SkillManagementModal';
import CareerPath from '../components/Candidate/CareerPath';
import LearningPaths from '../components/Candidate/LearningPaths';
import Leaderboard from '../components/Candidate/Leaderboard';
import InterviewPrep from '../components/Candidate/InterviewPrep';
import SalaryCoach from '../components/Candidate/SalaryCoach';
import ResumeScore from '../components/Candidate/ResumeScore';
import LocationPreferences from '../components/Candidate/LocationPreferences';

const CandidateDashboard = () => {
    const [discoverJobs, setDiscoverJobs] = React.useState([]);
    const [applications, setApplications] = React.useState([]);
    const [interviews, setInterviews] = React.useState([]);
    const [assessments, setAssessments] = React.useState([]);
    const [profileSkills, setProfileSkills] = React.useState([]);
    const [careerPath, setCareerPath] = React.useState([]);
    const [learningPath, setLearningPath] = React.useState([]);
    const [leaderboardData, setLeaderboardData] = React.useState([]);
    const [prepMaterials, setPrepMaterials] = React.useState([]);
    const [salaryData, setSalaryData] = React.useState([]);
    const [resumeData, setResumeData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState('Discover Jobs');
    const [isSkillModalOpen, setIsSkillModalOpen] = React.useState(false);

    const candidateNav = [
        { icon: Compass, label: 'Discover Jobs', active: activeTab === 'Discover Jobs', onClick: () => setActiveTab('Discover Jobs') },
        { icon: Bookmark, label: 'Applications', active: activeTab === 'Applications', onClick: () => setActiveTab('Applications') },
        { icon: Target, label: 'Interviews', active: activeTab === 'Interviews', onClick: () => setActiveTab('Interviews') },
        { icon: Star, label: 'Skill Verify', active: activeTab === 'Skill Verify', onClick: () => setActiveTab('Skill Verify') },
        { icon: TrendingUp, label: 'Career Path', active: activeTab === 'Career Path', onClick: () => setActiveTab('Career Path') },
        { icon: BookOpen, label: 'Learning', active: activeTab === 'Learning', onClick: () => setActiveTab('Learning') },
        { icon: Trophy, label: 'Achievements', active: activeTab === 'Achievements', onClick: () => setActiveTab('Achievements') },
        { icon: FileText, label: 'Interview Prep', active: activeTab === 'Interview Prep', onClick: () => setActiveTab('Interview Prep') },
        { icon: DollarSign, label: 'Salary Coach', active: activeTab === 'Salary Coach', onClick: () => setActiveTab('Salary Coach') },
        { icon: FileText, label: 'Resume Score', active: activeTab === 'Resume Score', onClick: () => setActiveTab('Resume Score') },
        { icon: MapPin, label: 'Location Prefs', active: activeTab === 'Location Prefs', onClick: () => setActiveTab('Location Prefs') },
    ];

    const handleApply = async (jobID) => {
        try {
            await axios.post(`${API_BASE}/candidates/apply`, { jobID });
            alert("Application submitted successfully!");
            fetchData(); // Refresh data to show new application
        } catch (err) {
            console.error("Apply Error:", err.response?.data?.error || err.message);
            alert(err.response?.data?.error || "Failed to submit application.");
        }
    };

    const fetchData = async () => {
        setLoading(true);

        // Each fetch is INDEPENDENT — one failure never blocks the others
        const [discoverRes, appsRes, interviewsRes, assessmentsRes, profileSkillsRes] = await Promise.allSettled([
            axios.get(`${API_BASE}/candidates/discover`),
            axios.get(`${API_BASE}/candidates/applications`),
            axios.get(`${API_BASE}/candidates/interviews`),
            axios.get(`${API_BASE}/candidates/assessments/available`),
            axios.get(`${API_BASE}/candidates/profile/skills`)
        ]);

        if (discoverRes.status === 'fulfilled') setDiscoverJobs(discoverRes.value.data);
        else console.error("Discover Jobs Error:", discoverRes.reason?.message);

        if (appsRes.status === 'fulfilled') setApplications(appsRes.value.data);
        else console.error("Applications Error:", appsRes.reason?.message);

        if (interviewsRes.status === 'fulfilled') setInterviews(interviewsRes.value.data);
        else console.error("Interviews Error:", interviewsRes.reason?.message);

        if (assessmentsRes.status === 'fulfilled') setAssessments(assessmentsRes.value.data);
        else console.error("Assessments Error:", assessmentsRes.reason?.message);

        if (profileSkillsRes.status === 'fulfilled') setProfileSkills(profileSkillsRes.value.data);
        else console.error("Profile Skills Error:", profileSkillsRes.reason?.message);

        setLoading(false);
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    // Fetch career path, learning path, leaderboard, and prep data when tabs are selected
    React.useEffect(() => {
        if (activeTab === 'Career Path') {
            axios.get(`${API_BASE}/candidates/career-path`)
                .then(res => setCareerPath(res.data))
                .catch(err => console.error("Career Path Error:", err));
        }
        if (activeTab === 'Learning') {
            axios.get(`${API_BASE}/candidates/learning-path`)
                .then(res => setLearningPath(res.data))
                .catch(err => console.error("Learning Path Error:", err));
        }
        if (activeTab === 'Achievements') {
            axios.get(`${API_BASE}/candidates/leaderboard`)
                .then(res => setLeaderboardData(res.data))
                .catch(err => console.error("Leaderboard Error:", err));
        }
        if (activeTab === 'Interview Prep') {
            axios.get(`${API_BASE}/candidates/interview-prep`)
                .then(res => setPrepMaterials(res.data))
                .catch(err => console.error("Interview Prep Error:", err));
        }
        if (activeTab === 'Salary Coach') {
            axios.get(`${API_BASE}/candidates/salary-coach`)
                .then(res => setSalaryData(res.data))
                .catch(err => console.error("Salary Coach Error:", err));
        }
        if (activeTab === 'Resume Score') {
            axios.get(`${API_BASE}/candidates/resume-score`)
                .then(res => setResumeData(res.data))
                .catch(err => console.error("Resume Score Error:", err));
        }
    }, [activeTab]);

    const handleGenerateLearningPath = async () => {
        // Placeholder - actual generation happens in LearningPaths component
    };

    const renderMainContent = () => {
        switch (activeTab) {
            case 'Applications':
                return <CandidateApplications applications={applications} loading={loading} onRefresh={fetchData} />;
            case 'Interviews':
                return <CandidateInterviews interviews={interviews} loading={loading} onConfirm={fetchData} />;
            case 'Skill Verify':
                return <CandidateSkillsVerification assessments={assessments} profileSkills={profileSkills} loading={loading} onRefresh={fetchData} />;
            case 'Career Path':
                return <CareerPath careerPath={careerPath} loading={loading} onRefresh={fetchData} />;
            case 'Learning':
                return <LearningPaths learningPath={learningPath} loading={loading} onGenerate={handleGenerateLearningPath} onRefresh={fetchData} />;
            case 'Achievements':
                return <Leaderboard leaderboardData={leaderboardData} loading={loading} />;
            case 'Interview Prep':
                return <InterviewPrep prepMaterials={prepMaterials} loading={loading} applications={applications} onGenerate={handleGenerateLearningPath} />;
            case 'Salary Coach':
                return <SalaryCoach salaryData={salaryData} loading={loading} applications={applications} />;
            case 'Resume Score':
                return <ResumeScore resumeData={resumeData} loading={loading} />;
            case 'Location Prefs':
                return <LocationPreferences />;
            default:
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <Target className="w-5 h-5 text-indigo-500" />
                                    <h2 className="text-lg font-black uppercase tracking-tighter">Matches Found for You</h2>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                        <Zap className="w-12 h-12 text-indigo-500 animate-pulse mb-4" />
                                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Querying Match Engine...</p>
                                    </div>
                                ) : discoverJobs.length === 0 ? (
                                    <div className="p-12 border-2 border-dashed border-[var(--border-primary)] rounded-[3rem] text-center bg-[var(--bg-accent)]/5">
                                        <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-40">No precision matches found. Expand your skill profile.</p>
                                    </div>
                                ) : (
                                    discoverJobs.map((job) => (
                                        <div key={job.JobID} className="group bg-[var(--bg-accent)] p-8 rounded-[2.5rem] border border-[var(--border-primary)] hover:bg-indigo-500/[0.02] transition-all cursor-pointer relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="flex gap-6">
                                                    <div className="w-16 h-16 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center font-black text-lg text-[var(--text-muted)] group-hover:text-indigo-500">
                                                        {job.JobTitle.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-black group-hover:text-indigo-500 transition-colors leading-tight">{job.JobTitle}</h4>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{job.Location}</p>
                                                            <span className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-widest opacity-60">• {job.MinExperience}+ Yrs Exp</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8">
                                                    <div className="flex gap-2">
                                                        {job.MatchedSkillsCount > 0 && (
                                                            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                                                {job.MatchedSkillsCount} Skill Matches
                                                            </span>
                                                        )}
                                                        <span className="px-3 py-1 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Active</span>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end gap-3">
                                                        <div className="flex flex-col items-end">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-2xl font-black">
                                                                    {job.MatchedSkillsCount > 0 ? Math.min(100, Math.round((job.MatchedSkillsCount / 3) * 100)) : '0'}%
                                                                </span>
                                                            </div>
                                                            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40">Precision</div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleApply(job.JobID);
                                                            }}
                                                            className="px-6 py-2 bg-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
                                                        >
                                                            Apply Now
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="glass-card rounded-[3rem] p-10 relative isolate overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -z-10"></div>
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)]">Profile Pulse</h3>
                                    <Zap className="w-4 h-4 text-indigo-500 fill-current" />
                                </div>

                                <div className="relative w-36 h-36 mx-auto mb-10">
                                    <svg className="w-full h-full rotate-[-90deg]">
                                        <circle cx="72" cy="72" r="64" className="stroke-[var(--bg-accent)] fill-none stroke-[10]" />
                                        <circle cx="72" cy="72" r="64" className="stroke-indigo-600 fill-none stroke-[10] transition-all" style={{ strokeDasharray: '402', strokeDashoffset: '100' }} />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-black">75%</span>
                                        <span className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-widest opacity-60">Score</span>
                                    </div>
                                </div>

                                <p className="text-center text-[var(--text-muted)] text-xs font-medium leading-relaxed mb-8 px-4 opacity-70">
                                    Your SQL Schema knowledge is trending. Update your profile to hit 90%.
                                </p>

                                <button
                                    onClick={() => setIsSkillModalOpen(true)}
                                    className="w-full py-4 bg-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all"
                                >
                                    Manage Skills
                                </button>
                            </div>

                            <div className="bg-[var(--bg-accent)] rounded-[2.5rem] p-10 border border-[var(--border-primary)] relative overflow-hidden group transition-colors">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                                    <Star className="w-24 h-24" />
                                </div>
                                <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-6">Expert Tips</h3>
                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-bold italic opacity-80">
                                    "Candidates with T-SQL experience are seeing 40% higher match rates today."
                                </p>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <DashboardShell
            title={activeTab === 'Discover Jobs' ? "Algorithmically Matched" : activeTab}
            subtitle={activeTab === 'Discover Jobs' ? "Your Career" : "Candidate Portal"}
            navigation={candidateNav}
        >
            {activeTab === 'Discover Jobs' && (
                <div className="relative isolate mb-12 p-12 rounded-[3rem] bg-[var(--bg-secondary)] border border-[var(--border-primary)] overflow-hidden shadow-3xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[100px] rounded-full -z-10 animate-pulse"></div>

                    <h1 className="text-4xl font-black tracking-tighter mb-8 max-w-2xl leading-tight">
                        Your Next Opportunity, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-emerald-500">Precision Engineered.</span>
                    </h1>

                    <div className="flex flex-col lg:flex-row gap-4 p-3 bg-[var(--bg-primary)]/50 backdrop-blur-xl border border-[var(--border-primary)] rounded-[2rem]">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Project Architect, SQL dev, or skills..."
                                className="w-full bg-[var(--bg-accent)] border-transparent text-[var(--text-primary)] rounded-2xl py-4 pl-14 pr-4 focus:bg-white/10 dark:focus:bg-white/5 outline-none transition-all placeholder:text-[var(--text-muted)] font-bold text-sm"
                            />
                        </div>
                        <div className="lg:w-64 relative group">
                            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
                            <input
                                type="text"
                                placeholder="US / Remote"
                                className="w-full bg-[var(--bg-accent)] border-transparent text-[var(--text-primary)] rounded-2xl py-4 pl-14 pr-4 focus:bg-white/10 dark:focus:bg-white/5 outline-none transition-all placeholder:text-[var(--text-muted)] font-bold text-sm"
                            />
                        </div>
                        <button className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all">
                            Query Jobs
                        </button>
                    </div>
                </div>
            )}

            {renderMainContent()}

            <SkillManagementModal
                isOpen={isSkillModalOpen}
                onClose={() => setIsSkillModalOpen(false)}
                onRefresh={fetchData}
                currentSkills={profileSkills}
            />
        </DashboardShell>
    );
};

export default CandidateDashboard;
