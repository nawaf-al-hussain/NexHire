import React from 'react';
import axios from 'axios';
import API_BASE from '../apiConfig';
import {
    LayoutDashboard, BarChart3, ShieldAlert, FileText, Database, Activity,
    RefreshCw, Layers, HardDrive, Trash2, UserX, Users, CheckCircle, XCircle,
    Briefcase, Shield, Award, ChevronRight, AlertCircle, AlertTriangle, Check, Target, Zap, TrendingUp,
    Globe, PieChart, DollarSign, MapPin, GitBranch, UsersRound, Mail, UserPlus, X
} from 'lucide-react';
import DashboardShell from '../components/DashboardShell';
import RecruiterPerformanceAdmin from '../components/Admin/RecruiterPerformanceAdmin';
import ConsentManagement from '../components/Admin/ConsentManagement';
import VacancyUtilizationAdmin from '../components/Admin/VacancyUtilizationAdmin';
import SalaryTransparencyAnalytics from '../components/Admin/SalaryTransparencyAnalytics';
import InterviewerPerformanceChart from '../components/Charts/InterviewerPerformanceChart';
import HiringFunnelChart from '../components/Charts/HiringFunnelChart';
import RejectionAnalysisChart from '../components/Charts/RejectionAnalysisChart';
import EngagementTrendChart from '../components/Charts/EngagementTrendChart';
import BiasAnalysisChart from '../components/Charts/BiasAnalysisChart';
import SkillGapChart from '../components/Charts/SkillGapChart';
import RecruiterLeaderboardChart from '../components/Charts/RecruiterLeaderboardChart';
import VacancyUtilizationChart from '../components/Charts/VacancyUtilizationChart';
import HireRatePerJobChart from '../components/Charts/HireRatePerJobChart';
import DiversityChart from '../components/Charts/DiversityChart';
import SalaryRangeChart from '../components/Charts/SalaryRangeChart';
import RemoteWorkChart from '../components/Charts/RemoteWorkChart';
import MarketIntelligenceChart from '../components/Charts/MarketIntelligenceChart';
import RemoteWorkAnalytics from '../components/Admin/RemoteWorkAnalytics';
import ReferralIntelligence from '../components/Recruiters/ReferralIntelligence';
import DiversityGoals from '../components/Admin/DiversityGoals';
import BiasLogs from '../components/Admin/BiasLogs';
import EmailQueueManager from '../components/Admin/EmailQueueManager';
import SQLViews from '../components/Admin/SQLViews';

