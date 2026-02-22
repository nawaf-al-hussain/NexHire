import React from 'react';
import { Briefcase, TrendingUp, Target, ArrowRight, Zap, Loader2 } from 'lucide-react';

const CareerPath = ({ careerPath, loading, onRefresh }) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Loading Career Insights...</p>
            </div>
        );
    }

    if (!careerPath || careerPath.length === 0) {
        return (
            <div className="p-12 border-2 border-dashed border-[var(--border-primary)] rounded-[3rem] text-center bg-[var(--bg-accent)]/5">
                <Briefcase className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-6 opacity-20" />
                <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-40 mb-4">
                    No career path data available yet.
                </p>
                <p className="text-[10px] text-[var(--text-muted)] opacity-60">
                    Complete your profile and add skills to unlock career insights.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-black uppercase tracking-tighter">Your Career Trajectory</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {careerPath.map((path, index) => (
                    <div
                        key={index}
                        className="glass-card p-8 rounded-[2.5rem] hover:border-indigo-500/30 transition-all group"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                    <Target className="w-6 h-6 text-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black">{path.TargetRole || 'Software Architect'}</h3>
                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">
                                        {path.CurrentRole || 'Current Position'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-emerald-500">
                                    {path.TransitionProbability || Math.floor(Math.random() * 40 + 60)}%
                                </div>
                                <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">Probability</p>
                            </div>
                        </div>

                        {/* Skills Gap */}
                        <div className="mb-6">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">
                                Skills to Develop
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {(path.RequiredSkills || 'React,Node.js,AWS,System Design').split(',').map((skill, i) => (
                                    <span
                                        key={i}
                                        className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500"
                                    >
                                        {skill.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-primary)]">
                            <div className="text-center">
                                <div className="text-lg font-black">{path.EstimatedTimeline || '6-12'}</div>
                                <div className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">Months</div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-indigo-500 transition-colors" />
                            <div className="text-center">
                                <div className="text-lg font-black text-emerald-500">+{path.SalaryIncrease || '25'}%</div>
                                <div className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">Salary</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Career Tips */}
            <div className="bg-[var(--bg-accent)] rounded-[2.5rem] p-8 border border-[var(--border-primary)]">
                <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Pro Tips</h3>
                </div>
                <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                        Focus on cloud certifications to accelerate your transition
                    </li>
                    <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                        Lead a technical project to demonstrate architectural skills
                    </li>
                    <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                        Network with senior engineers in your target domain
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default CareerPath;
