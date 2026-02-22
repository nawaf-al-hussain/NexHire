import React, { useState } from 'react';
import { DollarSign, TrendingUp, Target, Sparkles, Loader2, Calculator } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const SalaryCoach = ({ salaryData, loading, applications }) => {
    const [generating, setGenerating] = useState(false);
    const [negotiationResult, setNegotiationResult] = useState(null);
    const [selectedJob, setSelectedJob] = useState('');
    const [currentSalary, setCurrentSalary] = useState('');
    const [targetSalary, setTargetSalary] = useState('');

    const handleGenerateStrategy = async () => {
        if (!selectedJob) {
            alert('Please select a job first.');
            return;
        }
        setGenerating(true);
        try {
            const res = await axios.post(`${API_BASE}/candidates/salary-coach/negotiate`, {
                jobID: selectedJob,
                currentSalary: parseInt(currentSalary) || 0,
                targetSalary: parseInt(targetSalary) || 0
            });
            setNegotiationResult(res.data);
        } catch (err) {
            console.error('Generate Strategy Error:', err);
            alert('Failed to generate negotiation strategy.');
        } finally {
            setGenerating(false);
        }
    };

    if (loading || generating) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                    {generating ? 'Analyzing Market Data...' : 'Loading Salary Insights...'}
                </p>
            </div>
        );
    }

    // Sample market data
    const sampleData = salaryData && salaryData.length > 0 ? salaryData : [
        { SkillName: 'JavaScript', DemandScore: 95, AverageSalary: 95000, TrendDirection: 'Up' },
        { SkillName: 'React', DemandScore: 92, AverageSalary: 105000, TrendDirection: 'Up' },
        { SkillName: 'Node.js', DemandScore: 88, AverageSalary: 100000, TrendDirection: 'Stable' },
        { SkillName: 'SQL', DemandScore: 85, AverageSalary: 92000, TrendDirection: 'Up' },
        { SkillName: 'AWS', DemandScore: 90, AverageSalary: 115000, TrendDirection: 'Up' }
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-black uppercase tracking-tighter">Salary Coach</h2>
            </div>

            {/* Market Insights */}
            <div className="glass-card p-8 rounded-[2.5rem]">
                <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Market Demand Insights</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sampleData.slice(0, 6).map((skill, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)]">
                            <div>
                                <p className="text-xs font-black">{skill.SkillName}</p>
                                <p className="text-[10px] text-[var(--text-muted)]">Avg: ${(skill.AverageSalary || 90000).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-xs font-black ${(skill.TrendDirection || 'Up') === 'Up' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    {(skill.TrendDirection || 'Up') === 'Up' ? '↑' : '→'} {(skill.DemandScore || 85)}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Negotiation Strategy */}
            <div className="glass-card p-8 rounded-[2.5rem]">
                <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Negotiation Strategy Generator</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <select
                        value={selectedJob}
                        onChange={(e) => setSelectedJob(e.target.value)}
                        className="bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500"
                    >
                        <option value="">Select a job...</option>
                        {applications && applications.map((app) => (
                            <option key={app.ApplicationID} value={app.JobID}>
                                {app.JobTitle} - {app.StatusName}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        placeholder="Current Salary"
                        value={currentSalary}
                        onChange={(e) => setCurrentSalary(e.target.value)}
                        className="bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500"
                    />

                    <input
                        type="number"
                        placeholder="Target Salary"
                        value={targetSalary}
                        onChange={(e) => setTargetSalary(e.target.value)}
                        className="bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500"
                    />
                </div>

                <button
                    onClick={handleGenerateStrategy}
                    disabled={generating}
                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <Calculator size={16} />
                    Generate Strategy
                </button>
            </div>

            {/* Results */}
            {negotiationResult && (
                <div className="glass-card p-8 rounded-[2.5rem] border-emerald-500/30">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-4 text-emerald-500">Your Personalized Strategy</h3>
                    <pre className="text-xs text-[var(--text-muted)] whitespace-pre-wrap">
                        {JSON.stringify(negotiationResult, null, 2)}
                    </pre>
                </div>
            )}

            {/* Tips */}
            <div className="bg-[var(--bg-accent)] rounded-[2.5rem] p-8 border border-[var(--border-primary)]">
                <div className="flex items-center gap-3 mb-4">
                    <Target className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Negotiation Tips</h3>
                </div>
                <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                        Research market rates before negotiating
                    </li>
                    <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                        Highlight your unique value proposition
                    </li>
                    <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                        Practice your pitch with confidence
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default SalaryCoach;
