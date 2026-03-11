import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../../apiConfig';
import {
    Target, TrendingUp, Clock, DollarSign, Zap, ChevronRight,
    Loader2, Sparkles, Briefcase, Award, AlertCircle, CheckCircle,
    ArrowRight, Lightbulb, X
} from 'lucide-react';

const CareerPathSimulator = ({ onClose }) => {
    const [targetRole, setTargetRole] = useState('');
    const [timeline, setTimeline] = useState(5);
    const [availableRoles, setAvailableRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [simulationResult, setSimulationResult] = useState(null);
    const [error, setError] = useState(null);
    const [customRole, setCustomRole] = useState('');
    const [useCustomRole, setUseCustomRole] = useState(false);

    // Fetch available roles on mount
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await axios.get(`${API_BASE}/candidates/career-path/roles`);
                setAvailableRoles(res.data || []);
            } catch (err) {
                console.error("Failed to fetch roles:", err);
                // Fallback roles
                setAvailableRoles([
                    'Software Architect',
                    'Senior Software Engineer',
                    'Engineering Manager',
                    'Technical Lead',
                    'Data Scientist',
                    'DevOps Engineer',
                    'Product Manager',
                    'Full Stack Developer',
                    'Machine Learning Engineer',
                    'Cloud Architect'
                ]);
            } finally {
                setLoadingRoles(false);
            }
        };
        fetchRoles();
    }, []);

    const handleSimulate = async () => {
        const role = useCustomRole ? customRole : targetRole;
        if (!role) {
            setError("Please select or enter a target role.");
            return;
        }

        setLoading(true);
        setError(null);
        setSimulationResult(null);

        try {
            const res = await axios.post(`${API_BASE}/candidates/career-path/simulate`, {
                targetRole: role,
                years: timeline
            });
            setSimulationResult(res.data);
        } catch (err) {
            console.error("Simulation Error:", err);
            setError(err.response?.data?.error || "Failed to simulate career path. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getProbabilityColor = (probability) => {
        if (probability >= 0.8) return 'text-emerald-500';
        if (probability >= 0.6) return 'text-blue-500';
        if (probability >= 0.4) return 'text-amber-500';
        return 'text-rose-500';
    };

    const getProbabilityBg = (probability) => {
        if (probability >= 0.8) return 'bg-emerald-500/10 border-emerald-500/20';
        if (probability >= 0.6) return 'bg-blue-500/10 border-blue-500/20';
        if (probability >= 0.4) return 'bg-amber-500/10 border-amber-500/20';
        return 'bg-rose-500/10 border-rose-500/20';
    };

    const getFeasibilityIcon = (feasibility) => {
        if (feasibility?.includes('Highly')) return <CheckCircle className="w-5 h-5 text-emerald-500" />;
        if (feasibility?.includes('Achievable')) return <TrendingUp className="w-5 h-5 text-blue-500" />;
        if (feasibility?.includes('Challenging')) return <AlertCircle className="w-5 h-5 text-amber-500" />;
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-[var(--bg-primary)] border border-[var(--border-primary)] w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col text-[var(--text-primary)]">
                {/* Header - Design System: Header Card Pattern */}
                <div className="p-8 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-accent)]/20">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                            <Sparkles size={28} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight">Career Path Simulator</h2>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1 italic">
                                Explore your future career possibilities
                            </p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-all"
                        >
                            <X className="w-5 h-5 text-[var(--text-muted)]" />
                        </button>
                    )}
                </div>

                {/* Input Section */}
                <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Target Role Selection - Design System: Glass Card for inputs */}
                        <div className="glass-card rounded-[2rem] p-6 border border-indigo-500/10">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 block">
                                Target Role
                            </label>

                            {/* Toggle between select and custom input */}
                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={() => setUseCustomRole(false)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!useCustomRole
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-[var(--bg-accent)] text-[var(--text-muted)] hover:bg-[var(--bg-accent)]/80'
                                        }`}
                                >
                                    Select Role
                                </button>
                                <button
                                    onClick={() => setUseCustomRole(true)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${useCustomRole
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-[var(--bg-accent)] text-[var(--text-muted)] hover:bg-[var(--bg-accent)]/80'
                                        }`}
                                >
                                    Custom Role
                                </button>
                            </div>

                            {!useCustomRole ? (
                                <select
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    disabled={loadingRoles}
                                    className="w-full px-6 py-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] text-sm font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                                >
                                    <option value="">{loadingRoles ? 'Loading roles...' : 'Select a target role'}</option>
                                    {availableRoles.map((role, index) => (
                                        <option key={index} value={role}>{role}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={customRole}
                                    onChange={(e) => setCustomRole(e.target.value)}
                                    placeholder="e.g., Chief Technology Officer"
                                    className="w-full px-6 py-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] text-sm font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                                />
                            )}
                        </div>

                        {/* Timeline Slider - Design System: Glass Card */}
                        <div className="glass-card rounded-[2rem] p-6 border border-indigo-500/10">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2 block">
                                Timeline: {timeline} Year{timeline !== 1 ? 's' : ''}
                            </label>
                            <div className="pt-4">
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={timeline}
                                    onChange={(e) => setTimeline(parseInt(e.target.value))}
                                    className="w-full h-2 bg-[var(--bg-accent)] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                                <div className="flex justify-between text-[10px] font-bold text-[var(--text-muted)] mt-2">
                                    <span>1 Year</span>
                                    <span>5 Years</span>
                                    <span>10 Years</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Simulate Button - Design System: Primary Button */}
                    <button
                        onClick={handleSimulate}
                        disabled={loading || (!targetRole && !customRole)}
                        className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Simulating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Simulate Career Path
                            </>
                        )}
                    </button>

                    {/* Error Message - Design System: Status Badge Pattern */}
                    {error && (
                        <div className="mt-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                            <p className="text-sm font-medium text-rose-500">{error}</p>
                        </div>
                    )}

                    {/* Simulation Results */}
                    {simulationResult && (
                        <div className="mt-8 space-y-6 animate-in slide-in-from-bottom duration-500">
                            {/* Main Result Card - Design System: Major Card */}
                            <div className={`glass-card p-8 rounded-[2.5rem] border-2 ${getProbabilityBg(simulationResult.SuccessProbability || simulationResult.successProbability)}`}>
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center">
                                            <Target className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black">
                                                {simulationResult.TargetRole || simulationResult.targetRole}
                                            </h3>
                                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">
                                                From: {simulationResult.CurrentRole || simulationResult.currentRole || 'Current Position'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-4xl font-black ${getProbabilityColor(simulationResult.SuccessProbability || simulationResult.successProbability)}`}>
                                            {Math.round((simulationResult.SuccessProbability || simulationResult.successProbability || 0.5) * 100)}%
                                        </div>
                                        <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">Success Probability</p>
                                    </div>
                                </div>

                                {/* Feasibility Badge - Design System: Status Badge */}
                                <div className="flex items-center gap-2 mb-6">
                                    {getFeasibilityIcon(simulationResult.FeasibilityAssessment || simulationResult.feasibilityAssessment)}
                                    <span className="text-sm font-bold">
                                        {simulationResult.FeasibilityAssessment || simulationResult.feasibilityAssessment || 'Achievable with effort'}
                                    </span>
                                </div>

                                {/* Stats Grid - Design System: Stat Card Pattern */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="glass-card rounded-[2rem] p-4 border border-indigo-500/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock size={18} className="text-blue-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Timeline</span>
                                        </div>
                                        <div className="text-xl font-black">
                                            {simulationResult.EstimatedTimelineMonths || simulationResult.estimatedTimelineMonths || 36} mo
                                        </div>
                                    </div>
                                    <div className="glass-card rounded-[2rem] p-4 border border-emerald-500/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <DollarSign size={18} className="text-emerald-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Salary</span>
                                        </div>
                                        <div className="text-xl font-black text-emerald-500">
                                            +{simulationResult.ExpectedSalaryIncreasePercent || simulationResult.expectedSalaryIncreasePercent || 30}%
                                        </div>
                                    </div>
                                    <div className="glass-card rounded-[2rem] p-4 border border-purple-500/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Briefcase size={18} className="text-purple-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">Experience</span>
                                        </div>
                                        <div className="text-xl font-black">
                                            {simulationResult.YearsOfExperience || simulationResult.yearsOfExperience || 0} yrs
                                        </div>
                                    </div>
                                    <div className="glass-card rounded-[2rem] p-4 border border-amber-500/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Award size={18} className="text-amber-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Education</span>
                                        </div>
                                        <div className="text-xl font-black">
                                            {simulationResult.EducationLevel || simulationResult.educationLevel || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Development Plan - Design System: Glass Card */}
                            <div className="glass-card rounded-[2.5rem] p-8 bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20">
                                <div className="flex items-center gap-3 mb-4">
                                    <Lightbulb size={20} className="text-amber-500" />
                                    <h3 className="text-sm font-black uppercase tracking-widest">Development Plan</h3>
                                </div>
                                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                                    {simulationResult.DevelopmentPlan || simulationResult.developmentPlan || 'Focus on building skills in your target domain through online courses, practical projects, and mentorship.'}
                                </p>
                            </div>

                            {/* Alternative Paths - Design System: Glass Card */}
                            {simulationResult.AlternativePaths && (
                                <div className="glass-card rounded-[2.5rem] p-8 bg-gradient-to-r from-indigo-500/5 to-blue-500/5 border border-indigo-500/20">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Zap size={20} className="text-indigo-500" />
                                        <h3 className="text-sm font-black uppercase tracking-widest">Alternative Career Paths</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {(() => {
                                            try {
                                                const paths = typeof simulationResult.AlternativePaths === 'string'
                                                    ? JSON.parse(simulationResult.AlternativePaths)
                                                    : simulationResult.AlternativePaths;
                                                return paths?.map((path, index) => (
                                                    <div key={index} className="glass-card rounded-2xl p-4 border border-indigo-500/10 hover:border-indigo-500/30 transition-colors">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <ArrowRight size={16} className="text-indigo-500" />
                                                            <span className="text-sm font-bold">{path.AlternativeRole}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                                                            <span>{Math.round(path.Probability * 100)}% probability</span>
                                                            <span>{path.TimelineMonths} months</span>
                                                        </div>
                                                    </div>
                                                ));
                                            } catch {
                                                return null;
                                            }
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons - Design System: Button Patterns */}
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setSimulationResult(null);
                                        setTargetRole('');
                                        setCustomRole('');
                                    }}
                                    className="flex-1 py-4 rounded-2xl bg-[var(--bg-accent)] border border-[var(--border-primary)] text-sm font-black uppercase tracking-widest hover:bg-[var(--bg-accent)]/80 transition-colors"
                                >
                                    Simulate Another Path
                                </button>
                                {onClose && (
                                    <button
                                        onClick={onClose}
                                        className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white text-sm font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors"
                                    >
                                        Done
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CareerPathSimulator;
