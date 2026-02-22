import React from 'react';
import { Users, Search, Target, AlertCircle, FileText, MapPin, Briefcase, Filter, ChevronRight, Sparkles, Share2, Globe, UserPlus } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const TalentPool = () => {
    const [candidates, setCandidates] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isSearching, setIsSearching] = React.useState(false);

    const fetchPool = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/recruiters/talent-pool`);
            setCandidates(res.data);
        } catch (err) {
            console.error("Talent Pool Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchPool();
    }, [fetchPool]);

    const handleSearch = async (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (val.length < 2) {
            if (val.length === 0) fetchPool();
            return;
        }

        setIsSearching(true);
        try {
            const res = await axios.post(`${API_BASE}/recruiters/search`, { name: val });
            // Since fuzzy search only returns ID/Name/Scores, we map back to full candidate data if possible
            // or just show the fuzzy results. For UX, we'll fetch full data for those IDs
            if (res.data.length > 0) {
                setCandidates(res.data); // Simplified for now, in production we'd join more data
            }
        } catch (err) {
            console.error("Search Error:", err);
        } finally {
            setIsSearching(false);
        }
    };

    const getRiskColor = (risk) => {
        switch (risk) {
            case 'High': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            case 'Medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Fuzzy Search Talent Pool (e.g. 'Jhon' for 'John')..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    />
                    {isSearching && (
                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
                <button className="p-5 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-[1.5rem] hover:border-indigo-500/50 transition-all">
                    <Filter size={20} className="text-[var(--text-muted)]" />
                </button>
            </div>

            {/* Talent Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="glass-card h-64 rounded-[2.5rem] animate-pulse"></div>
                    ))}
                </div>
            ) : candidates.length === 0 ? (
                <div className="glass-card rounded-[3rem] p-20 text-center">
                    <div className="w-20 h-20 bg-indigo-500/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                        <Users className="text-indigo-500/30" size={32} />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight">No Candidates Found</h3>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-2 italic">Try adjusting your search criteria</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {candidates.map((candidate) => (
                        <div key={candidate.CandidateID} className="glass-card rounded-[2.5rem] p-8 group hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-500 border border-transparent hover:border-indigo-500/20">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
                                    {candidate.FullName.charAt(0)}
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getRiskColor(candidate.GhostingRisk)}`}>
                                    Risk: {candidate.GhostingRisk || 'Low'}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-black tracking-tight mb-1 group-hover:text-indigo-500 transition-colors">{candidate.FullName}</h3>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                                    <span className="flex items-center gap-1.5"><MapPin size={12} className="text-indigo-500" /> {candidate.Location || 'Remote'}</span>
                                    <span className="w-1 h-1 bg-[var(--border-primary)] rounded-full"></span>
                                    <span className="flex items-center gap-1.5"><Briefcase size={12} className="text-emerald-500" /> {candidate.YearsExperience}y Exp</span>
                                </div>
                                {/* Referral Source Badge */}
                                <div className="mt-3">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${candidate.ReferralSource === 'Employee Referral' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' :
                                            candidate.ReferralSource === 'LinkedIn' ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' :
                                                candidate.ReferralSource === 'Indeed' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                                                    candidate.ReferralSource === 'Glassdoor' ? 'bg-purple-500/10 border-purple-500/30 text-purple-500' :
                                                        'bg-slate-500/10 border-slate-500/30 text-slate-500'
                                        }`}>
                                        <Share2 size={10} />
                                        {candidate.ReferralSource || 'Direct Application'}
                                    </span>
                                </div>
                            </div>

                            {/* Resume Quality & Skills */}
                            <div className="space-y-4 mb-8">
                                <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                                            <FileText size={12} /> Resume Score
                                        </span>
                                        <span className="text-xs font-black">{candidate.ResumeScore || 0}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-[var(--bg-accent)] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${candidate.ResumeScore || 0}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {candidate.Skills ? candidate.Skills.split(', ').slice(0, 3).map((skill, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-xl text-[9px] font-bold tracking-tight">
                                            {skill}
                                        </span>
                                    )) : (
                                        <span className="text-[9px] font-bold text-[var(--text-muted)] italic">No skills extracted</span>
                                    )}
                                    {candidate.Skills && candidate.Skills.split(', ').length > 3 && (
                                        <span className="px-3 py-1.5 text-[9px] font-black text-indigo-500">+{candidate.Skills.split(', ').length - 3}</span>
                                    )}
                                </div>
                            </div>

                            <button className="w-full py-4 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-all shadow-xl shadow-transparent group-hover:shadow-indigo-500/30">
                                View Profile <ChevronRight size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TalentPool;
