import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobCard from './JobCard';
import { Loader2, Search, Filter, Briefcase, Archive, ArchiveRestore, Plus, Bot, FileX } from 'lucide-react';
import API_BASE from '../../apiConfig';

const JobList = ({ refreshTrigger, onDeleteJob, onFindMatches, onOpenPipeline, onUpdateJob, onOpenJobModal, onOpenScreeningBot, onOpenAutoRejection }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showArchived, setShowArchived] = useState(false);

    const [matches, setMatches] = useState({});

    useEffect(() => {
        fetchJobs();
    }, [refreshTrigger, showArchived]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            // Fetch jobs with isActive filter based on showArchived state
            const isActiveFilter = showArchived ? 'false' : 'true';
            const res = await axios.get(`${API_BASE}/jobs?isActive=${isActiveFilter}`);
            const jobsData = res.data;
            setJobs(jobsData);
            setError('');

            // Fetch matches for each job
            const matchPromises = jobsData.map(async (job) => {
                try {
                    const matchRes = await axios.get(`${API_BASE}/jobs/${job.JobID}/matches`);
                    return { id: job.JobID, data: matchRes.data };
                } catch (err) {
                    return { id: job.JobID, data: [] };
                }
            });

            const matchResults = await Promise.all(matchPromises);
            const matchesMap = {};
            matchResults.forEach(res => {
                matchesMap[res.id] = res.data;
            });
            setMatches(matchesMap);
        } catch (err) {
            console.error("Fetch Jobs Error:", err);
            setError('Failed to load job postings.');
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job => {
        // Filter by search term only (server-side filtering for isActive)
        return (job.JobTitle ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (job.Location ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Restore job to active
    const handleRestoreJob = async (jobId) => {
        if (window.confirm("Restore this job posting to active status?")) {
            try {
                await axios.put(`${API_BASE}/jobs/${jobId}`, { isActive: true });
                // Refresh jobs to update the list
                fetchJobs();
            } catch (err) {
                console.error("Restore Job Error:", err);
                alert("Failed to restore job.");
            }
        }
    };

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
            {/* Gradient Header */}
            <div className="glass-card rounded-[3rem] p-8 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <Briefcase size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Active Job Postings</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Manage and track your job listings</p>
                        </div>
                    </div>
                    <button
                        onClick={onOpenJobModal}
                        className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                    >
                        <Plus size={18} />
                        Post Job
                    </button>
                </div>
            </div>

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
                    <button
                        onClick={() => setShowArchived(!showArchived)}
                        className={`p-4 border rounded-2xl transition-all ${showArchived
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                            : 'bg-[var(--bg-accent)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-amber-500'
                            }`}
                        title={showArchived ? 'Show Active' : 'Show Archives'}
                    >
                        {showArchived ? <ArchiveRestore size={18} /> : <Archive size={18} />}
                    </button>
                    <button
                        onClick={onOpenAutoRejection}
                        className="p-4 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl text-[var(--text-secondary)] hover:text-rose-500 transition-all"
                        title="Auto Rejection"
                    >
                        <FileX size={18} />
                    </button>
                    <button
                        onClick={onOpenScreeningBot}
                        className="p-4 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl text-[var(--text-secondary)] hover:text-indigo-500 transition-all"
                        title="Screening Bot"
                    >
                        <Bot size={18} />
                    </button>
                    <button className="p-4 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl text-[var(--text-secondary)] hover:text-indigo-500 transition-all">
                        <Filter size={18} />
                    </button>
                    <div className="px-5 py-3 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl flex items-center gap-3">
                        <Briefcase size={14} className="text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{filteredJobs.length} {showArchived ? 'Archived' : 'Active'} Roles</span>
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
                            onDelete={showArchived ? handleRestoreJob : onDeleteJob}
                            onFindMatches={() => onFindMatches(job)}
                            onOpenPipeline={() => onOpenPipeline(job)}
                            onUpdateJob={onUpdateJob}
                            matches={matches[job.JobID] || []}
                            isArchived={showArchived}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default JobList;
