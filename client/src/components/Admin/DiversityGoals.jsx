import React from 'react';
import { Target, Plus, CheckCircle, TrendingUp, Calendar, RefreshCw, UsersRound, Heart, Shield } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';
import DiversityChart from '../Charts/DiversityChart';

const DiversityGoals = () => {
    const [goals, setGoals] = React.useState([]);
    const [ethnicityData, setEthnicityData] = React.useState([]);
    const [genderData, setGenderData] = React.useState([]);
    const [disabilityData, setDisabilityData] = React.useState([]);
    const [veteranData, setVeteranData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [showModal, setShowModal] = React.useState(false);
    const [newGoal, setNewGoal] = React.useState({
        metricType: 'Gender',
        targetPercentage: 30,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    React.useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [goalsRes, ethnicityRes, genderRes, disabilityRes, veteranRes] = await Promise.all([
                axios.get(`${API_BASE}/analytics/diversity-goals`),
                axios.get(`${API_BASE}/analytics/diversity`),
                axios.get(`${API_BASE}/analytics/diversity-gender`),
                axios.get(`${API_BASE}/analytics/diversity-disability`),
                axios.get(`${API_BASE}/analytics/diversity-veteran`)
            ]);
            setGoals(goalsRes.data || []);
            setEthnicityData(ethnicityRes.data || []);
            setGenderData(genderRes.data || []);
            setDisabilityData(disabilityRes.data || []);
            setVeteranData(veteranRes.data || []);
        } catch (err) {
            console.error("Fetch error:", err);
            // Still try to fetch goals if diversity fails
            try {
                const goalsRes = await axios.get(`${API_BASE}/analytics/diversity-goals`);
                setGoals(goalsRes.data || []);
            } catch (e) {
                console.error("Fetch goals error:", e);
            }
        } finally {
            setLoading(false);
        }
    };

    const createGoal = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE}/analytics/diversity-goals`, newGoal);
            setShowModal(false);
            fetchData();
            setNewGoal({
                metricType: 'Gender',
                targetPercentage: 30,
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
        } catch (err) {
            console.error("Create goal error:", err);
        }
    };

    const getProgressColor = (current, target) => {
        const percentage = (current / target) * 100;
        if (percentage >= 100) return 'text-emerald-500';
        if (percentage >= 70) return 'text-amber-500';
        return 'text-rose-500';
    };

    const getStatusBadge = (goal) => {
        if (!goal.IsActive) {
            return <span className="px-2 py-1 rounded-lg text-[8px] font-black uppercase bg-gray-500/10 text-gray-500">Inactive</span>;
        }
        const progress = (goal.CurrentPercentage / goal.TargetPercentage) * 100;
        if (progress >= 100) {
            return <span className="px-2 py-1 rounded-lg text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-500">Achieved</span>;
        }
        return <span className="px-2 py-1 rounded-lg text-[8px] font-black uppercase bg-amber-500/10 text-amber-500">In Progress</span>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                <span className="ml-3 text-sm font-black uppercase tracking-widest text-[var(--text-muted)]">Loading Goals...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <Target className="text-indigo-500" size={28} />
                        Diversity Goals
                    </h2>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                        Set and track diversity hiring targets
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-500 transition-all"
                >
                    <Plus size={18} />
                    New Goal
                </button>
            </div>

            {/* Diversity Analytics Charts - 3 Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ethnicity Chart */}
                <div className="glass-card rounded-[2rem] p-6 border border-[var(--border-primary)]">
                    <div className="flex items-center gap-3 mb-4">
                        <UsersRound className="w-5 h-5 text-emerald-500" />
                        <h3 className="text-sm font-black uppercase tracking-widest">By Ethnicity</h3>
                    </div>
                    {ethnicityData.length > 0 ? (
                        <DiversityChart data={ethnicityData} />
                    ) : (
                        <div className="h-[250px] flex items-center justify-center text-xs font-black text-[var(--text-muted)] uppercase tracking-widest opacity-50">
                            No data
                        </div>
                    )}
                </div>

                {/* Gender Chart */}
                <div className="glass-card rounded-[2rem] p-6 border border-[var(--border-primary)]">
                    <div className="flex items-center gap-3 mb-4">
                        <Heart className="w-5 h-5 text-pink-500" />
                        <h3 className="text-sm font-black uppercase tracking-widest">By Gender</h3>
                    </div>
                    {genderData.length > 0 ? (
                        <DiversityChart data={genderData} />
                    ) : (
                        <div className="h-[250px] flex items-center justify-center text-xs font-black text-[var(--text-muted)] uppercase tracking-widest opacity-50">
                            No data
                        </div>
                    )}
                </div>

                {/* Disability & Veteran Combined Chart */}
                <div className="glass-card rounded-[2rem] p-6 border border-[var(--border-primary)]">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="w-5 h-5 text-blue-500" />
                        <h3 className="text-sm font-black uppercase tracking-widest">By Disability & Veteran</h3>
                    </div>
                    {disabilityData.length > 0 || veteranData.length > 0 ? (
                        <DiversityChart data={[...disabilityData, ...veteranData]} />
                    ) : (
                        <div className="h-[250px] flex items-center justify-center text-xs font-black text-[var(--text-muted)] uppercase tracking-widest opacity-50">
                            No data
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card rounded-2xl p-5 border border-[var(--border-primary)]">
                    <div className="flex items-center gap-2 mb-2">
                        <Target size={14} className="text-indigo-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Total Goals</span>
                    </div>
                    <div className="text-3xl font-black text-indigo-500">{goals.length}</div>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-[var(--border-primary)]">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={14} className="text-emerald-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Achieved</span>
                    </div>
                    <div className="text-3xl font-black text-emerald-500">
                        {goals.filter(g => (g.CurrentPercentage / g.TargetPercentage) * 100 >= 100).length}
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-[var(--border-primary)]">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={14} className="text-amber-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">In Progress</span>
                    </div>
                    <div className="text-3xl font-black text-amber-500">
                        {goals.filter(g => g.IsActive && (g.CurrentPercentage / g.TargetPercentage) * 100 < 100).length}
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-[var(--border-primary)]">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar size={14} className="text-purple-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Active</span>
                    </div>
                    <div className="text-3xl font-black text-purple-500">
                        {goals.filter(g => g.IsActive).length}
                    </div>
                </div>
            </div>

            {/* Goals List */}
            {goals.length === 0 ? (
                <div className="glass-card rounded-[2rem] p-12 text-center border-2 border-dashed border-[var(--border-primary)]">
                    <Target size={48} className="mx-auto text-indigo-500/30 mb-4" />
                    <p className="text-[var(--text-muted)] font-bold">No diversity goals set yet</p>
                    <p className="text-xs text-[var(--text-muted)] mt-2">Create your first goal to start tracking DEI metrics</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map((goal) => {
                        const progress = Math.min(100, (goal.CurrentPercentage / goal.TargetPercentage) * 100);
                        return (
                            <div key={goal.GoalID} className="glass-card rounded-[2rem] p-6 border border-[var(--border-primary)]">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 text-xs font-black uppercase">
                                        {goal.MetricType}
                                    </span>
                                    {getStatusBadge(goal)}
                                </div>

                                <div className="mb-4">
                                    <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2">
                                        <span className="text-[var(--text-muted)]">Progress</span>
                                        <span className={getProgressColor(goal.CurrentPercentage, goal.TargetPercentage)}>
                                            {goal.CurrentPercentage}% / {goal.TargetPercentage}%
                                        </span>
                                    </div>
                                    <div className="w-full h-3 bg-[var(--bg-accent)] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${progress >= 100 ? 'bg-emerald-500' : progress >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                    <span>Start: {goal.StartDate ? new Date(goal.StartDate).toLocaleDateString() : 'N/A'}</span>
                                    <span>End: {goal.EndDate ? new Date(goal.EndDate).toLocaleDateString() : 'N/A'}</span>
                                </div>

                                {goal.RecruiterName && (
                                    <p className="text-[9px] text-[var(--text-muted)] mt-3 pt-3 border-t border-[var(--border-primary)]">
                                        Created by: {goal.RecruiterName}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="glass-card rounded-[2rem] p-8 w-full max-w-md border border-[var(--border-primary)]">
                        <h3 className="text-lg font-black uppercase mb-6">Create Diversity Goal</h3>
                        <form onSubmit={createGoal} className="space-y-4">
                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2 block">
                                    Metric Type
                                </label>
                                <select
                                    value={newGoal.metricType}
                                    onChange={(e) => setNewGoal({ ...newGoal, metricType: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-primary)] text-[var(--text-primary)] font-bold"
                                >
                                    <option value="Gender">Gender</option>
                                    <option value="Ethnicity">Ethnicity</option>
                                    <option value="Disability">Disability</option>
                                    <option value="Veteran">Veteran</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2 block">
                                    Target Percentage (%)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={newGoal.targetPercentage}
                                    onChange={(e) => setNewGoal({ ...newGoal, targetPercentage: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-primary)] text-[var(--text-primary)] font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2 block">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={newGoal.startDate}
                                        onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-primary)] text-[var(--text-primary)] font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2 block">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={newGoal.endDate}
                                        onChange={(e) => setNewGoal({ ...newGoal, endDate: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-primary)] text-[var(--text-primary)] font-bold"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 rounded-xl border border-[var(--border-primary)] font-black text-xs uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest"
                                >
                                    Create Goal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiversityGoals;
