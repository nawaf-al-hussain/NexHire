import React from 'react';
import {
    Lightbulb, Users, Briefcase, Clock, Zap, AlertCircle, RefreshCw,
    ChevronRight, TrendingDown, CheckCircle, XCircle
} from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const InterviewFatigueReducer = () => {
    const [candidates, setCandidates] = React.useState([]);
    const [jobs, setJobs] = React.useState([]);
    const [selectedCandidate, setSelectedCandidate] = React.useState('');
    const [selectedJob, setSelectedJob] = React.useState('');
    const [optimizationData, setOptimizationData] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [analyzing, setAnalyzing] = React.useState(false);
    const [error, setError] = React.useState(null);

    // Fetch candidates and jobs for selection
    React.useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [candidatesRes, jobsRes] = await Promise.all([
                axios.get(`${API_BASE}/recruiters/talent-pool`),
                axios.get(`${API_BASE}/jobs`)
            ]);
            setCandidates(candidatesRes.data || []);
            setJobs(jobsRes.data || []);
        } catch (err) {
            console.error("Fetch data error:", err);
            setError("Failed to load candidates and jobs");
        } finally {
            setLoading(false);
        }
    };

    const analyzeOptimization = async () => {
        if (!selectedCandidate || !selectedJob) {
            setError("Please select both a candidate and a job");
            return;
        }

        setAnalyzing(true);
        setError(null);
        setOptimizationData(null);

        try {
            const res = await axios.post(`${API_BASE}/interviews/optimize-rounds`, {
                candidateId: parseInt(selectedCandidate),
                jobId: parseInt(selectedJob)
            });
            setOptimizationData(res.data);
        } catch (err) {
            console.error("Optimization error:", err);
            setError(err.response?.data?.error || "Failed to analyze interview rounds");
        } finally {
            setAnalyzing(false);
        }
    };

    const getRoundsColor = (rounds) => {
        if (rounds === 2) return 'text-emerald-500';
        if (rounds === 3) return 'text-amber-500';
        return 'text-rose-500';
    };

    const getRedundancyColor = (count) => {
        if (count === 0) return 'text-emerald-500';
        if (count <= 3) return 'text-amber-500';
        return 'text-rose-500';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                <span className="ml-3 text-sm font-black uppercase tracking-widest text-[var(--text-muted)]">Loading Data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <Lightbulb className="text-amber-500" size={28} />
                        Interview Fatigue Reducer
                    </h2>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                        Optimize interview rounds and reduce candidate fatigue
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className="p-3 rounded-xl bg-[var(--bg-accent)] hover:bg-amber-500/10 transition-all"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Selection Panel */}
            <div className="glass-card rounded-[2rem] p-8 border border-[var(--border-primary)]">
                <h3 className="text-sm font-black uppercase tracking-widest text-amber-500 mb-6 flex items-center gap-2">
                    <Users size={16} /> Select Candidate & Job
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2 block">
                            Candidate
                        </label>
                        <select
                            value={selectedCandidate}
                            onChange={(e) => setSelectedCandidate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-primary)] text-[var(--text-primary)] font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="">Select a candidate...</option>
                            {candidates.map(c => (
                                <option key={c.CandidateID} value={c.CandidateID}>
                                    {c.FullName} - {c.YearsOfExperience}y exp
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2 block">
                            Job Position
                        </label>
                        <select
                            value={selectedJob}
                            onChange={(e) => setSelectedJob(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-primary)] text-[var(--text-primary)] font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="">Select a job...</option>
                            {jobs.map(j => (
                                <option key={j.JobID} value={j.JobID}>
                                    {j.JobTitle} - {j.Location}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    onClick={analyzeOptimization}
                    disabled={!selectedCandidate || !selectedJob || analyzing}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-black uppercase tracking-widest text-sm hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {analyzing ? (
                        <>
                            <RefreshCw size={18} className="animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Zap size={18} />
                            Analyze Interview Rounds
                        </>
                    )}
                </button>

                {error && (
                    <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                        <p className="text-rose-500 font-bold text-sm flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </p>
                    </div>
                )}
            </div>

            {/* Results */}
            {optimizationData && (
                <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass-card rounded-2xl p-5 border border-[var(--border-primary)]">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock size={14} className="text-amber-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Recommended Rounds</span>
                            </div>
                            <div className={`text-3xl font-black ${getRoundsColor(optimizationData.optimization.RecommendedInterviewRounds)}`}>
                                {optimizationData.optimization.RecommendedInterviewRounds}
                            </div>
                        </div>

                        <div className="glass-card rounded-2xl p-5 border border-[var(--border-primary)]">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingDown size={14} className="text-rose-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Redundant Questions</span>
                            </div>
                            <div className={`text-3xl font-black ${getRedundancyColor(optimizationData.optimization.RedundantQuestionsDetected)}`}>
                                {optimizationData.optimization.RedundantQuestionsDetected}
                            </div>
                        </div>

                        <div className="glass-card rounded-2xl p-5 border border-[var(--border-primary)]">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock size={14} className="text-blue-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Estimated Time</span>
                            </div>
                            <div className="text-3xl font-black text-blue-500">
                                {optimizationData.optimization.EstimatedMinutes}min
                            </div>
                        </div>

                        <div className="glass-card rounded-2xl p-5 border border-[var(--border-primary)]">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap size={14} className="text-emerald-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Time Saved</span>
                            </div>
                            <div className="text-3xl font-black text-emerald-500">
                                {optimizationData.optimization.TimeSavedMinutes}min
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Suggested Structure */}
                        <div className="glass-card rounded-[2rem] p-8 border border-[var(--border-primary)]">
                            <h3 className="text-sm font-black uppercase tracking-widest text-indigo-500 mb-6 flex items-center gap-2">
                                <Briefcase size={16} /> Suggested Interview Structure
                            </h3>
                            <div className="space-y-4">
                                {optimizationData.optimization.SuggestedStructure.split(' | ').map((round, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 bg-[var(--bg-accent)] rounded-xl">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-black text-sm">
                                            {i + 1}
                                        </div>
                                        <span className="font-bold text-sm">{round}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Redundancy Assessment */}
                        <div className="glass-card rounded-[2rem] p-8 border border-[var(--border-primary)]">
                            <h3 className="text-sm font-black uppercase tracking-widest text-amber-500 mb-6 flex items-center gap-2">
                                <AlertCircle size={16} /> Redundancy Assessment
                            </h3>
                            <div className={`p-4 rounded-xl mb-4 ${optimizationData.optimization.RedundantQuestionsDetected > 3 ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
                                <p className={`font-bold ${optimizationData.optimization.RedundantQuestionsDetected > 3 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {optimizationData.optimization.RedundancyAssessment}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="p-4 bg-[var(--bg-accent)] rounded-xl">
                                    <div className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
                                        Already Assessed Skills
                                    </div>
                                    <p className="text-sm font-bold">
                                        {optimizationData.optimization.AlreadyAssessedSkills}
                                    </p>
                                </div>

                                <div className="p-4 bg-[var(--bg-accent)] rounded-xl">
                                    <div className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
                                        Skills To Assess
                                    </div>
                                    <p className="text-sm font-bold">
                                        {optimizationData.optimization.SkillsToAssess}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Items */}
                    <div className="glass-card rounded-[2rem] p-8 border border-[var(--border-primary)]">
                        <h3 className="text-sm font-black uppercase tracking-widest text-emerald-500 mb-6 flex items-center gap-2">
                            <CheckCircle size={16} /> Recommendations
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle size={16} className="text-emerald-500" />
                                    <span className="font-black text-xs uppercase">Round Optimization</span>
                                </div>
                                <p className="text-sm text-[var(--text-muted)]">
                                    Reduce from 4+ rounds to {optimizationData.optimization.RecommendedInterviewRounds} for better candidate experience
                                </p>
                            </div>

                            <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle size={16} className="text-amber-500" />
                                    <span className="font-black text-xs uppercase">Question Rotation</span>
                                </div>
                                <p className="text-sm text-[var(--text-muted)]">
                                    {optimizationData.optimization.RedundantQuestionsDetected > 0
                                        ? 'Review and rotate repeated questions to maintain candidate engagement'
                                        : 'Question redundancy at acceptable levels'
                                    }
                                </p>
                            </div>

                            <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock size={16} className="text-blue-500" />
                                    <span className="font-black text-xs uppercase">Time Savings</span>
                                </div>
                                <p className="text-sm text-[var(--text-muted)]">
                                    Save approximately {optimizationData.optimization.TimeSavedMinutes} minutes per candidate interview process
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!optimizationData && !analyzing && !error && (
                <div className="glass-card rounded-[2rem] p-12 text-center border border-[var(--border-primary)]">
                    <Lightbulb size={48} className="mx-auto text-amber-500/30 mb-4" />
                    <p className="text-[var(--text-muted)] font-bold">
                        Select a candidate and job to analyze interview round optimization
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                        The system will analyze previous interview history and recommend optimal interview rounds
                    </p>
                </div>
            )}
        </div>
    );
};

export default InterviewFatigueReducer;
