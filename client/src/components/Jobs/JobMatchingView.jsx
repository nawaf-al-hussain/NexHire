import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Users, Search, Sparkles, ChevronRight, BrainCircuit, Loader2 } from 'lucide-react';
import API_BASE from '../../apiConfig';

const JobMatchingView = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [matchesByJob, setMatchesByJob] = useState({});
    const [loadingMatches, setLoadingMatches] = useState(false);

    useEffect(() => {
        fetchJobsAndMatches();
    }, []);

    const fetchJobsAndMatches = async () => {
        setLoading(true);
        try {
            const jobsRes = await axios.get(`${API_BASE}/jobs`);
            const activeJobs = jobsRes.data.filter(j => j.IsActive && !j.IsDeleted);
            setJobs(activeJobs);

            setLoadingMatches(true);
            const matchesData = {};
            // For a production app, we'd want a single endpoint, 
            // but for this demo, we can fetch concurrently for the top active jobs.
            const matchPromises = activeJobs.slice(0, 5).map(async (job) => {
                try {
                    const res = await axios.get(`${API_BASE}/jobs/${job.JobID}/matches?topN=3`);
                    return { id: job.JobID, data: res.data };
                } catch (err) {
                    return { id: job.JobID, data: [] };
                }
            });

            const results = await Promise.all(matchPromises);
            results.forEach(res => {
                matchesData[res.id] = res.data;
            });
            setMatchesByJob(matchesData);
        } catch (err) {
            console.error("Fetch Global Matches Error:", err);
        } finally {
            setLoading(false);
            setLoadingMatches(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 space-y-6">
                <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
                <p className="text-[10px] font-black text-indigo-500/60 uppercase tracking-widest animate-pulse">Scanning Global Talent Pool...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-xl font-black uppercase tracking-tighter">Global Talent Synchronization</h2>
                    </div>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60">Cross-referencing active roles with high-proficiency candidates</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-6 py-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center gap-3">
                        <Users size={16} className="text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{jobs.length} Active Streams</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-10">
                {jobs.slice(0, 5).map(job => (
                    <div key={job.JobID} className="glass-card rounded-[3rem] p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full -mr-32 -mt-32 transition-all group-hover:bg-indigo-500/10"></div>

                        <div className="flex flex-col lg:flex-row gap-10 relative z-10">
                            {/* Job Info */}
                            <div className="lg:w-1/3 space-y-6">
                                <div className="p-6 bg-indigo-500/10 rounded-[2.5rem] border border-indigo-500/20 w-fit">
                                    <Target className="text-indigo-500" size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight mb-2">{job.JobTitle}</h3>
                                    <div className="flex items-center gap-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">
                                        <span>{job.Location}</span>
                                        <div className="w-1 h-1 rounded-full bg-[var(--text-muted)]"></div>
                                        <span>{job.Vacancies} Vacancies</span>
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:translate-x-1 transition-all group/btn">
                                        View Full Pipeline <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>

                            {/* Top Matches */}
                            <div className="flex-1 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Heuristic Rank Benchmarks</h4>
                                    {loadingMatches && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {(matchesByJob[job.JobID] || []).map((match, idx) => (
                                        <div key={idx} className="bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-[2rem] p-6 hover:border-indigo-500/30 transition-all group/match">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`text-xs font-black ${idx === 0 ? 'text-emerald-500' : 'text-indigo-500/50'}`}>#{idx + 1}</div>
                                                <div className="text-[18px] font-black tracking-tighter">{match.TotalMatchScore}%</div>
                                            </div>
                                            <p className="text-[11px] font-black uppercase tracking-tight mb-1 truncate">{match.FullName}</p>
                                            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60 mb-4">{match.MatchCategory}</p>

                                            <div className="w-full h-1 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500 transition-all duration-1000"
                                                    style={{ width: `${match.TotalMatchScore}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!matchesByJob[job.JobID] || matchesByJob[job.JobID].length === 0) && !loadingMatches && (
                                        <div className="col-span-3 py-10 bg-indigo-500/5 rounded-[2rem] border border-dashed border-indigo-500/20 text-center">
                                            <p className="text-[10px] font-black text-indigo-500/40 uppercase tracking-widest">No Matches Synced Yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JobMatchingView;
