import React, { useState } from 'react';
import { Briefcase, TrendingUp, Target, ArrowRight, Zap, Loader2, Sparkles } from 'lucide-react';
import CareerPathSimulator from './CareerPathSimulator';

const CareerPath = ({ careerPath, loading, onRefresh }) => {
    const [showSimulator, setShowSimulator] = useState(false);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Loading Career Insights...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header with Simulator Button */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-lg font-black uppercase tracking-tighter">Your Career Trajectory</h2>
                </div>
                <button
                    onClick={() => setShowSimulator(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors"
                >
                    <Sparkles className="w-4 h-4" />
                    Simulate New Path
                </button>
            </div>

            {/* Simulator CTA Card - Design System Pattern */}
            <div className="glass-card rounded-[2.5rem] p-8 bg-indigo-500/5 border border-indigo-500/20">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center">
                        <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-black">Career Path Simulator</h3>
                        <p className="text-sm text-[var(--text-muted)]">
                            Explore different career paths and see your success probability, timeline, and salary potential.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowSimulator(true)}
                        className="px-6 py-3 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors"
                    >
                        Try It Now
                    </button>
                </div>
            </div>

            {/* Career Path Data */}
            {(!careerPath || careerPath.length === 0) ? (
                <div className="glass-card p-12 rounded-[3rem] border-2 border-dashed border-[var(--border-primary)] text-center bg-[var(--bg-accent)]/5">
                    <Briefcase className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-6 opacity-20" />
                    <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-40 mb-4">
                        No career path data available yet.
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] opacity-60 mb-6">
                        Complete your profile and add skills to unlock career insights, or use the simulator above to explore possibilities.
                    </p>
                    <button
                        onClick={() => setShowSimulator(true)}
                        className="px-8 py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors"
                    >
                        <Sparkles className="w-4 h-4 inline mr-2" />
                        Simulate Career Path
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {careerPath.map((path, index) => (
                        <div
                            key={index}
                            className="glass-card p-8 rounded-[2.5rem] hover:border-indigo-500/30 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-indigo">
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
            )}

            {/* Career Tips - Design System Pattern */}
            <div className="glass-card rounded-[2.5rem] p-8 bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20">
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

            {/* Simulator Modal */}
            {showSimulator && (
                <CareerPathSimulator onClose={() => setShowSimulator(false)} />
            )}
        </div>
    );
};

export default CareerPath;
