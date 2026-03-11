import React from 'react';
import { Users, Calendar, CheckCircle, TrendingUp, Award, User, RefreshCw } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const RecruiterPerformanceAdmin = () => {
    const [performanceData, setPerformanceData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE}/analytics/recruiter-performance`);
                if (res.data && Array.isArray(res.data)) {
                    setPerformanceData(res.data);
                }
            } catch (err) {
                console.error("Recruiter Performance Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const sampleData = [
        { RecruiterName: 'John Smith', Department: 'Engineering', InterviewsConducted: 45, Hires: 12, SuccessRate: 27 },
        { RecruiterName: 'Sarah Johnson', Department: 'Product', InterviewsConducted: 38, Hires: 10, SuccessRate: 26 },
        { RecruiterName: 'Mike Brown', Department: 'Design', InterviewsConducted: 32, Hires: 8, SuccessRate: 25 },
        { RecruiterName: 'Emily Davis', Department: 'Marketing', InterviewsConducted: 28, Hires: 6, SuccessRate: 21 },
        { RecruiterName: 'Alex Wilson', Department: 'Sales', InterviewsConducted: 22, Hires: 5, SuccessRate: 23 }
    ];

    const displayData = performanceData.length > 0 ? performanceData : sampleData;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                <span className="ml-3 text-sm font-black uppercase tracking-widest text-[var(--text-muted)]">Loading Performance Data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="glass-card rounded-[3rem] p-8 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/20">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <Users size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Recruiter Performance</h2>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Interview and hire metrics per recruiter</p>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card rounded-[2rem] p-6 border border-indigo-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Users size={18} className="text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Total Recruiters</span>
                    </div>
                    <div className="text-3xl font-black">{displayData.length}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Active</p>
                </div>
                <div className="glass-card rounded-[2rem] p-6 border border-cyan-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Calendar size={18} className="text-cyan-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500">Interviews</span>
                    </div>
                    <div className="text-3xl font-black">{displayData.reduce((sum, r) => sum + (r.InterviewsConducted || 0), 0)}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Total Conducted</p>
                </div>
                <div className="glass-card rounded-[2rem] p-6 border border-emerald-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle size={18} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Hires</span>
                    </div>
                    <div className="text-3xl font-black">{displayData.reduce((sum, r) => sum + (r.Hires || 0), 0)}</div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Successful</p>
                </div>
                <div className="glass-card rounded-[2rem] p-6 border border-amber-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp size={18} className="text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Avg Success</span>
                    </div>
                    <div className="text-3xl font-black">
                        {displayData.length > 0 ? Math.round(displayData.reduce((sum, r) => sum + (r.SuccessRate || 0), 0) / displayData.length) : 0}%
                    </div>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Rate</p>
                </div>
            </div>

            {/* Detailed List */}
            <div className="glass-card rounded-[3rem] p-8">
                <h3 className="text-lg font-black uppercase tracking-tight mb-6">Recruiter Metrics Breakdown</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-primary)]">
                                <th className="text-left pb-4 pr-4">Recruiter</th>
                                <th className="text-left pb-4 pr-4">Department</th>
                                <th className="text-left pb-4 pr-4">Interviews</th>
                                <th className="text-left pb-4 pr-4">Hires</th>
                                <th className="text-left pb-4">Success Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-primary)]">
                            {displayData.map((recruiter, i) => (
                                <tr key={i} className="group hover:bg-[var(--bg-accent)] transition-colors">
                                    <td className="py-4 pr-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                                <User size={14} />
                                            </div>
                                            <span className="text-sm font-black">{recruiter.RecruiterName || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 pr-4">
                                        <span className="text-xs font-bold text-[var(--text-secondary)]">{recruiter.Department || 'N/A'}</span>
                                    </td>
                                    <td className="py-4 pr-4">
                                        <span className="text-sm font-black text-cyan-500">{recruiter.InterviewsConducted || 0}</span>
                                    </td>
                                    <td className="py-4 pr-4">
                                        <span className="text-sm font-black text-emerald-500">{recruiter.Hires || 0}</span>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 bg-[var(--bg-accent)] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-amber-500 rounded-full"
                                                    style={{ width: `${recruiter.SuccessRate || 0}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-black text-amber-500">{recruiter.SuccessRate || 0}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RecruiterPerformanceAdmin;