const AdminDashboard = () => {
    const [activeView, setActiveView] = React.useState('Core Analytics');
    const [marketIntelKey, setMarketIntelKey] = React.useState(0);

    // Reset animation key when switching to Market Intel tab
    React.useEffect(() => {
        if (activeView === 'Market Intel') {
            setMarketIntelKey(prev => prev + 1);
        }
    }, [activeView]);
    const [archiveStats, setArchiveStats] = React.useState({ archivedJobs: 0, archivedApplications: 0, lastUpdated: null });
    const [archivedJobsData, setArchivedJobsData] = React.useState([]);
    const [archivedAppsData, setArchivedAppsData] = React.useState([]);
    const [isProcessing, setIsProcessing] = React.useState(null);
    const [users, setUsers] = React.useState([]);
    const [usersLoading, setUsersLoading] = React.useState(false);
    const [auditLogs, setAuditLogs] = React.useState([]);
    const [auditLogsLoading, setAuditLogsLoading] = React.useState(false);
    const [systemStats, setSystemStats] = React.useState(null);
    const [systemStatsLoading, setSystemStatsLoading] = React.useState(false);

    // Create Candidate Modal state
    const [showCreateCandidateModal, setShowCreateCandidateModal] = React.useState(false);
    const [isCreatingCandidate, setIsCreatingCandidate] = React.useState(false);
    const [newCandidate, setNewCandidate] = React.useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        location: '',
        yearsOfExperience: ''
    });

    // Analytics state variables
    const [analyticsLoading, setAnalyticsLoading] = React.useState(false);
    const [biasData, setBiasData] = React.useState({ location: [], experience: [] });
    const [skillGapData, setSkillGapData] = React.useState([]);
    const [recruiterPerf, setRecruiterPerf] = React.useState([]);
    const [vacancyData, setVacancyData] = React.useState([]);
    const [bottlenecks, setBottlenecks] = React.useState([]);
    const [riskAlerts, setRiskAlerts] = React.useState({ silentRejections: [], ghostingRisk: [] });
    const [funnelData, setFunnelData] = React.useState([]);

    // Advanced Analytics state variables
    const [marketData, setMarketData] = React.useState([]);
    const [diversityData, setDiversityData] = React.useState([]);
    const [salaryData, setSalaryData] = React.useState([]);
    const [remoteData, setRemoteData] = React.useState([]);
    const [careerPathData, setCareerPathData] = React.useState([]);
    const [referralData, setReferralData] = React.useState([]);

    // Phase 1 Analytics state variables
    const [interviewerConsistency, setInterviewerConsistency] = React.useState([]);
    const [interviewScoreDecision, setInterviewScoreDecision] = React.useState([]);
    const [rejectionAnalysis, setRejectionAnalysis] = React.useState([]);
    const [candidateEngagement, setCandidateEngagement] = React.useState([]);
    const [hireRatePerJob, setHireRatePerJob] = React.useState([]);
    const [timeToHireIndividual, setTimeToHireIndividual] = React.useState([]);

    // Demo data for when API is not available
    const demoData = {
        biasData: {
            location: [
                { Location: 'New York', HireRatePercent: 45.2, TotalApplicants: 150 },
                { Location: 'San Francisco', HireRatePercent: 52.8, TotalApplicants: 120 },
                { Location: 'Chicago', HireRatePercent: 38.5, TotalApplicants: 85 },
                { Location: 'Austin', HireRatePercent: 61.2, TotalApplicants: 95 },
                { Location: 'Seattle', HireRatePercent: 48.9, TotalApplicants: 110 }
            ],
            experience: [
                { ExperienceGroup: '0-2 Years', HireRatePercent: 22.5, TotalApplicants: 200 },
                { ExperienceGroup: '3-5 Years', HireRatePercent: 45.8, TotalApplicants: 180 },
                { ExperienceGroup: '6-10 Years', HireRatePercent: 68.2, TotalApplicants: 95 },
                { ExperienceGroup: '10+ Years', HireRatePercent: 55.4, TotalApplicants: 45 }
            ]
        },
        skillGapData: [
            { SkillName: 'React', GapScore: 85, DemandRank: 1 },
            { SkillName: 'Node.js', GapScore: 72, DemandRank: 2 },
            { SkillName: 'Python', GapScore: 68, DemandRank: 3 },
            { SkillName: 'AWS', GapScore: 65, DemandRank: 4 },
            { SkillName: 'TypeScript', GapScore: 58, DemandRank: 5 },
            { SkillName: 'Docker', GapScore: 52, DemandRank: 6 },
            { SkillName: 'Kubernetes', GapScore: 48, DemandRank: 7 },
            { SkillName: 'GraphQL', GapScore: 45, DemandRank: 8 },
            { SkillName: 'MongoDB', GapScore: 42, DemandRank: 9 },
            { SkillName: 'Redis', GapScore: 38, DemandRank: 10 }
        ],
        recruiterPerf: [
            { RecruiterName: 'Sarah Johnson', InterviewsConducted: 45, SuccessfulHires: 12 },
            { RecruiterName: 'Michael Chen', InterviewsConducted: 38, SuccessfulHires: 10 },
            { RecruiterName: 'Emily Davis', InterviewsConducted: 32, SuccessfulHires: 8 },
            { RecruiterName: 'James Wilson', InterviewsConducted: 28, SuccessfulHires: 7 },
            { RecruiterName: 'Lisa Anderson', InterviewsConducted: 25, SuccessfulHires: 6 }
        ],
        vacancyData: [
            { JobTitle: 'Senior Developer', FilledPositions: 3, RemainingVacancies: 2, TotalApplications: 45 },
            { JobTitle: 'Tech Lead', FilledPositions: 1, RemainingVacancies: 3, TotalApplications: 28 },
            { JobTitle: 'DevOps Engineer', FilledPositions: 2, RemainingVacancies: 1, TotalApplications: 35 },
            { JobTitle: 'Data Engineer', FilledPositions: 1, RemainingVacancies: 4, TotalApplications: 22 },
            { JobTitle: 'Full Stack Dev', FilledPositions: 4, RemainingVacancies: 1, TotalApplications: 67 },
            { JobTitle: 'Product Manager', FilledPositions: 2, RemainingVacancies: 2, TotalApplications: 31 }
        ],
        bottlenecks: [
            { StatusName: 'Technical Interview', AvgDaysInStage: 12, ApplicationsInStage: 8 },
            { StatusName: 'Manager Review', AvgDaysInStage: 9, ApplicationsInStage: 5 }
        ],
        riskAlerts: {
            silentRejections: [
                { CandidateName: 'John Smith', JobTitle: 'Senior Developer', DaysInactive: 18 },
                { CandidateName: 'Jane Doe', JobTitle: 'Tech Lead', DaysInactive: 15 }
            ],
            ghostingRisk: []
        },
        funnelData: [
            { StatusName: 'Applied', ApplicationCount: 450 },
            { StatusName: 'Screening', ApplicationCount: 180 },
            { StatusName: 'Interview', ApplicationCount: 65 },
            { StatusName: 'Offer', ApplicationCount: 22 }
        ],
        referralData: [
            { Referrer: 'John Smith', ReferralCount: 15, Department: 'Engineering' },
            { Referrer: 'Sarah Johnson', ReferralCount: 12, Department: 'Sales' },
            { Referrer: 'Mike Chen', ReferralCount: 10, Department: 'Engineering' },
            { Referrer: 'Emily Davis', ReferralCount: 8, Department: 'Marketing' },
            { Referrer: 'Tom Wilson', ReferralCount: 7, Department: 'Engineering' },
            { Referrer: 'Lisa Brown', ReferralCount: 6, Department: 'Sales' },
            { Referrer: 'David Lee', ReferralCount: 5, Department: 'HR' },
            { Referrer: 'Amy Taylor', ReferralCount: 4, Department: 'Engineering' }
        ]
    };

    // Fetch analytics data
    const fetchAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
            const responses = await Promise.allSettled([
                axios.get(`${API_BASE}/analytics/bias-detection`),
                axios.get(`${API_BASE}/analytics/skill-gap`),
                axios.get(`${API_BASE}/analytics/recruiter-performance`),
                axios.get(`${API_BASE}/analytics/utilization`),
                axios.get(`${API_BASE}/analytics/bottlenecks`),
                axios.get(`${API_BASE}/analytics/risk-alerts`),
                axios.get(`${API_BASE}/analytics/funnel`)
            ]);

            // Use real data if API succeeded, otherwise use demo data
            if (responses[0].status === 'fulfilled') {
                setBiasData(responses[0].value.data);
            } else {
                setBiasData(demoData.biasData);
            }

            if (responses[1].status === 'fulfilled') {
                setSkillGapData(responses[1].value.data);
            } else {
                setSkillGapData(demoData.skillGapData);
            }

            if (responses[2].status === 'fulfilled') {
                setRecruiterPerf(responses[2].value.data);
            } else {
                setRecruiterPerf(demoData.recruiterPerf);
            }

            if (responses[3].status === 'fulfilled') {
                setVacancyData(responses[3].value.data);
            } else {
                setVacancyData(demoData.vacancyData);
            }

            if (responses[4].status === 'fulfilled') {
                setBottlenecks(responses[4].value.data);
            } else {
                setBottlenecks(demoData.bottlenecks);
            }

            if (responses[5].status === 'fulfilled') {
                setRiskAlerts(responses[5].value.data);
            } else {
                setRiskAlerts(demoData.riskAlerts);
            }

            if (responses[6].status === 'fulfilled') {
                setFunnelData(responses[6].value.data);
            } else {
                setFunnelData(demoData.funnelData);
            }

            // Log which APIs failed for debugging
            const failedAPIs = responses
                .map((r, i) => r.status !== 'fulfilled' ? ['bias-detection', 'skill-gap', 'recruiter-performance', 'utilization', 'bottlenecks', 'risk-alerts', 'funnel'][i] : null)
                .filter(Boolean);
            if (failedAPIs.length > 0) {
                console.log("Using demo data for:", failedAPIs.join(', '));
            }
        } catch (err) {
            console.error("Failed to fetch analytics:", err);
            // Fall back to demo data
            setBiasData(demoData.biasData);
            setSkillGapData(demoData.skillGapData);
            setRecruiterPerf(demoData.recruiterPerf);
            setVacancyData(demoData.vacancyData);
            setBottlenecks(demoData.bottlenecks);
            setRiskAlerts(demoData.riskAlerts);
            setFunnelData(demoData.funnelData);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    // Fetch advanced analytics data
    const fetchAdvancedAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
            const responses = await Promise.allSettled([
                axios.get(`${API_BASE}/analytics/market`),
                axios.get(`${API_BASE}/analytics/diversity`),
                axios.get(`${API_BASE}/analytics/salary-transparency`),
                axios.get(`${API_BASE}/analytics/remote-compatibility`),
                axios.get(`${API_BASE}/analytics/organizational-career`),
                axios.get(`${API_BASE}/analytics/referral-intelligence`)
            ]);

            if (responses[0].status === 'fulfilled') setMarketData(responses[0].value.data);
            if (responses[1].status === 'fulfilled') setDiversityData(responses[1].value.data);
            if (responses[2].status === 'fulfilled') setSalaryData(responses[2].value.data);
            if (responses[3].status === 'fulfilled') setRemoteData(responses[3].value.data);
            if (responses[4].status === 'fulfilled') setCareerPathData(responses[4].value.data);
            if (responses[5].status === 'fulfilled') {
                setReferralData(responses[5].value.data);
            } else {
                setReferralData(demoData.referralData);
            }
        } catch (err) {
            console.error("Failed to fetch advanced analytics:", err);
            setReferralData(demoData.referralData);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    // Fetch Phase 1 analytics data
    const fetchPhase1Analytics = async () => {
        try {
            const responses = await Promise.allSettled([
                axios.get(`${API_BASE}/analytics/interviewer-consistency`),
                axios.get(`${API_BASE}/analytics/interview-score-decision`),
                axios.get(`${API_BASE}/analytics/rejection-analysis`),
                axios.get(`${API_BASE}/analytics/candidate-engagement`),
                axios.get(`${API_BASE}/analytics/hire-rate-per-job`),
                axios.get(`${API_BASE}/analytics/time-to-hire-individual`)
            ]);

            if (responses[0].status === 'fulfilled') setInterviewerConsistency(responses[0].value.data);
            if (responses[1].status === 'fulfilled') setInterviewScoreDecision(responses[1].value.data);
            if (responses[2].status === 'fulfilled') setRejectionAnalysis(responses[2].value.data);
            if (responses[3].status === 'fulfilled') setCandidateEngagement(responses[3].value.data);
            if (responses[4].status === 'fulfilled') setHireRatePerJob(responses[4].value.data);
            if (responses[5].status === 'fulfilled') setTimeToHireIndividual(responses[5].value.data);
        } catch (err) {
            console.error("Failed to fetch Phase 1 analytics:", err);
        }
    };

    const fetchArchiveStats = async () => {
        try {
            const res = await axios.get(`${API_BASE}/maintenance/archive-stats`);
            setArchiveStats(res.data);
        } catch (err) {
            console.error("Failed to fetch archive stats:", err);
        }
    };

    const fetchArchiveTables = async () => {
        try {
            const [jobsRes, appsRes] = await Promise.all([
                axios.get(`${API_BASE}/maintenance/archive-jobs`),
                axios.get(`${API_BASE}/maintenance/archive-applications`)
            ]);
            setArchivedJobsData(jobsRes.data);
            setArchivedAppsData(appsRes.data);
        } catch (err) {
            console.error("Failed to fetch archive tables:", err);
        }
    };

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/users`);
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setUsersLoading(false);
        }
    };

    const fetchAuditLogs = async () => {
        setAuditLogsLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/analytics/audit-logs`);
            setAuditLogs(res.data);
        } catch (err) {
            console.error("Failed to fetch audit logs:", err);
        } finally {
            setAuditLogsLoading(false);
        }
    };

    const fetchSystemStats = async () => {
        setSystemStatsLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/analytics/system-stats`);
            setSystemStats(res.data);
        } catch (err) {
            console.error("Failed to fetch system stats:", err);
        } finally {
            setSystemStatsLoading(false);
        }
    };

    React.useEffect(() => {
        if (activeView === 'Maintenance') {
            fetchArchiveStats();
            fetchArchiveTables();
        } else if (activeView === 'User Management') {
            fetchUsers();
        } else if (activeView === 'System Reports') {
            fetchSystemStats();
            fetchUsers();
            fetchAuditLogs();
        } else if (activeView === 'Security Logs') {
            fetchAuditLogs();
        } else if (activeView === 'Core Analytics') {
            fetchAnalytics();
            fetchPhase1Analytics();
        } else if (['Market Intel', 'Salary Transp', 'Remote Work', 'Career Path', 'Referral Intelligence'].includes(activeView)) {
            fetchAdvancedAnalytics();
        }
    }, [activeView]);

    const runMaintenance = async (type, endpoint) => {
        if (!window.confirm(`Initiate ${type} procedure? This action is irreversible.`)) return;

        setIsProcessing(type);
        try {
            await axios.post(`${API_BASE}/maintenance/${endpoint}`);
            await Promise.all([fetchArchiveStats(), fetchArchiveTables()]);
            alert(`${type} completed successfully.`);
        } catch (err) {
            alert(`Failed to execute ${type}: ` + (err.response?.data?.error || err.message));
        } finally {
            setIsProcessing(null);
        }
    };

    const updateUserRole = async (userId, newRoleId) => {
        try {
            await axios.put(`${API_BASE}/users/${userId}/role`, { roleID: newRoleId });
            fetchUsers();
        } catch (err) {
            alert("Failed to update user role.");
        }
    };

    const toggleUserStatus = async (userId, newStatus) => {
        try {
            await axios.put(`${API_BASE}/users/${userId}/status`, { isActive: newStatus });
            fetchUsers();
        } catch (err) {
            alert("Failed to toggle user status.");
        }
    };

    // Create candidate handler
    const handleCreateCandidate = async (e) => {
        e.preventDefault();
        if (!newCandidate.username || !newCandidate.email || !newCandidate.password || !newCandidate.fullName) {
            alert("Please fill in all required fields (username, email, password, full name).");
            return;
        }

        setIsCreatingCandidate(true);
        try {
            console.log("Creating candidate with data:", {
                username: newCandidate.username,
                email: newCandidate.email,
                password: "***",
                fullName: newCandidate.fullName,
                location: newCandidate.location || null,
                yearsOfExperience: newCandidate.yearsOfExperience ? parseInt(newCandidate.yearsOfExperience) : null
            });

            const response = await axios.post(`${API_BASE}/users/candidate`, {
                username: newCandidate.username,
                email: newCandidate.email,
                password: newCandidate.password,
                fullName: newCandidate.fullName,
                location: newCandidate.location || null,
                yearsOfExperience: newCandidate.yearsOfExperience ? parseInt(newCandidate.yearsOfExperience) : null
            });

            console.log("Create candidate response:", response.data);
            alert("Candidate created successfully!");
            setShowCreateCandidateModal(false);
            setNewCandidate({
                username: '',
                email: '',
                password: '',
                fullName: '',
                location: '',
                yearsOfExperience: ''
            });
            fetchUsers();
            fetchSystemStats();
        } catch (err) {
            console.error("Create candidate error:", err.response?.data || err.message);
            alert("Failed to create candidate: " + (err.response?.data?.error || err.message));
        } finally {
            setIsCreatingCandidate(false);
        }
    };

    const adminNav = [
        // Tier 1 - Analytics & Insights
        { icon: LayoutDashboard, label: 'Core Analytics', active: activeView === 'Core Analytics', onClick: () => setActiveView('Core Analytics') },
        { icon: Globe, label: 'Market Intel', active: activeView === 'Market Intel', onClick: () => setActiveView('Market Intel') },
        { icon: DollarSign, label: 'Salary Transp', active: activeView === 'Salary Transp', onClick: () => setActiveView('Salary Transp') },
        { icon: MapPin, label: 'Remote Work', active: activeView === 'Remote Work', onClick: () => setActiveView('Remote Work') },
        { icon: GitBranch, label: 'Career Path', active: activeView === 'Career Path', onClick: () => setActiveView('Career Path') },

        // Tier 2 - People & Performance
        { icon: Award, label: 'Recruiter Perf', active: activeView === 'Recruiter Perf', onClick: () => setActiveView('Recruiter Perf') },
        { icon: Users, label: 'Referral Intelligence', active: activeView === 'Referral Intelligence', onClick: () => setActiveView('Referral Intelligence') },
        { icon: Target, label: 'Diversity Goals', active: activeView === 'Diversity Goals', onClick: () => setActiveView('Diversity Goals') },
        { icon: AlertTriangle, label: 'Bias Logs', active: activeView === 'Bias Logs', onClick: () => setActiveView('Bias Logs') },

        // Tier 3 - System & Compliance
        { icon: BarChart3, label: 'System Reports', active: activeView === 'System Reports', onClick: () => setActiveView('System Reports') },
        { icon: ShieldAlert, label: 'Security Logs', active: activeView === 'Security Logs', onClick: () => setActiveView('Security Logs') },
        { icon: Shield, label: 'Consent Mgmt', active: activeView === 'Consent Mgmt', onClick: () => setActiveView('Consent Mgmt') },

        // Tier 4 - Operations & Maintenance
        { icon: Briefcase, label: 'Vacancy Util', active: activeView === 'Vacancy Util', onClick: () => setActiveView('Vacancy Util') },
        { icon: Mail, label: 'Email Queue', active: activeView === 'Email Queue', onClick: () => setActiveView('Email Queue') },
        { icon: Database, label: 'Maintenance', active: activeView === 'Maintenance', onClick: () => setActiveView('Maintenance') },
        { icon: Layers, label: 'SQL Views', active: activeView === 'SQL Views', onClick: () => setActiveView('SQL Views') },
    ];

    const renderAdminContent = () => {
        switch (activeView) {
            case 'Core Analytics':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Gradient Header */}
                        <div className="glass-card rounded-[3rem] p-8 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/20">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                    <BarChart3 size={28} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tight">Core Analytics</h2>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Recruitment performance insights</p>
                                </div>
                            </div>
                        </div>

                        {analyticsLoading && (
                            <div className="flex items-center justify-center py-20">
                                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                                <span className="ml-3 text-sm font-black uppercase tracking-widest text-[var(--text-muted)]">Loading Analytics...</span>
                            </div>
                        )}

                        {/* === BIAS ANALYTICS SECTION === */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Geographic Bias */}
                            <div className="glass-card p-8 rounded-[2.5rem]">
                                <div className="flex items-center gap-3 mb-6">
                                    <Target className="w-5 h-5 text-indigo-500" />
                                    <h3 className="text-sm font-black uppercase tracking-widest">Geographic Bias Analysis</h3>
                                </div>
                                <div className="space-y-4">
                                    {biasData.location?.length > 0 ? (
                                        <BiasAnalysisChart
                                            data={biasData.location}
                                            dataKey="HireRatePercent"
                                            categoryKey="Location"
                                        />
                                    ) : (
                                        <div className="text-center py-8 text-xs font-black text-[var(--text-muted)] opacity-50 uppercase tracking-widest">No location data</div>
                                    )}
                                </div>
                            </div>

                            {/* Experience Bias */}
                            <div className="glass-card p-8 rounded-[2.5rem]">
                                <div className="flex items-center gap-3 mb-6">
                                    <Zap className="w-5 h-5 text-amber-500" />
                                    <h3 className="text-sm font-black uppercase tracking-widest">Experience Bias Analysis</h3>
                                </div>
                                <div className="space-y-4">
                                    {biasData.experience?.length > 0 ? (
                                        <BiasAnalysisChart
                                            data={biasData.experience}
                                            dataKey="HireRatePercent"
                                            categoryKey="ExperienceGroup"
                                        />
                                    ) : (
                                        <div className="text-center py-8 text-xs font-black text-[var(--text-muted)] opacity-50 uppercase tracking-widest">No experience data</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* === SKILL GAP RADAR & RECRUITER LEADERBOARD === */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Skill Gap Analysis */}
                            <div className="glass-card p-8 rounded-[2.5rem]">
                                <div className="flex items-center gap-3 mb-6">
                                    <Award className="w-5 h-5 text-violet-500" />
                                    <h3 className="text-sm font-black uppercase tracking-widest">Skill Gap Analysis</h3>
                                </div>
                                <div className="mt-4" style={{ height: '350px' }}>
                                    <SkillGapChart data={demoData.skillGapData} />
                                </div>
                            </div>

                            {/* Recruiter Leaderboard */}
                            <div className="glass-card p-8 rounded-[2.5rem]">
                                <div className="flex items-center gap-3 mb-6">
                                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                                    <h3 className="text-sm font-black uppercase tracking-widest">Top Recruiters</h3>
                                </div>
                                <div className="mt-4">
                                    {recruiterPerf.length > 0 ? (
                                        <RecruiterLeaderboardChart data={recruiterPerf} />
                                    ) : (
                                        <div className="text-center py-8 text-xs font-black text-[var(--text-muted)] opacity-50 uppercase tracking-widest">No recruiter data</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* === BOTTLENECK ALERTS & GHOSTING === */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Bottleneck Alerts */}
                            <div className="glass-card p-8 rounded-[2.5rem]">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-rose-500" />
                                        <h3 className="text-sm font-black uppercase tracking-widest">Pipeline Bottlenecks</h3>
                                    </div>
                                    <span className="text-[8px] font-black text-rose-500 bg-rose-500/10 px-2 py-1 rounded uppercase">Exceeding 7 days</span>
                                </div>
                                <div className="space-y-3">
                                    {bottlenecks.filter(b => b.AvgDaysInStage > 7).length > 0 ? bottlenecks.filter(b => b.AvgDaysInStage > 7).map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 font-black text-xs">
                                                    {item.AvgDaysInStage}d
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black uppercase">{item.StatusName}</p>
                                                    <p className="text-[10px] text-[var(--text-muted)]">{item.ApplicationsInStage} Candidates Stuck</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-rose-300" />
                                        </div>
                                    )) : bottlenecks.length > 0 ? (
                                        <div className="flex items-center justify-center gap-3 p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                                            <Check className="w-5 h-5 text-emerald-500" />
                                            <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Flow State: Healthy</span>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-xs font-black text-[var(--text-muted)] opacity-50 uppercase tracking-widest">No bottleneck data</div>
                                    )}
                                </div>
                            </div>

                            {/* Ghosting Alerts */}
                            <div className="glass-card p-8 rounded-[2.5rem]">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <ShieldAlert className="w-5 h-5 text-orange-500" />
                                        <h3 className="text-sm font-black uppercase tracking-widest">Ghosting Alerts</h3>
                                    </div>
                                    <span className="text-[8px] font-black text-orange-500 bg-orange-500/10 px-2 py-1 rounded uppercase">No contact {'>'} 14 days</span>
                                </div>
                                <div className="space-y-3">
                                    {riskAlerts.ghostingRisk?.length > 0 ? riskAlerts.ghostingRisk.slice(0, 5).map((candidate, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl">
                                            <div>
                                                <p className="text-xs font-black uppercase">{candidate.CandidateName}</p>
                                                <p className="text-[10px] text-[var(--text-muted)]">{candidate.JobTitle}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black text-orange-500">{candidate.DaysSinceLastContact}d</p>
                                                <p className="text-[8px] text-orange-400 uppercase">No Response</p>
                                            </div>
                                        </div>
                                    )) : riskAlerts.silentRejections?.length > 0 ? riskAlerts.silentRejections.slice(0, 5).map((candidate, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl">
                                            <div>
                                                <p className="text-xs font-black uppercase">{candidate.CandidateName}</p>
                                                <p className="text-[10px] text-[var(--text-muted)]">{candidate.JobTitle}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black text-orange-500">{candidate.DaysInactive}d</p>
                                                <p className="text-[8px] text-orange-400 uppercase">Inactive</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="flex items-center justify-center gap-3 p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                                            <Check className="w-5 h-5 text-emerald-500" />
                                            <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Queue Clean</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* === APPLICATION FUNNEL === */}
                        <div className="glass-card p-8 rounded-[2.5rem]">
                            <div className="flex items-center gap-3 mb-6">
                                <Activity className="w-5 h-5 text-indigo-500" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Application Funnel</h3>
                            </div>
                            <div className="mt-8">
                                <HiringFunnelChart data={funnelData} />
                            </div>
                        </div>

                        {/* === PHASE 1 ANALYTICS SECTIONS === */}

                        {/* Interviewer Consistency */}
                        <div className="glass-card p-8 rounded-[2.5rem]">
                            <div className="flex items-center gap-3 mb-6">
                                <Users className="w-5 h-5 text-violet-500" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Interviewer Consistency</h3>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">
                                High variance indicates inconsistent scoring patterns
                            </p>
                            <div className="mt-4">
                                <InterviewerPerformanceChart data={interviewerConsistency} />
                            </div>
                        </div>

                        {/* Interview Score vs Decision */}
                        <div className="glass-card p-8 rounded-[2.5rem]">
                            <div className="flex items-center gap-3 mb-6">
                                <Target className="w-5 h-5 text-blue-500" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Interview Score vs Decision</h3>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">
                                Correlation between interview scores and hiring outcomes
                            </p>
                            <div className="overflow-x-auto max-h-80">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-[var(--border-primary)]">
                                            <th className="py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Candidate</th>
                                            <th className="py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Avg Score</th>
                                            <th className="py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {interviewScoreDecision.length > 0 ? interviewScoreDecision.map((item, idx) => (
                                            <tr key={idx} className="border-b border-[var(--border-primary)]/30 hover:bg-white/5 transition-colors">
                                                <td className="py-3 font-bold text-sm">{item.FullName}</td>
                                                <td className="py-3 text-xs font-bold text-blue-500">{item.AvgInterviewScore?.toFixed(1) || '-'}</td>
                                                <td className="py-3">
                                                    <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${item.FinalStatus === 'Hired' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                        {item.FinalStatus || 'Pending'}
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="3" className="py-8 text-center text-xs font-black text-[var(--text-muted)] opacity-50 uppercase tracking-widest">No score decision data</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Rejection Analysis */}
                        <div className="glass-card p-8 rounded-[2.5rem]">
                            <div className="flex items-center gap-3 mb-6">
                                <XCircle className="w-5 h-5 text-rose-500" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Rejection Analysis</h3>
                            </div>
                            <div className="mt-4">
                                <RejectionAnalysisChart data={rejectionAnalysis} />
                            </div>
                        </div>

                        {/* Candidate Engagement */}
                        <div className="glass-card p-8 rounded-[2.5rem]">
                            <div className="flex items-center gap-3 mb-6">
                                <Activity className="w-5 h-5 text-emerald-500" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Candidate Engagement</h3>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">
                                Candidate responsiveness to interview scheduling
                            </p>
                            <div className="mt-4">
                                <EngagementTrendChart data={candidateEngagement} />
                            </div>
                        </div>

                        {/* Hire Rate Per Job */}
                        <div className="glass-card p-8 rounded-[2.5rem]">
                            <div className="flex items-center gap-3 mb-6">
                                <Briefcase className="w-5 h-5 text-indigo-500" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Hire Rate Per Job</h3>
                            </div>
                            <div className="mt-4">
                                {hireRatePerJob.length > 0 ? (
                                    <HireRatePerJobChart data={hireRatePerJob} />
                                ) : (
                                    <div className="col-span-3 text-center py-8 text-xs font-black text-[var(--text-muted)] opacity-50 uppercase tracking-widest">No hire rate data</div>
                                )}
                            </div>
                        </div>

                        {/* Time-to-Hire Individual */}
                        <div className="glass-card p-8 rounded-[2.5rem]">
                            <div className="flex items-center gap-3 mb-6">
                                <Zap className="w-5 h-5 text-amber-500" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Time-to-Hire Individual</h3>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">
                                Days from application to hire per candidate
                            </p>
                            <div className="overflow-x-auto max-h-80">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-[var(--border-primary)]">
                                            <th className="py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Candidate</th>
                                            <th className="py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Days to Hire</th>
                                            <th className="py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {timeToHireIndividual.length > 0 ? timeToHireIndividual.map((item, idx) => (
                                            <tr key={idx} className="border-b border-[var(--border-primary)]/30 hover:bg-white/5 transition-colors">
                                                <td className="py-3 font-bold text-sm">{item.FullName}</td>
                                                <td className="py-3">
                                                    <span className={`text-xs font-black ${item.DaysToHire <= 14 ? 'text-emerald-500' : item.DaysToHire <= 30 ? 'text-amber-500' : 'text-rose-500'}`}>
                                                        {item.DaysToHire} days
                                                    </span>
                                                </td>
                                                <td className="py-3">
                                                    <div className="w-20 h-2 bg-[var(--bg-accent)] rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${item.DaysToHire <= 14 ? 'bg-emerald-500' : item.DaysToHire <= 30 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                            style={{ width: `${Math.min((item.DaysToHire / 60) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="3" className="py-8 text-center text-xs font-black text-[var(--text-muted)] opacity-50 uppercase tracking-widest">No time-to-hire data</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'Maintenance':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Gradient Header */}
                        <div className="glass-card rounded-[3rem] p-8 bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                    <HardDrive size={28} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tight">Maintenance</h2>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">System configuration and archive management</p>
                                </div>
                            </div>
                        </div>

                        {/* Archive Engine Meta */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="glass-card p-10 rounded-[3rem] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16 transition-all group-hover:bg-indigo-500/20"></div>
                                <div className="flex items-center gap-6 mb-4">
                                    <div className="p-4 bg-indigo-500/10 rounded-2xl">
                                        <HardDrive className="text-indigo-500" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Archived Jobs</h3>
                                        <div className="text-4xl font-black mt-1">{archiveStats.archivedJobs}</div>
                                    </div>
                                </div>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60">
                                    Records relocated from production clusters
                                </p>
                            </div>

                            <div className="glass-card p-10 rounded-[3rem] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-16 -mt-16 transition-all group-hover:bg-emerald-500/20"></div>
                                <div className="flex items-center gap-6 mb-4">
                                    <div className="p-4 bg-emerald-500/10 rounded-2xl">
                                        <FileText className="text-emerald-500" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Archived Apps</h3>
                                        <div className="text-4xl font-black mt-1">{archiveStats.archivedApplications}</div>
                                    </div>
                                </div>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60">
                                    Applications stored in cold storage nodes
                                </p>
                            </div>
                        </div>

                        {/* Control Center */}
                        <div className="glass-card rounded-[3rem] p-12 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30"></div>
                            <div className="flex items-center justify-between mb-12">
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tighter">Maintenance Control Center</h3>
                                    <p className="text-xs text-[var(--text-muted)] mt-2 font-bold uppercase tracking-widest opacity-60">
                                        Last Synced: {archiveStats.lastUpdated ? new Date(archiveStats.lastUpdated).toLocaleTimeString() : 'Never'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => { fetchArchiveStats(); fetchArchiveTables(); }}
                                    className="p-4 bg-[var(--bg-accent)] rounded-2xl hover:bg-[var(--border-primary)] transition-all"
                                >
                                    <RefreshCw size={20} className={isProcessing ? 'animate-spin' : ''} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    { label: 'Data Archiving', desc: 'Relocate inactive records (>6 months) to cold storage.', icon: Trash2, color: 'indigo', endpoint: 'archive' },
                                    { label: 'PII Anonymization', desc: 'GDPR-compliant anonymization of personally identifiable information.', icon: UserX, color: 'rose', endpoint: 'anonymize' },
                                    { label: 'Consent Expiry', desc: 'Validate and revoke expired or stale candidate permissions.', icon: ShieldAlert, color: 'emerald', endpoint: 'consent-check' }
                                ].map((tool, i) => (
                                    <div key={i} className="flex flex-col h-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-[2.5rem] p-8 transition-all hover:border-indigo-500/30 group">
                                        <div className={`w-14 h-14 rounded-2xl bg-${tool.color}-500/10 flex items-center justify-center mb-6`}>
                                            <tool.icon className={`text-${tool.color}-500`} size={24} />
                                        </div>
                                        <h4 className="text-sm font-black uppercase tracking-widest mb-4 group-hover:text-indigo-500 transition-colors">{tool.label}</h4>
                                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mb-8 flex-1 font-medium font-italic">{tool.desc}</p>
                                        <button
                                            disabled={isProcessing}
                                            onClick={() => runMaintenance(tool.label, tool.endpoint)}
                                            className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${isProcessing === tool.label ? 'bg-slate-700 opacity-50 cursor-not-allowed' : `bg-${tool.color}-600 text-white hover:shadow-lg hover:shadow-${tool.color}-500/20`}`}
                                        >
                                            {isProcessing === tool.label ? 'Processing...' : `Initialize sp_${tool.endpoint}`}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Archive Data Tables */}
                        <div className="grid grid-cols-1 gap-8">
                            <div className="glass-card rounded-[3rem] p-10 relative overflow-hidden">
                                <h3 className="text-xl font-black uppercase tracking-tighter mb-8">Archived Job Postings</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-[var(--border-primary)]">
                                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Job ID</th>
                                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Title</th>
                                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Location</th>
                                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Archived At</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {archivedJobsData.length > 0 ? archivedJobsData.map((job, i) => (
                                                <tr key={i} className="border-b border-[var(--border-primary)]/30 hover:bg-white/5 transition-colors">
                                                    <td className="py-4 font-mono text-xs">{job.JobID}</td>
                                                    <td className="py-4 font-bold text-sm">{job.JobTitle}</td>
                                                    <td className="py-4 text-xs font-medium">{job.Location}</td>
                                                    <td className="py-4 text-[10px] font-bold opacity-60 uppercase">{new Date(job.ArchivedAt).toLocaleDateString()}</td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="4" className="py-20 text-center opacity-40 italic font-black uppercase tracking-widest text-[10px]">No archived jobs found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="glass-card rounded-[3rem] p-10 relative overflow-hidden">
                                <h3 className="text-xl font-black uppercase tracking-tighter mb-8">Archived Applications</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-[var(--border-primary)]">
                                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">App ID</th>
                                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Candidate Name</th>
                                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Email</th>
                                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">LinkedIn URL</th>
                                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Job Title</th>
                                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Status</th>
                                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Archived At</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {archivedAppsData.length > 0 ? archivedAppsData.map((app, i) => (
                                                <tr key={i} className="border-b border-[var(--border-primary)]/30 hover:bg-white/5 transition-colors">
                                                    <td className="py-4 font-mono text-xs">{app.ApplicationID}</td>
                                                    <td className="py-4 font-bold text-sm">{app.FullName || 'N/A'}</td>
                                                    <td className="py-4 text-xs font-medium">{app.Email || 'N/A'}</td>
                                                    <td className="py-4 text-xs">
                                                        {app.LinkedInURL ? (
                                                            <a
                                                                href={app.LinkedInURL}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-500 hover:text-blue-400 underline"
                                                            >
                                                                View Profile
                                                            </a>
                                                        ) : 'N/A'}
                                                    </td>
                                                    <td className="py-4 text-xs font-medium">{app.JobTitle || 'N/A'}</td>
                                                    <td className="py-4 text-xs font-medium">{app.StatusName || app.StatusID || 'N/A'}</td>
                                                    <td className="py-4 text-[10px] font-bold opacity-60 uppercase">{new Date(app.ArchivedAt).toLocaleDateString()}</td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="7" className="py-20 text-center opacity-40 italic font-black uppercase tracking-widest text-[10px]">No archived applications found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="text-center pb-8 border-t border-[var(--border-primary)] pt-8 mt-8">
                            <p className="text-[var(--text-muted)] font-bold uppercase tracking-[0.3em] text-[8px] opacity-40">
                                Warning: All maintenance procedures are logged in the Security Audit Trail.
                            </p>
                        </div>
                    </div>
                );
            case 'User Management':
                return (
                    <div className="glass-card rounded-[3rem] p-10 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                <Users size={24} className="text-indigo-500" /> User Access Control
                            </h3>
                            <button onClick={fetchUsers} className="p-3 bg-[var(--bg-accent)] rounded-xl hover:bg-[var(--border-primary)] transition-all">
                                <RefreshCw size={16} className={usersLoading ? 'animate-spin' : ''} />
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[var(--border-primary)]">
                                        <th className="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">User ID</th>
                                        <th className="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Credentials</th>
                                        <th className="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Role Mapping</th>
                                        <th className="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] flex justify-end">System Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length > 0 ? users.map((user) => (
                                        <tr key={user.UserID} className="border-b border-[var(--border-primary)]/30 hover:bg-white/5 transition-colors">
                                            <td className="py-4 font-mono text-xs">{user.UserID}</td>
                                            <td className="py-4">
                                                <div className="font-bold text-sm tracking-tight">{user.Username}</div>
                                                <div className="text-[10px] text-[var(--text-muted)] mt-1">{user.Email}</div>
                                            </td>
                                            <td className="py-4">
                                                <select
                                                    value={user.RoleID}
                                                    onChange={(e) => updateUserRole(user.UserID, parseInt(e.target.value))}
                                                    className="bg-[var(--bg-accent)] border border-[var(--border-primary)] text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
                                                >
                                                    <option value={1}>Administrator</option>
                                                    <option value={2}>Recruiter</option>
                                                    <option value={3}>Candidate</option>
                                                </select>
                                            </td>
                                            <td className="py-4 flex justify-end">
                                                <button
                                                    onClick={() => toggleUserStatus(user.UserID, !user.IsActive)}
                                                    className={`px-4 py-2 flex items-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${user.IsActive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20' : 'bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20'}`}
                                                >
                                                    {user.IsActive ? <><CheckCircle size={14} /> Active</> : <><XCircle size={14} /> Disabled</>}
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="py-20 text-center opacity-40 italic font-black uppercase tracking-widest text-[10px]">No users indexed</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'System Reports':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Gradient Header */}
                        <div className="glass-card rounded-[3rem] p-8 bg-gradient-to-r from-slate-500/5 to-blue-500/5 border border-slate-500/20">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-slate-500/10 flex items-center justify-center text-slate-500">
                                    <BarChart3 size={28} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tight">System Reports</h2>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Platform performance and user analytics</p>
                                </div>
                            </div>
                        </div>

                        {/* Recruitment Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-card p-8 rounded-[2.5rem]">
                                <div className="flex items-center gap-3 mb-4">
                                    <Users size={20} className="text-indigo-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Candidates</span>
                                </div>
                                <div className="text-3xl font-black">{systemStats?.candidates || 0}</div>
                                <div className="text-[10px] font-bold text-[var(--text-muted)] mt-2">In talent pool</div>
                            </div>
                            <div className="glass-card p-8 rounded-[2.5rem]">
                                <div className="flex items-center gap-3 mb-4">
                                    <Briefcase size={20} className="text-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Active Jobs</span>
                                </div>
                                <div className="text-3xl font-black">{systemStats?.activeJobs || 0}</div>
                                <div className="text-[10px] font-bold text-[var(--text-muted)] mt-2">Open positions</div>
                            </div>
                            <div className="glass-card p-8 rounded-[2.5rem]">
                                <div className="flex items-center gap-3 mb-4">
                                    <FileText size={20} className="text-blue-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Applications</span>
                                </div>
                                <div className="text-3xl font-black">{systemStats?.totalApplications || 0}</div>
                                <div className="text-[10px] font-bold text-[var(--text-muted)] mt-2">Total received</div>
                            </div>
                        </div>

                        {/* Additional Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="glass-card p-6 rounded-2xl border border-indigo-500/20">
                                <div className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Users</div>
                                <div className="text-2xl font-black text-indigo-500">{systemStats?.users || 0}</div>
                            </div>
                            <div className="glass-card p-6 rounded-2xl border border-emerald-500/20">
                                <div className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Interviews</div>
                                <div className="text-2xl font-black text-emerald-500">{systemStats?.scheduledInterviews || 0}</div>
                            </div>
                            <div className="glass-card p-6 rounded-2xl border border-blue-500/20">
                                <div className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Hired</div>
                                <div className="text-2xl font-black text-blue-500">{systemStats?.hiredCandidates || 0}</div>
                            </div>
                            <div className="glass-card p-6 rounded-2xl border border-amber-500/20">
                                <div className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Conversion</div>
                                <div className="text-2xl font-black text-amber-500">
                                    {systemStats?.totalApplications > 0
                                        ? Math.round((systemStats?.hiredCandidates / systemStats?.totalApplications) * 100)
                                        : 0}%
                                </div>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="glass-card rounded-[3rem] p-10">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                    <Users size={24} className="text-indigo-500" /> User Directory
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowCreateCandidateModal(true)}
                                        className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all flex items-center gap-2"
                                    >
                                        <UserPlus size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Create Candidate</span>
                                    </button>
                                    <button onClick={() => { fetchSystemStats(); fetchUsers(); }} className="p-3 bg-[var(--bg-accent)] rounded-xl hover:bg-[var(--border-primary)] transition-all">
                                        <RefreshCw size={16} className={systemStatsLoading ? 'animate-spin' : ''} />
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-[var(--border-primary)]">
                                            <th className="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">User ID</th>
                                            <th className="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Username</th>
                                            <th className="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Email</th>
                                            <th className="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Role</th>
                                            <th className="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length > 0 ? users.slice(0, 15).map((user) => (
                                            <tr key={user.UserID} className="border-b border-[var(--border-primary)]/30 hover:bg-white/5 transition-colors">
                                                <td className="py-4 font-mono text-xs">{user.UserID}</td>
                                                <td className="py-4 font-bold text-sm">{user.Username}</td>
                                                <td className="py-4 text-xs text-[var(--text-muted)]">{user.Email}</td>
                                                <td className="py-4">
                                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${user.RoleID === 1 ? 'bg-purple-500/10 text-purple-500' :
                                                        user.RoleID === 2 ? 'bg-blue-500/10 text-blue-500' :
                                                            'bg-emerald-500/10 text-emerald-500'
                                                        }`}>
                                                        {user.RoleName || (user.RoleID === 1 ? 'Admin' : user.RoleID === 2 ? 'Recruiter' : 'Candidate')}
                                                    </span>
                                                </td>
                                                <td className="py-4">
                                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${user.IsActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                                        }`}>
                                                        {user.IsActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="py-10 text-center opacity-40 italic font-black uppercase tracking-widest text-[10px]">Loading users...</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'Security Logs':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Gradient Header */}
                        <div className="glass-card rounded-[3rem] p-8 bg-gradient-to-r from-rose-500/5 to-orange-500/5 border border-rose-500/20">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                                    <ShieldAlert size={28} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tight">Security Logs</h2>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Platform audit trail and security events</p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card rounded-[3rem] p-10 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                    <ShieldAlert size={24} className="text-orange-500" /> Security Audit Trail
                                </h3>
                                <button onClick={fetchAuditLogs} className="p-3 bg-[var(--bg-accent)] rounded-xl hover:bg-[var(--border-primary)] transition-all">
                                    <RefreshCw size={16} className={auditLogsLoading ? 'animate-spin' : ''} />
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-[var(--border-primary)]">
                                            <th className="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Time</th>
                                            <th className="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Event Details</th>
                                            <th className="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Target</th>
                                            <th className="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] flex justify-end">Executed By</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {auditLogs.length > 0 ? auditLogs.map((log) => (
                                            <tr key={log.AuditID} className="border-b border-[var(--border-primary)]/30 hover:bg-white/5 transition-colors">
                                                <td className="py-4 text-xs font-mono opacity-60">
                                                    {new Date(log.ChangedAt).toLocaleString()}
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase ${log.Operation === 'UPDATE' ? 'bg-orange-500/10 text-orange-500' : log.Operation === 'INSERT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{log.Operation}</span>
                                                    </div>
                                                    <div className="text-[10px] font-mono opacity-60 mt-2 truncate max-w-xs">{log.OldValue} → {log.NewValue}</div>
                                                </td>
                                                <td className="py-4 text-xs font-bold">
                                                    {log.TableName} <span className="text-[var(--text-muted)]">#{log.RecordID}</span>
                                                </td>
                                                <td className="py-4 flex justify-end font-mono text-xs text-indigo-400">
                                                    @{log.ChangedBy || 'SYSTEM_CLR'}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={4} className="py-20 text-center opacity-40 italic font-black uppercase tracking-widest text-[10px]">No audit footprint detected</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'SQL Views':
                return <SQLViews />;
            case 'Recruiter Perf':
                return <RecruiterPerformanceAdmin />;
            case 'Consent Mgmt':
                return <ConsentManagement />;
            case 'Vacancy Util':
                return <VacancyUtilizationAdmin />;
            case 'Market Intel':
                // Calculate summary stats
                const totalSkills = marketData.length;
                const avgSalary = totalSkills > 0 ? Math.round(marketData.reduce((sum, item) => sum + (item.AvgSalary || 0), 0) / totalSkills) : 0;
                const shortageCount = marketData.filter(item => (item.DemandScore || 0) - (item.SupplyScore || 0) > 20).length;
                const oversupplyCount = marketData.filter(item => (item.SupplyScore || 0) - (item.DemandScore || 0) > 20).length;
                const risingSkills = marketData.filter(item => item.SalaryTrend === 'Rising').length;

                return (
                    <div key={`market-intel-${marketIntelKey}`} className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="glass-card rounded-[3rem] p-8 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-500/20">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <Globe size={28} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tight">Market Intelligence</h2>
                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Analyze market trends and skill demand patterns</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="glass-card rounded-[2rem] p-6 border border-indigo-500/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <Globe size={18} className="text-indigo-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Skills Tracked</span>
                                </div>
                                <div className="text-3xl font-black">{totalSkills}</div>
                                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Market intelligence</p>
                            </div>
                            <div className="glass-card rounded-[2rem] p-6 border border-emerald-500/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <DollarSign size={18} className="text-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Avg Salary</span>
                                </div>
                                <div className="text-3xl font-black">${(avgSalary / 1000).toFixed(0)}k</div>
                                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Market rate</p>
                            </div>
                            <div className="glass-card rounded-[2rem] p-6 border border-rose-500/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <TrendingUp size={18} className="text-rose-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Critical Shortage</span>
                                </div>
                                <div className="text-3xl font-black text-rose-500">{shortageCount}</div>
                                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">High demand skills</p>
                            </div>
                            <div className="glass-card rounded-[2rem] p-6 border border-amber-500/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <Zap size={18} className="text-amber-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Rising Salaries</span>
                                </div>
                                <div className="text-3xl font-black text-amber-500">{risingSkills}</div>
                                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Increasing pay</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Market Overview */}
                            <div className="glass-card rounded-[3rem] p-8">
                                <h3 className="text-lg font-black uppercase tracking-tight mb-6">Market Overview</h3>

                                {marketData.length > 0 ? (
                                    <div className="space-y-6">
                                        {/* Market Conditions Summary */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-6 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
                                                <h4 className="text-sm font-black uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
                                                    <AlertCircle size={16} /> Critical Shortages
                                                </h4>
                                                <div className="space-y-3">
                                                    {marketData.filter(item => item.MarketCondition === 'Critical Shortage').slice(0, 4).map((item, i) => (
                                                        <div key={i} className="flex items-center justify-between">
                                                            <span className="text-sm font-black">{item.SkillName}</span>
                                                            <span className="text-sm font-black text-red-500">{item.DemandScore}</span>
                                                        </div>
                                                    ))}
                                                    {marketData.filter(item => item.MarketCondition === 'Critical Shortage').length === 0 && (
                                                        <div className="text-center text-emerald-500 font-black">No critical shortages</div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-6 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
                                                <h4 className="text-sm font-black uppercase tracking-widest text-emerald-500 mb-4 flex items-center gap-2">
                                                    <TrendingUp size={16} /> Oversupply
                                                </h4>
                                                <div className="space-y-3">
                                                    {marketData.filter(item => item.MarketCondition === 'Oversupply').slice(0, 4).map((item, i) => (
                                                        <div key={i} className="flex items-center justify-between">
                                                            <span className="text-sm font-black">{item.SkillName}</span>
                                                            <span className="text-sm font-black text-emerald-500">{item.SupplyScore}</span>
                                                        </div>
                                                    ))}
                                                    {marketData.filter(item => item.MarketCondition === 'Oversupply').length === 0 && (
                                                        <div className="text-center text-emerald-500 font-black">No oversupply detected</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Top Skills by Demand */}
                                        <div className="p-6 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
                                            <h4 className="text-sm font-black uppercase tracking-widest text-indigo-500 mb-4 flex items-center gap-2">
                                                <TrendingUp size={16} /> Top Skills by Demand
                                            </h4>
                                            <div className="space-y-3">
                                                {marketData.sort((a, b) => (b.DemandScore || 0) - (a.DemandScore || 0)).slice(0, 5).map((item, i) => (
                                                    <div key={i} className="flex items-center justify-between">
                                                        <span className="text-sm font-black">{item.SkillName}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-black text-indigo-500">{item.DemandScore}</span>
                                                            <div className="w-20 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min((item.DemandScore / 100) * 100, 100)}%` }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-[var(--text-muted)]">
                                        <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No market data available yet.</p>
                                        <p className="text-xs mt-1">Connect to database to see market intelligence insights.</p>
                                    </div>
                                )}
                            </div>

                            {/* Market Analysis */}
                            <div className="glass-card rounded-[3rem] p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-black uppercase tracking-tight">Market Analysis</h3>
                                    <button
                                        onClick={() => { /* Refresh market data */ }}
                                        className="p-2 hover:bg-[var(--bg-accent)] rounded-xl transition-colors"
                                        title="Refresh"
                                    >
                                        <RefreshCw className="w-5 h-5 text-[var(--text-muted)]" />
                                    </button>
                                </div>

                                {marketData.length > 0 ? (
                                    <div className="space-y-6">
                                        {/* Demand vs Supply Chart */}
                                        <div className="p-6 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
                                            <div className="flex items-center gap-3 mb-4">
                                                <TrendingUp size={20} className="text-red-500" />
                                                <h4 className="text-sm font-black uppercase tracking-widest">Demand vs Supply</h4>
                                            </div>
                                            <div className="mt-4">
                                                <MarketIntelligenceChart data={marketData} type="demand-supply" />
                                            </div>
                                        </div>

                                        {/* Market Conditions Chart */}
                                        <div className="p-6 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
                                            <div className="flex items-center gap-3 mb-4">
                                                <PieChart size={20} className="text-violet-500" />
                                                <h4 className="text-sm font-black uppercase tracking-widest">Market Conditions</h4>
                                            </div>
                                            <div className="mt-4">
                                                <MarketIntelligenceChart data={marketData} type="conditions" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-[var(--text-muted)]">
                                        <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No market analysis data available.</p>
                                        <p className="text-xs mt-1">Connect to database to see market trends.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Skill Details */}
                        <div className="glass-card rounded-[3rem] p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black uppercase tracking-tight">Skill Details</h3>
                                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                                    {marketData.length} skills tracked
                                </span>
                            </div>

                            {marketData.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {marketData.map((item, idx) => (
                                        <div key={idx} className="p-6 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)] hover:bg-[var(--bg-accent)]/50 transition-colors">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="text-sm font-black">{item.SkillName || 'Unknown Skill'}</div>
                                                <div className={`text-[8px] font-black px-2 py-1 rounded-lg border ${item.MarketCondition === 'Critical Shortage' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                    item.MarketCondition === 'High Demand' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                                        item.MarketCondition === 'Oversupply' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                            'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                    }`}>
                                                    {item.MarketCondition || 'Balanced'}
                                                </div>
                                            </div>
                                            <div className="text-[10px] text-[var(--text-muted)] mb-4">{item.Location || 'Global'}</div>

                                            <div className="space-y-3 mb-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Demand</span>
                                                    <span className="text-sm font-black text-red-500">{item.DemandScore ?? '-'}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Supply</span>
                                                    <span className="text-sm font-black text-emerald-500">{item.SupplyScore ?? '-'}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Gap</span>
                                                    <span className={`text-sm font-black ${(item.ImbalanceScore ?? 0) > 0 ? 'text-orange-500' : 'text-blue-500'}`}>
                                                        {item.ImbalanceScore ?? '-'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-3 border-t border-[var(--border-primary)]">
                                                <span className={`flex items-center gap-1 ${item.SalaryTrend === 'Rising' ? 'text-emerald-500' :
                                                    item.SalaryTrend === 'Falling' ? 'text-rose-500' :
                                                        'text-[var(--text-muted)]'
                                                    }`}>
                                                    <TrendingUp size={12} />
                                                    {item.SalaryTrend || 'Stable'}
                                                </span>
                                                <span className="text-[10px] font-black">Fill: {item.TimeToFillDays ? `${item.TimeToFillDays}d` : '-'}</span>
                                                <span className={`text-[10px] font-black ${item.HiringDifficulty === 'Very Difficult' ? 'text-rose-500' :
                                                    item.HiringDifficulty === 'Difficult' ? 'text-orange-500' :
                                                        'text-emerald-500'
                                                    }`}>
                                                    {item.HiringDifficulty || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-[var(--text-muted)]">
                                    <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No skill data available yet.</p>
                                    <p className="text-xs mt-1">Connect to database to see detailed skill analysis.</p>
                                </div>
                            )}
                        </div>

                        {/* Empty State */}
                        {(!marketData || marketData.length === 0) && !analyticsLoading && (
                            <div className="glass-card rounded-[2.5rem] p-8 text-center">
                                <Globe className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
                                <p className="text-[var(--text-muted)]">No market intelligence data available yet.</p>
                                <p className="text-xs text-[var(--text-muted)] mt-1">Connect to database to see market trends and insights.</p>
                            </div>
                        )}
                    </div>
                );
            case 'Salary Transp':
                return <SalaryTransparencyAnalytics />;
            case 'Remote Work':
                return (
                    <RemoteWorkAnalytics
                        data={remoteData}
                        loading={analyticsLoading}
                    />
                );
            case 'Career Path':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Gradient Header */}
                        <div className="glass-card rounded-[3rem] p-8 bg-gradient-to-r from-violet-500/5 to-purple-500/5 border border-violet-500/20">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                                    <GitBranch size={28} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tight">Career Path</h2>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Career transition analytics and growth metrics</p>
                                </div>
                            </div>
                        </div>

                        {analyticsLoading && (
                            <div className="flex items-center justify-center py-20">
                                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                                <span className="ml-3 text-sm font-black uppercase tracking-widest text-[var(--text-muted)]">Loading Career Data...</span>
                            </div>
                        )}

                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="glass-card p-6 rounded-[2rem] border border-violet-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <GitBranch className="w-4 h-4 text-violet-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-violet-500">Career Tracks</span>
                                </div>
                                <div className="text-3xl font-black">{careerPathData.length}</div>
                                <p className="text-[9px] text-[var(--text-muted)]">Unique transitions</p>
                            </div>
                            <div className="glass-card p-6 rounded-[2rem] border border-emerald-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Avg Success</span>
                                </div>
                                <div className="text-3xl font-black">
                                    {careerPathData.length > 0
                                        ? `${Math.round(careerPathData.reduce((sum, item) => sum + (item.AvgProbability || 0), 0) / careerPathData.length)}%`
                                        : '0%'}
                                </div>
                                <p className="text-[9px] text-[var(--text-muted)]">Transition success rate</p>
                            </div>
                            <div className="glass-card p-6 rounded-[2rem] border border-blue-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="w-4 h-4 text-blue-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Avg Timeline</span>
                                </div>
                                <div className="text-3xl font-black">
                                    {careerPathData.length > 0
                                        ? Math.round(careerPathData.reduce((sum, item) => sum + (item.AvgMonthsToPromote || item.AvgTransitionMonths || 0), 0) / careerPathData.length)
                                        : 0}
                                </div>
                                <p className="text-[9px] text-[var(--text-muted)]">Months to promote</p>
                            </div>
                            <div className="glass-card p-6 rounded-[2rem] border border-amber-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="w-4 h-4 text-amber-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Avg Salary Growth</span>
                                </div>
                                <div className="text-3xl font-black">
                                    {careerPathData.length > 0
                                        ? `${Math.round(careerPathData.reduce((sum, item) => sum + (item.AvgSalaryIncreasePct || item.AvgSalaryIncrease || 0), 0) / careerPathData.length)}%`
                                        : '0%'}
                                </div>
                                <p className="text-[9px] text-[var(--text-muted)]">Salary increase</p>
                            </div>
                        </div>

                        {/* Career Transition Cards */}
                        <div className="glass-card p-8 rounded-[2.5rem]">
                            <div className="flex items-center gap-3 mb-6">
                                <GitBranch className="w-5 h-5 text-violet-500" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Organizational Career Transitions</h3>
                            </div>
                            <div className="space-y-4">
                                {careerPathData.length > 0 ? careerPathData.slice(0, 8).map((item, idx) => (
                                    <div key={idx} className="p-6 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="text-xs font-black">{item.CurrentRole || item.FromRole || 'Current Role'}</div>
                                                <ChevronRight className="w-4 h-4 text-violet-400" />
                                                <div className="text-sm font-black text-violet-500">{item.NextRole || item.ToRole || 'Next Role'}</div>
                                            </div>
                                            <span className="text-[10px] font-black px-3 py-1 bg-violet-500/10 text-violet-500 rounded-full">
                                                {item.TransitionCount || 0} candidates
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-[var(--border-primary)]">
                                            <div>
                                                <div className="text-[9px] text-[var(--text-muted)] uppercase">Success Rate</div>
                                                <div className="text-sm font-black text-emerald-500">{Math.round(item.AvgProbability || 0)}%</div>
                                            </div>
                                            <div>
                                                <div className="text-[9px] text-[var(--text-muted)] uppercase">Timeline</div>
                                                <div className="text-sm font-black text-blue-500">{Math.round(item.AvgMonthsToPromote || item.AvgTransitionMonths || 0)} mo</div>
                                            </div>
                                            <div>
                                                <div className="text-[9px] text-[var(--text-muted)] uppercase">Salary Growth</div>
                                                <div className="text-sm font-black text-amber-500">+{Math.round(item.AvgSalaryIncreasePct || item.AvgSalaryIncrease || 0)}%</div>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 text-xs font-black text-[var(--text-muted)] opacity-50 uppercase tracking-widest">
                                        No career path data available. Connect to database.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'Referral Intelligence':
                return <ReferralIntelligence />;
            case 'Diversity Goals':
                return <DiversityGoals />;
            case 'Bias Logs':
                return <BiasLogs />;
            case 'Email Queue':
                return <EmailQueueManager />;
            default:
                return null;
        }
    };

    // Render Create Candidate Modal
    const renderCreateCandidateModal = () => {
        if (!showCreateCandidateModal) return null;

        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 transition-opacity duration-300">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                    onClick={() => setShowCreateCandidateModal(false)}
                />

                {/* Modal */}
                <div className="relative bg-[var(--bg-primary)] border border-[var(--border-primary)] w-full max-w-lg overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col text-[var(--text-primary)]">
                    {/* Header */}
                    <div className="p-8 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-accent)]/20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                <UserPlus className="text-indigo-500" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black tracking-tight">Create Candidate</h3>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1 italic">Add new candidate to the system</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateCandidateModal(false)}
                            className="p-2 hover:bg-[var(--bg-tertiary)] rounded-xl transition-all"
                        >
                            <X size={20} className="text-[var(--text-muted)]" />
                        </button>
                    </div>

                    {/* Form */}
                    <div className="p-8">
                        <form onSubmit={handleCreateCandidate} className="space-y-6">
                            {/* Username */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
                                    Username <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newCandidate.username}
                                    onChange={(e) => setNewCandidate({ ...newCandidate, username: e.target.value })}
                                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
                                    Email <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={newCandidate.email}
                                    onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all"
                                    placeholder="Enter email"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
                                    Password <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={newCandidate.password}
                                    onChange={(e) => setNewCandidate({ ...newCandidate, password: e.target.value })}
                                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all"
                                    placeholder="Enter password"
                                    required
                                />
                            </div>

                            {/* Full Name */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
                                    Full Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newCandidate.fullName}
                                    onChange={(e) => setNewCandidate({ ...newCandidate, fullName: e.target.value })}
                                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all"
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    value={newCandidate.location}
                                    onChange={(e) => setNewCandidate({ ...newCandidate, location: e.target.value })}
                                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all"
                                    placeholder="Enter location (optional)"
                                />
                            </div>

                            {/* Years of Experience */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
                                    Years of Experience
                                </label>
                                <input
                                    type="number"
                                    value={newCandidate.yearsOfExperience}
                                    onChange={(e) => setNewCandidate({ ...newCandidate, yearsOfExperience: e.target.value })}
                                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all"
                                    placeholder="Enter years of experience (optional)"
                                    min="0"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateCandidateModal(false)}
                                    className="flex-1 px-6 py-4 rounded-2xl border border-[var(--border-primary)] text-[var(--text-secondary)] font-black uppercase text-xs tracking-widest hover:bg-[var(--bg-accent)] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreatingCandidate}
                                    className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black uppercase text-xs tracking-widest hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isCreatingCandidate ? (
                                        <>
                                            <RefreshCw size={16} className="animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={16} />
                                            Create Candidate
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <DashboardShell
            title="Database Intelligence"
            subtitle={activeView}
            navigation={adminNav}
            onProfileClick={() => { }}
        >
            {renderAdminContent()}
            {renderCreateCandidateModal()}
        </DashboardShell>
    );
};

export default AdminDashboard;
