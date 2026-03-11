import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, BookOpen, Target, AlertTriangle, CheckCircle, Zap, BarChart3, Loader2, ArrowRight } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const SkillGapAnalysis = ({ skillGaps: initialSkillGaps, loading: initialLoading, onRefresh, onNavigateToLearning }) => {
    const [skillGaps, setSkillGaps] = useState([]);
    const [skillsDemand, setSkillsDemand] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('gaps');

    useEffect(() => {
        if (initialSkillGaps) {
            setSkillGaps(initialSkillGaps);
            setLoading(initialLoading || false);
        } else {
            fetchSkillGapData();
        }
        fetchSkillsDemand();
    }, [initialSkillGaps, initialLoading]);

    const fetchSkillGapData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/candidates/skill-gap-analysis`);
            setSkillGaps(res.data);
        } catch (err) {
            console.error("Fetch Skill Gap Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSkillsDemand = async () => {
        try {
            const res = await axios.get(`${API_BASE}/candidates/skills-demand`);
            setSkillsDemand(res.data);
        } catch (err) {
            console.error("Fetch Skills Demand Error:", err);
        }
    };

    const getGapCategoryStyle = (category) => {
        switch (category) {
            case 'Critical Gap':
                return 'bg-rose-500/10 border-rose-500/20 text-rose-500';
            case 'Learning Opportunity':
                return 'bg-amber-500/10 border-amber-500/20 text-amber-500';
            case 'Adequate':
                return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
            default:
                return 'bg-gray-500/10 border-gray-500/20 text-gray-500';
        }
    };

    const getTrendIcon = (direction) => {
        switch (direction) {
            case 'Up':
            case 'Rising':
                return <TrendingUp className="w-4 h-4 text-emerald-500" />;
            case 'Down':
            case 'Falling':
                return <TrendingDown className="w-4 h-4 text-rose-500" />;
            default:
                return <Minus className="w-4 h-4 text-gray-500" />;
        }
    };

    const getDemandLevelBars = (level) => {
        return Array.from({ length: 5 }, (_, i) => (
            <div
                key={i}
                className={`w-2 h-6 rounded-sm ${i < level ? 'bg-indigo-500' : 'bg-[var(--bg-accent)]'}`}
            ></div>
        ));
    };

    const getProficiencyBars = (level) => {
        return Array.from({ length: 5 }, (_, i) => (
            <div
                key={i}
                className={`w-2 h-6 rounded-sm ${i < level ? 'bg-emerald-500' : 'bg-[var(--bg-accent)]'}`}
            ></div>
        ));
    };

    const criticalGaps = skillGaps.filter(s => s.GapCategory === 'Critical Gap' || s.GapScore > 2);
    const learningOpportunities = skillGaps.filter(s => s.GapCategory === 'Learning Opportunity');
    const adequateSkills = skillGaps.filter(s => s.GapCategory === 'Adequate');

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Analyzing Skill Gaps...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-black uppercase tracking-tighter">Skill Gap Analysis</h2>
            </div>

            {/* Tab Buttons */}
            <div className="flex items-center gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('gaps')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeTab === 'gaps'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-[var(--bg-accent)] border border-[var(--border-primary)] text-[var(--text-muted)]'
                        }`}
                >
                    My Gaps
                </button>
                <button
                    onClick={() => setActiveTab('market')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeTab === 'market'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-[var(--bg-accent)] border border-[var(--border-primary)] text-[var(--text-muted)]'
                        }`}
                >
                    Market Demand
                </button>
            </div>

            {activeTab === 'gaps' ? (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="glass-card rounded-[2rem] p-6 border border-rose-500/20">
                            <div className="flex items-center gap-3 mb-2">
                                <AlertTriangle size={18} className="text-rose-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Critical Gaps</span>
                            </div>
                            <div className="text-3xl font-black">{criticalGaps.length}</div>
                            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Need Attention</p>
                        </div>
                        <div className="glass-card rounded-[2rem] p-6 border border-amber-500/20">
                            <div className="flex items-center gap-3 mb-2">
                                <BookOpen size={18} className="text-amber-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Learning Ops</span>
                            </div>
                            <div className="text-3xl font-black">{learningOpportunities.length}</div>
                            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Available</p>
                        </div>
                        <div className="glass-card rounded-[2rem] p-6 border border-emerald-500/20">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle size={18} className="text-emerald-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Adequate</span>
                            </div>
                            <div className="text-3xl font-black">{adequateSkills.length}</div>
                            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Skills Strong</p>
                        </div>
                    </div>

                    {/* Skill Gaps List */}
                    {skillGaps.length === 0 ? (
                        <div className="p-12 border-2 border-dashed border-[var(--border-primary)] rounded-[3rem] text-center bg-[var(--bg-accent)]/5">
                            <BarChart3 className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-6 opacity-20" />
                            <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-40 mb-4">
                                No skill gap data available yet.
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)] opacity-60">
                                Add skills to your profile to see gap analysis.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {skillGaps.map((skill, index) => (
                                <div
                                    key={`${skill.SkillID}-${index}`}
                                    className="glass-card p-8 rounded-[2.5rem] hover:border-indigo-500/30 transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                                <Target className="w-6 h-6 text-indigo-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black">{skill.SkillName}</h3>
                                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">
                                                    {skill.GapCategory || 'Gap'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-rose-500">
                                                {skill.GapScore || 0}
                                            </div>
                                            <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">Gap Score</p>
                                        </div>
                                    </div>

                                    {/* Skills Gap */}
                                    <div className="mb-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">
                                            Your Proficiency vs Market Demand
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Your Level</span>
                                                    <span className="text-xs font-black">{skill.ProficiencyLevel || 0}/5</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {getProficiencyBars(skill.ProficiencyLevel || 0)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Market Demand</span>
                                                    <span className="text-xs font-black">{skill.DemandLevel || 0}/5</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {getDemandLevelBars(skill.DemandLevel || 0)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    {skill.GapCategory === 'Critical Gap' && (
                                        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-primary)]">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${getGapCategoryStyle(skill.GapCategory)}`}>
                                                {skill.GapCategory}
                                            </span>
                                            <button
                                                onClick={() => onNavigateToLearning && onNavigateToLearning(skill.SkillName)}
                                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition-colors"
                                            >
                                                Start Learning
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <>
                    {/* Market Demand View */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="glass-card rounded-[2rem] p-6 border border-indigo-500/20">
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp size={18} className="text-indigo-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Highest Demand</span>
                            </div>
                            <div className="text-3xl font-black">
                                {skillsDemand.length > 0 ? skillsDemand[0]?.SkillName : 'N/A'}
                            </div>
                            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">In Market</p>
                        </div>
                        <div className="glass-card rounded-[2rem] p-6 border border-emerald-500/20">
                            <div className="flex items-center gap-3 mb-2">
                                <BarChart3 size={18} className="text-emerald-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Skills Tracked</span>
                            </div>
                            <div className="text-3xl font-black">{skillsDemand.length}</div>
                            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Market Data</p>
                        </div>
                    </div>

                    {/* Skills Demand List */}
                    {skillsDemand.length === 0 ? (
                        <div className="p-12 border-2 border-dashed border-[var(--border-primary)] rounded-[3rem] text-center bg-[var(--bg-accent)]/5">
                            <BarChart3 className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-6 opacity-20" />
                            <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-40 mb-4">
                                No market data available yet.
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)] opacity-60">
                                Market intelligence data is being collected.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {skillsDemand.map((skill, index) => (
                                <div
                                    key={`skill-${skill.SkillID}-${index}`}
                                    className="glass-card p-6 rounded-[2rem] hover:border-indigo-500/30 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                                <span className="text-sm font-black text-indigo-500">{index + 1}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black">{skill.SkillName}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {getTrendIcon(skill.TrendDirection)}
                                                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">
                                                        {skill.TrendDirection || 'Stable'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {skill.AvgSalary && (
                                            <span className="text-lg font-black text-emerald-500">
                                                ${skill.AvgSalary.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Demand</span>
                                                <span className="text-[10px] font-black">{skill.DemandScore || 0}%</span>
                                            </div>
                                            <div className="h-2 bg-[var(--bg-accent)] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500 rounded-full"
                                                    style={{ width: `${skill.DemandScore || 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Supply</span>
                                                <span className="text-[10px] font-black">{skill.SupplyScore || 0}%</span>
                                            </div>
                                            <div className="h-2 bg-[var(--bg-accent)] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full"
                                                    style={{ width: `${skill.SupplyScore || 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Pro Tips */}
            <div className="bg-[var(--bg-accent)] rounded-[2.5rem] p-8 border border-[var(--border-primary)]">
                <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Pro Tips</h3>
                </div>
                <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                        Focus on skills with high demand but low supply for better job prospects
                    </li>
                    <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                        Prioritize critical gaps to improve your application success rate
                    </li>
                    <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                        Use the Learning Paths tab to generate personalized training plans
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default SkillGapAnalysis;
