import React from 'react';
import { Briefcase, Users, TrendingUp, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const VacancyUtilizationAdmin = () => {
    const [vacancyData, setVacancyData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE}/analytics/vacancy-overview`);
                if (res.data && Array.isArray(res.data)) {
                    setVacancyData(res.data);
                }
            } catch (err) {
                console.error("Vacancy Overview Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getUtilizationColor = (filled, total) => {
        const percentage = total > 0 ? (filled / total) * 100 : 0;
        if (percentage >= 80) return 'text-emerald-500';
        if (percentage >= 50) return 'text-amber-500';
        return 'text-rose-500';
    };

    const getUtilizationBg = (filled, total) => {
        const percentage = total > 0 ? (filled / total) * 100 : 0;
        if (percentage >= 80) return 'bg-emerald-500';
        if (percentage >= 50) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    const sampleData = [
        { JobTitle: 'Senior Developer', Department: 'Engineering', TotalVacancies: 5, FilledPositions: 4, Applications: 45, HireRate: 20 },
        { JobTitle: 'UX Designer', Department: 'Design', TotalVacancies: 3, FilledPositions: 2, Applications: 32, HireRate: 15 },
        { JobTitle: 'Product Manager', Department: 'Product', TotalVacancies: 2, FilledPositions: 1, Applications: 28, HireRate: 25 },
        { JobTitle: 'Data Analyst', Department: 'Analytics', TotalVacancies: 4, FilledPositions: 1, Applications: 18, HireRate: 10 },
        { JobTitle: 'DevOps Engineer', Department: 'Engineering', TotalVacancies: 3, FilledPositions: 3, Applications: 52, HireRate: 35 }
    ];

    const displayData = vacancyData.length > 0 ? vacancyData : sampleData;

    const totalVacancies = displayData.reduce((sum, j) => sum + (j.TotalVacancies || 0), 0);
    const totalFilled = displayData.reduce((sum, j) => sum + (j.FilledPositions || 0), 0);
    const totalApplications = displayData.reduce((sum, j) => sum + (j.Applications || 0), 0);
    const overallUtilization = totalVacancies > 0 ? Math.round((totalFilled / totalVacancies) * 100) : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                <span className="ml-3 text-sm font-black uppercase tracking-widest text-[var(--text-muted)]">Loading Vacancy Data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Header */}
            <div className="glass-card rounded-[3rem] p-8 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-500/20">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Briefcase size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Vacancy Utilization</h2>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Job posting effectiveness overview</p>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card rounded-[2rem] p-6 border border-indigo-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Briefcase size={18} className="text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Total Jobs</span>
                    </div>
                    <div className="text-3xl font-black">{displayData.length}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Active Postings</p>
                </div>
                <div className="glass-card rounded-[2rem] p-6 border border-blue-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Users size={18} className="text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Vacancies</span>
                    </div>
                    <div className="text-3xl font-black">{totalVacancies}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Total Positions</p>
                </div>
                <div className="glass-card rounded-[2rem] p-6 border border-emerald-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle size={18} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Filled</span>
                    </div>
                    <div className="text-3xl font-black">{totalFilled}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Positions</p>
                </div>
                <div className="glass-card rounded-[2rem] p-6 border border-cyan-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp size={18} className="text-cyan-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500">Utilization</span>
                    </div>
                    <div className="text-3xl font-black">{overallUtilization}%</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Fill Rate</p>
                </div>
            </div>

            {/* Detailed List */}
            <div className="glass-card rounded-[3rem] p-8">
                <h3 className="text-lg font-black uppercase tracking-tight mb-6">Job Vacancy Breakdown</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-primary)]">
                                <th className="text-left pb-4 pr-4">Job Title</th>
                                <th className="text-left pb-4 pr-4">Department</th>
                                <th className="text-left pb-4 pr-4">Applications</th>
                                <th className="text-left pb-4 pr-4">Filled</th>
                                <th className="text-left pb-4 pr-4">Remaining</th>
                                <th className="text-left pb-4">Utilization</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-primary)]">
                            {displayData.map((job, i) => {
                                const remaining = (job.TotalVacancies || 0) - (job.FilledPositions || 0);
                                const utilization = (job.TotalVacancies || 0) > 0 ? Math.round((job.FilledPositions || 0) / job.TotalVacancies * 100) : 0;
                                return (
                                    <tr key={i} className="group hover:bg-[var(--bg-accent)] transition-colors">
                                        <td className="py-4 pr-4">
                                            <span className="text-sm font-black">{job.JobTitle || 'Unknown'}</span>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <span className="text-xs font-bold text-[var(--text-secondary)]">{job.Department || 'N/A'}</span>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <span className="text-sm font-black text-indigo-500">{job.Applications || 0}</span>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <span className="text-sm font-black text-emerald-500">{job.FilledPositions || 0}</span>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <span className={`text-sm font-black ${remaining > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                {remaining}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 bg-[var(--bg-accent)] rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${getUtilizationBg(job.FilledPositions, job.TotalVacancies)} rounded-full`}
                                                        style={{ width: `${utilization}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`text-xs font-black ${getUtilizationColor(job.FilledPositions, job.TotalVacancies)}`}>
                                                    {utilization}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VacancyUtilizationAdmin;
