import React from 'react';
import axios from 'axios';
import API_BASE from '../apiConfig';
import {
    LayoutDashboard, BarChart3, ShieldAlert, FileText, Database, Activity,
    RefreshCw, Layers, HardDrive, Trash2, UserX, Users, CheckCircle, XCircle,
    Briefcase, Shield, Award, ChevronRight, AlertCircle, Check, Target, Zap, TrendingUp,
    Globe, PieChart, DollarSign, MapPin, GitBranch, UsersRound
} from 'lucide-react';
import DashboardShell from '../components/DashboardShell';
import RecruiterPerformanceAdmin from '../components/Admin/RecruiterPerformanceAdmin';
import ConsentManagement from '../components/Admin/ConsentManagement';
import VacancyUtilizationAdmin from '../components/Admin/VacancyUtilizationAdmin';

const AdminDashboard = () => {
    const [activeView, setActiveView] = React.useState('Core Analytics');
    const [archiveStats, setArchiveStats] = React.useState({ archivedJobs: 0, archivedApplications: 0, lastUpdated: null });
    const [archivedJobsData, setArchivedJobsData] = React.useState([]);
    const [archivedAppsData, setArchivedAppsData] = React.useState([]);
    const [isProcessing, setIsProcessing] = React.useState(null);
    const [users, setUsers] = React.useState([]);
    const [usersLoading, setUsersLoading] = React.useState(false);
    const [auditLogs, setAuditLogs] = React.useState([]);
    const [auditLogsLoading, setAuditLogsLoading] = React.useState(false);

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

    // Demo data for when API is not available
    const demoData = {
        biasData: {
            location: [
                { Location: 'New York', HireRatePercent: 45.2 },
                { Location: 'San Francisco', HireRatePercent: 52.8 },
                { Location: 'Chicago', HireRatePercent: 38.5 },
                { Location: 'Austin', HireRatePercent: 61.2 },
                { Location: 'Seattle', HireRatePercent: 48.9 }
            ],
            experience: [
                { ExperienceGroup: '0-2 Years', HireRatePercent: 22.5 },
                { ExperienceGroup: '3-5 Years', HireRatePercent: 45.8 },
                { ExperienceGroup: '6-10 Years', HireRatePercent: 68.2 },
                { ExperienceGroup: '10+ Years', HireRatePercent: 55.4 }
            ]
        },
        skillGapData: [
            { SkillName: 'React', GapScore: 85, DemandRank: 1 },
            { SkillName: 'Node.js', GapScore: 72, DemandRank: 2 },
            { SkillName: 'Python', GapScore: 68, DemandRank: 3 },
            { SkillName: 'AWS', GapScore: 65, DemandRank: 4 },
            { SkillName: 'TypeScript', GapScore: 58, DemandRank: 5 },
            { SkillName: 'Docker', GapScore: 52, DemandRank: 6 }
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

            // Use demo data if API fails, otherwise use real data
            if (responses[0].status === 'fulfilled') setBiasData(responses[0].status === 'fulfilled' ? responses[0].value.data : demoData.biasData);
            if (responses[1].status === 'fulfilled') setSkillGapData(responses[1].status === 'fulfilled' ? responses[1].value.data : demoData.skillGapData);
            if (responses[2].status === 'fulfilled') setRecruiterPerf(responses[2].status === 'fulfilled' ? responses[2].value.data : demoData.recruiterPerf);
            if (responses[3].status === 'fulfilled') setVacancyData(responses[3].status === 'fulfilled' ? responses[3].value.data : demoData.vacancyData);
            if (responses[4].status === 'fulfilled') setBottlenecks(responses[4].status === 'fulfilled' ? responses[4].value.data : demoData.bottlenecks);
            if (responses[5].status === 'fulfilled') setRiskAlerts(responses[5].status === 'fulfilled' ? responses[5].value.data : demoData.riskAlerts);
            if (responses[6].status === 'fulfilled') setFunnelData(responses[6].status === 'fulfilled' ? responses[6].value.data : demoData.funnelData);

            // If any API failed, use demo data
            const anyFailed = responses.some(r => r.status !== 'fulfilled');
            if (anyFailed) {
                console.log("Using demo data - some APIs unavailable");
                setBiasData(demoData.biasData);
                setSkillGapData(demoData.skillGapData);
                setRecruiterPerf(demoData.recruiterPerf);
                setVacancyData(demoData.vacancyData);
                setBottlenecks(demoData.bottlenecks);
                setRiskAlerts(demoData.riskAlerts);
                setFunnelData(demoData.funnelData);
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
                axios.get(`${API_BASE}/analytics/career-path`),
                axios.get(`${API_BASE}/analytics/referral-intelligence`)
            ]);

            if (responses[0].status === 'fulfilled') setMarketData(responses[0].value.data);
            if (responses[1].status === 'fulfilled') setDiversityData(responses[1].value.data);
            if (responses[2].status === 'fulfilled') setSalaryData(responses[2].value.data);
            if (responses[3].status === 'fulfilled') setRemoteData(responses[3].value.data);
            if (responses[4].status === 'fulfilled') setCareerPathData(responses[4].value.data);
            if (responses[5].status === 'fulfilled') setReferralData(responses[5].value.data);
        } catch (err) {
            console.error("Failed to fetch advanced analytics:", err);
        } finally {
            setAnalyticsLoading(false);
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

    React.useEffect(() => {
        if (activeView === 'Maintenance') {
            fetchArchiveStats();
            fetchArchiveTables();
        } else if (activeView === 'User Management') {
            fetchUsers();
        } else if (activeView === 'Security Logs' || activeView === 'System Reports') {
            fetchAuditLogs();
        } else if (activeView === 'Core Analytics') {
            fetchAnalytics();
        } else if (['Market Intel', 'Diversity', 'Salary Transp', 'Remote Work', 'Career Path', 'Referral Intel'].includes(activeView)) {
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

    const adminNav = [
        { icon: LayoutDashboard, label: 'Core Analytics', active: activeView === 'Core Analytics', onClick: () => setActiveView('Core Analytics') },
        { icon: Globe, label: 'Market Intel', active: activeView === 'Market Intel', onClick: () => setActiveView('Market Intel') },
        { icon: UsersRound, label: 'Diversity', active: activeView === 'Diversity', onClick: () => setActiveView('Diversity') },
        { icon: DollarSign, label: 'Salary Transp', active: activeView === 'Salary Transp', onClick: () => setActiveView('Salary Transp') },
        { icon: MapPin, label: 'Remote Work', active: activeView === 'Remote Work', onClick: () => setActiveView('Remote Work') },
        { icon: GitBranch, label: 'Career Path', active: activeView === 'Career Path', onClick: () => setActiveView('Career Path') },
        { icon: Users, label: 'Referral Intel', active: activeView === 'Referral Intel', onClick: () => setActiveView('Referral Intel') },
        { icon: BarChart3, label: 'System Reports', active: activeView === 'System Reports', onClick: () => setActiveView('System Reports') },
        { icon: ShieldAlert, label: 'Security Logs', active: activeView === 'Security Logs', onClick: () => setActiveView('Security Logs') },
        { icon: Layers, label: 'SQL Views', active: activeView === 'SQL Views', onClick: () => setActiveView('SQL Views') },
        { icon: Database, label: 'Maintenance', active: activeView === 'Maintenance', onClick: () => setActiveView('Maintenance') },
        { icon: Award, label: 'Recruiter Perf', active: activeView === 'Recruiter Perf', onClick: () => setActiveView('Recruiter Perf') },
        { icon: Shield, label: 'Consent Mgmt', active: activeView === 'Consent Mgmt', onClick: () => setActiveView('Consent Mgmt') },
        { icon: Briefcase, label: 'Vacancy Util', active: activeView === 'Vacancy Util', onClick: () => setActiveView('Vacancy Util') },
    ];

    const renderAdminContent = () => {
        switch (activeView) {
            case 'Core Analytics':
                return (
                    <div className="space-y-8">
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
                                    {biasData.location?.length > 0 ? biasData.location.map((item, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span>{item.Location}</span>
                                                <span className="text-indigo-500">{item.HireRatePercent?.toFixed(1)}% hire rate</span>
                                            </div>
                                            <div className="h-2 bg-[var(--bg-accent)] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                                    style={{ width: `${item.HireRatePercent || 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    )) : (
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
                                    {biasData.experience?.length > 0 ? biasData.experience.map((item, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span>{item.ExperienceGroup}</span>
                                                <span className="text-amber-500">{item.HireRatePercent?.toFixed(1)}% hire rate</span>
                                            </div>
                                            <div className="h-2 bg-[var(--bg-accent)] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                                                    style={{ width: `${item.HireRatePercent || 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    )) : (
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
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {skillGapData.length > 0 ? skillGapData.slice(0, 8).map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
                                            <div>
                                                <div className="text-xs font-black">{item.SkillName}</div>
                                                <div className="text-[10px] text-[var(--text-muted)]">Gap: {item.GapScore || 0}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-black text-violet-500">{item.DemandRank || '-'}</div>
                                                <div className="text-[8px] text-[var(--text-muted)] uppercase">Demand Rank</div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-8 text-xs font-black text-[var(--text-muted)] opacity-50 uppercase tracking-widest">No skill gap data</div>
                                    )}
                                </div>
                            </div>

                            {/* Recruiter Leaderboard */}
                            <div className="glass-card p-8 rounded-[2.5rem]">
                                <div className="flex items-center gap-3 mb-6">
                                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                                    <h3 className="text-sm font-black uppercase tracking-widest">Top Recruiters</h3>
                                </div>
                                <div className="space-y-4">
                                    {recruiterPerf.length > 0 ? recruiterPerf.slice(0, 5).map((recruiter, idx) => {
                                        const convRate = recruiter.InterviewsConducted > 0
                                            ? ((recruiter.SuccessfulHires / recruiter.InterviewsConducted) * 100).toFixed(0)
                                            : 0;
                                        return (
                                            <div key={idx} className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <p className="text-xs font-black uppercase">{recruiter.RecruiterName}</p>
                                                    <p className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">{convRate}% Conv.</p>
                                                </div>
                                                <div className="w-full h-2 bg-[var(--bg-accent)] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500 rounded-full transition-all"
                                                        style={{ width: `${convRate}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                                                    <span>{recruiter.InterviewsConducted} Interviews</span>
                                                    <span>{recruiter.SuccessfulHires} Hires</span>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div className="text-center py-8 text-xs font-black text-[var(--text-muted)] opacity-50 uppercase tracking-widest">No recruiter data</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* === VACANCY UTILIZATION === */}
                        <div className="glass-card p-8 rounded-[2.5rem]">
                            <div className="flex items-center gap-3 mb-6">
                                <Briefcase className="w-5 h-5 text-blue-500" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Vacancy Utilization</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {vacancyData.length > 0 ? vacancyData.slice(0, 6).map((job, idx) => {
                                    const total = job.FilledPositions + job.RemainingVacancies;
                                    const percent = total > 0 ? (job.FilledPositions / total) * 100 : 0;
                                    const isCritical = percent < 25;
                                    return (
                                        <div key={idx} className="p-4 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="text-xs font-black truncate max-w-[120px]">{job.JobTitle}</p>
                                                <span className={`text-[8px] font-black px-2 py-1 rounded uppercase ${isCritical ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                    {job.FilledPositions}/{total}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-[var(--border-primary)] rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${isCritical ? 'bg-rose-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between mt-2 text-[8px] font-black text-[var(--text-muted)] uppercase">
                                                <span>{job.TotalApplications} Apps</span>
                                                <span>{job.RemainingVacancies} Left</span>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="col-span-3 text-center py-8 text-xs font-black text-[var(--text-muted)] opacity-50 uppercase tracking-widest">No vacancy data</div>
                                )}
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
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {funnelData.length > 0 ? funnelData.map((stage, idx) => {
                                    const maxVal = Math.max(...funnelData.map(d => d.ApplicationCount));
                                    const percent = maxVal > 0 ? (stage.ApplicationCount / maxVal) * 100 : 0;
                                    return (
                                        <div key={idx} className="text-center p-6 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
                                            <div className="text-3xl font-black mb-2">{stage.ApplicationCount}</div>
                                            <div className="text-[10px] font-black uppercase text-[var(--text-muted)] mb-4">{stage.StatusName}</div>
                                            <div className="h-2 bg-[var(--border-primary)] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500 rounded-full"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="col-span-4 text-center py-8 text-xs font-black text-[var(--text-muted)] opacity-50 uppercase tracking-widest">No funnel data</div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'Maintenance':
                return (
                    <div className="space-y-8">
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
                                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Candidate</th>
                                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Status</th>
                                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Archived At</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {archivedAppsData.length > 0 ? archivedAppsData.map((app, i) => (
                                                <tr key={i} className="border-b border-[var(--border-primary)]/30 hover:bg-white/5 transition-colors">
                                                    <td className="py-4 font-mono text-xs">{app.ApplicationID}</td>
                                                    <td className="py-4 font-bold text-sm">{app.CandidateID}</td>
                                                    <td className="py-4 text-xs font-medium">{app.StatusID}</td>
                                                    <td className="py-4 text-[10px] font-bold opacity-60 uppercase">{new Date(app.ArchivedAt).toLocaleDateString()}</td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="4" className="py-20 text-center opacity-40 italic font-black uppercase tracking-widest text-[10px]">No archived applications found</td>
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
                    <div className="space-y-8">
                        {/* Database Health */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-card p-8 rounded-[2.5rem]">
                                <div className="flex items-center gap-3 mb-4">
                                    <Database size={20} className="text-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Database Size</span>
                                </div>
                                <div className="text-3xl font-black">1.2 GB</div>
                                <div className="text-[10px] font-bold text-[var(--text-muted)] mt-2">12 Tables</div>
                            </div>
                            <div className="glass-card p-8 rounded-[2.5rem]">
                                <div className="flex items-center gap-3 mb-4">
                                    <Activity size={20} className="text-blue-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Active Connections</span>
                                </div>
                                <div className="text-3xl font-black">24</div>
                                <div className="text-[10px] font-bold text-[var(--text-muted)] mt-2">Peak: 156</div>
                            </div>
                            <div className="glass-card p-8 rounded-[2.5rem]">
                                <div className="flex items-center gap-3 mb-4">
                                    <HardDrive size={20} className="text-amber-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Query Latency</span>
                                </div>
                                <div className="text-3xl font-black">18ms</div>
                                <div className="text-[10px] font-bold text-[var(--text-muted)] mt-2">Avg: 22ms</div>
                            </div>
                        </div>

                        {/* System Events */}
                        <div className="glass-card rounded-[3rem] p-10">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                    <Activity size={24} className="text-blue-500" /> System Events Log
                                </h3>
                                <button onClick={fetchAuditLogs} className="p-3 bg-[var(--bg-accent)] rounded-xl hover:bg-[var(--border-primary)] transition-all">
                                    <RefreshCw size={16} className={auditLogsLoading ? 'animate-spin' : ''} />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {auditLogs.length > 0 ? auditLogs.slice(0, 10).map((log) => (
                                    <div key={log.AuditID} className="flex items-center justify-between p-4 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-2 rounded-full ${log.Operation === 'UPDATE' ? 'bg-orange-500' : log.Operation === 'INSERT' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                            <div>
                                                <div className="text-xs font-black">{log.TableName}</div>
                                                <div className="text-[10px] text-[var(--text-muted)]">{log.Operation}</div>
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-mono text-[var(--text-muted)]">
                                            {new Date(log.ChangedAt).toLocaleTimeString()}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 opacity-40 italic font-black uppercase tracking-widest text-[10px]">No system events recorded</div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'Security Logs':
                return (
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
                );
            case 'SQL Views':
                return (
                    <div className="glass-card rounded-[3rem] p-24 text-center flex flex-col items-center justify-center min-h-[500px]">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center mb-8 relative">
                            <Database className="text-indigo-500/30" size={40} />
                            <RefreshCw className="text-indigo-500 absolute animate-spin-slow" size={48} />
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">{activeView} Synchronizing</h2>
                        <p className="text-[var(--text-muted)] font-bold uppercase tracking-[0.2em] text-[11px] max-w-lg mx-auto leading-relaxed border-t border-[var(--border-primary)] pt-6 mt-2 opacity-60">
                            Establishing secure tunnel to production database node...
                            Indexing distributed T-SQL views for real-time aggregation.
                        </p>
                    </div>
                );
            case 'Recruiter Perf':
                return <RecruiterPerformanceAdmin />;
            case 'Consent Mgmt':
                return <ConsentManagement />;
            case 'Vacancy Util':
                return <VacancyUtilizationAdmin />;
            case 'Market Intel':
                return (
                    <div className="space-y-8">
                        {analyticsLoading && (
                            <div className="flex items-center justify-center py-20">
                                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                                <span className="ml-3 text-sm font-black uppercase tracking-widest text-[var(--text-muted)]">Loading Market Data...</span>
                            </div>
                        )}
                        <div className="glass-card p-8 rounded-[2.5rem]">
                            <div className="flex items-center gap-3 mb-6">
                                <Globe className="w-5 h-5 text-indigo-500" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Market Intelligence Dashboard</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {marketData.length > 0 ? marketData.slice(0, 6).map((item, idx) => (
                                    <div key={idx} className="p-6 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
                                        <div className="text-xs font-black mb-2">{item.Category || item.Skill || 'Market Trend'}</div>
                                        <div className="text-2xl font-black text-indigo-500">{item.Value || item.Count || item.Score || '-'}</div>
                                        <div className="text-[10px] text-[var(--text-muted)] mt-2 uppercase">{item.Trend || 'Stable'}</div>
                                    </div>
                                )) : (
                                    <div className="col-span-3 text-center py-10 text-xs font-black text-[var(--text-muted)] opacity-50 uppercase tracking-widest">
                                        No market data available. Connect to database.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'Diversity':
                return (
                    <div className="space-y-8">
                        {analyticsLoading && (
                            <div className="flex items-center justify-center py-20">
                                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                                <span className="ml-3 text-sm font-black uppercase tracking-widest text-[var(--text-muted)]">Loading Diversity Data...</span>
                            </div>
                        )}
                        <div className="glass-card p-8 rounded-[2.5rem]">
                            <div className="flex items-center gap-3 mb-6">
                                <UsersRound className="w-5 h-5 text-emerald-500" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Diversity Analytics Funnel</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {diversityData.length > 0 ? diversityData.slice(0, 6).map((item, idx) => (
                                    <div key={idx} className="p-6 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="text-xs font-black">{item.Demographic || item.Group || 'Group'}</div>
                                            <div className="text-lg font-black text-emerald-500">{item.Percentage || item.Count || '-'}</div>
                                        </div>
                                        <div className="h-2 bg-[var(--border-primary)] rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.Percentage || 50}%` }} />
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-2 text-center py-10 text-xs font-black text-[var(--text-muted)] opacity-50 uppercase tracking-widest">
                                        No diversity data available. Connect to database.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'Salary Transp':
                return (
                    <div className="space-y-8">
                        {analyticsLoading && (
                            <div className="flex items-center justify-center py-20">
                                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                                <span className="ml-3 text-sm font-black uppercase tracking-widest text-[var(--text-muted)]">Loading Salary Data...</span>
                            </div>
                        )}
                        <div className="glass-card p-8 rounded-[2.5rem]">
                            <div className="flex items-center gap-3 mb-6">
                                <DollarSign className="w-5 h-5 text-amber-500" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Salary Transparency Analytics</h3>
                            </div>
                            <div className="space-y-4">
                                {salaryData.length > 0 ? salaryData.slice(0, 8).map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
                                        <div>
                                            <div className="text-xs font-black">{item.Role || item.JobTitle || 'Position'}</div>
                                            <div className="text-[10px] text-[var(--text-muted)]">{item.Level || 'Mid Level'}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-black text-amber-500">${item.SalaryMin?.toLocaleString() || '0'} - ${item.SalaryMax?.toLocaleString() || '0'}</div>
                                            <div className="text-[8px] text-[var(--text-muted)] uppercase">Salary Range</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 text-xs font-black text-[var(--text-muted)] opacity-50 uppercase tracking-widest">
                                        No salary data available. Connect to database.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'Remote Work':
                return (
                    <div className="space-y-8">
                        {analyticsLoading && (
                            <div className="flex items-center justify-center py-20">
                                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                                <span className="ml-3 text-sm font-black uppercase tracking-widest text-[var(--text-muted)]">Loading Remote Data...</span>
                            </div>
                        )}
                        <div className="glass-card p-8 rounded-[2.5rem]">
                            <div className="flex items-center gap-3 mb-6">
                                <MapPin className="w-5 h-5 text-blue-500" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Remote Work Compatibility</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {remoteData.length > 0 ? remoteData.slice(0, 6).map((item, idx) => (
                                    <div key={idx} className="p-6 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
                                        <div className="text-xs font-black mb-2">{item.Role || item.JobTitle || 'Position'}</div>
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${item.RemoteScore >= 70 ? 'bg-emerald-500/10 text-emerald-500' : item.RemoteScore >= 40 ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                {item.RemoteScore || item.CompatibilityScore || 0}% Remote
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-3 text-center py-10 text-xs font-black text-[var(--text-muted)] opacity-50 uppercase tracking-widest">
                                        No remote compatibility data. Connect to database.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'Career Path':
                return (
                    <div className="space-y-8">
                        {analyticsLoading && (
                            <div className="flex items-center justify-center py-20">
                                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                                <span className="ml-3 text-sm font-black uppercase tracking-widest text-[var(--text-muted)]">Loading Career Data...</span>
                            </div>
                        )}
                        <div className="glass-card p-8 rounded-[2.5rem]">
                            <div className="flex items-center gap-3 mb-6">
                                <GitBranch className="w-5 h-5 text-violet-500" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Career Path Insights</h3>
                            </div>
                            <div className="space-y-4">
                                {careerPathData.length > 0 ? careerPathData.slice(0, 6).map((item, idx) => (
                                    <div key={idx} className="p-6 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-xs font-black">{item.CurrentRole || 'Current Position'}</div>
                                            <ChevronRight className="w-4 h-4 text-violet-400" />
                                        </div>
                                        <div className="text-sm font-black text-violet-500">{item.NextRole || 'Next Position'}</div>
                                        <div className="text-[10px] text-[var(--text-muted)] mt-2">
                                            {item.AvgTimeToPromo || item.MonthsToAdvance || 12} months avg. transition
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
            case 'Referral Intel':
                return (
                    <div className="space-y-8">
                        {analyticsLoading && (
                            <div className="flex items-center justify-center py-20">
                                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                                <span className="ml-3 text-sm font-black uppercase tracking-widest text-[var(--text-muted)]">Loading Referral Data...</span>
                            </div>
                        )}
                        <div className="glass-card p-8 rounded-[2.5rem]">
                            <div className="flex items-center gap-3 mb-6">
                                <Users className="w-5 h-5 text-orange-500" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Referral Intelligence</h3>
                            </div>
                            <div className="space-y-4">
                                {referralData.length > 0 ? referralData.slice(0, 6).map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
                                        <div>
                                            <div className="text-xs font-black">{item.Referrer || 'Employee'}</div>
                                            <div className="text-[10px] text-[var(--text-muted)]">{item.Department || 'Department'}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-black text-orange-500">{item.ReferralCount || item.Hires || 0}</div>
                                            <div className="text-[8px] text-[var(--text-muted)] uppercase">Referrals</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 text-xs font-black text-[var(--text-muted)] opacity-50 uppercase tracking-widest">
                                        No referral data available. Connect to database.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <DashboardShell
            title="Database Intelligence"
            subtitle={activeView}
            navigation={adminNav}
        >
            {renderAdminContent()}
        </DashboardShell>
    );
};

export default AdminDashboard;
