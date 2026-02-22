import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobCard from './JobCard';
import { Loader2, Search, Filter, Briefcase } from 'lucide-react';
import API_BASE from '../../apiConfig';

const JobList = ({ refreshTrigger, onDeleteJob, onFindMatches, onOpenPipeline }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchJobs();
    }, [refreshTrigger]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/jobs`);
            setJobs(res.data);
            setError('');
        } catch (err) {
            console.error("Fetch Jobs Error:", err);
            setError('Failed to load job postings.');
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job =>
        (job.JobTitle ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.Location ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest animate-pulse">Synchronizing Jobs...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card p-12 rounded-[2.5rem] bg-rose-500/5 border border-rose-500/10 text-center">
                <p className="text-rose-500 font-black text-xs uppercase tracking-widest">{error}</p>
                <button onClick={fetchJobs} className="mt-6 text-[10px] font-black text-[var(--text-muted)] hover:text-indigo-500 uppercase tracking-widest underline transition-colors">Retry Connection</button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                <div className="relative flex-1 w-full max-w-xl group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Filter by title or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-[2rem] py-5 pl-16 pr-8 text-sm text-[var(--text-primary)] focus:bg-white/10 dark:focus:bg-white/5 focus:border-indigo-500/30 outline-none transition-all placeholder:text-[var(--text-muted)] font-bold"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-5 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl text-[var(--text-secondary)] hover:text-indigo-500 transition-all">
                        <Filter size={20} />
                    </button>
                    <div className="px-6 py-4 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl flex items-center gap-3">
                        <Briefcase size={16} className="text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{jobs.length} Total Roles</span>
                    </div>
                </div>
            </div>

            {filteredJobs.length === 0 ? (
                <div className="glass-card p-24 rounded-[3rem] text-center flex flex-col items-center">
                    <div className="w-20 h-20 rounded-[2rem] bg-[var(--bg-accent)] flex items-center justify-center mb-8 border border-[var(--border-primary)]">
                        <Briefcase className="text-[var(--text-muted)]" size={32} />
                    </div>
                    <h4 className="text-xl font-black text-[var(--text-muted)] uppercase tracking-tighter">No Job Postings Found</h4>
                    <p className="text-xs text-[var(--text-muted)] font-bold mt-2 uppercase tracking-widest italic opacity-50">Initiate a new recruitment cycle to begin</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredJobs.map(job => (
                        <JobCard
                            key={job.JobID}
                            job={job}
                            onDelete={onDeleteJob}
                            onFindMatches={() => onFindMatches(job)}
                            onOpenPipeline={() => onOpenPipeline(job)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default JobList;
