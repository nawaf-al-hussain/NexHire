import React from 'react';
import { Trophy, Medal, Star, Zap, Award, Loader2 } from 'lucide-react';

const Leaderboard = ({ leaderboardData, loading }) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Loading Leaderboard...</p>
            </div>
        );
    }

    // Default gamification data if no data exists
    const data = leaderboardData && leaderboardData.length > 0 ? leaderboardData : [{
        TotalPoints: 1250,
        Level: 5,
        Badges: 'ApplicationWinner,SkillMaster,InterviewPro',
        StreakDays: 7,
        Rank: 42
    }];

    const badges = data[0]?.Badges ? data[0].Badges.split(',') : ['ApplicationWinner', 'SkillMaster'];
    const badgeIcons = {
        'ApplicationWinner': <Star className="w-5 h-5 text-amber-500" />,
        'SkillMaster': <Award className="w-5 h-5 text-emerald-500" />,
        'InterviewPro': <Medal className="w-5 h-5 text-indigo-500" />,
        'EarlyBird': <Zap className="w-5 h-5 text-rose-500" />,
        'StreakMaster': <Trophy className="w-5 h-5 text-amber-600" />
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-black uppercase tracking-tighter">Your Achievements</h2>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-8 rounded-[2.5rem] text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <Trophy className="w-8 h-8 text-amber-500" />
                    </div>
                    <div className="text-4xl font-black text-amber-500">{data[0]?.TotalPoints || 1250}</div>
                    <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-2">Total Points</div>
                </div>

                <div className="glass-card p-8 rounded-[2.5rem] text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        <Star className="w-8 h-8 text-indigo-500" />
                    </div>
                    <div className="text-4xl font-black text-indigo-500">Level {data[0]?.Level || 5}</div>
                    <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-2">Current Level</div>
                </div>

                <div className="glass-card p-8 rounded-[2.5rem] text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                        <Zap className="w-8 h-8 text-rose-500" />
                    </div>
                    <div className="text-4xl font-black text-rose-500">{data[0]?.StreakDays || 7}</div>
                    <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-2">Day Streak</div>
                </div>

                <div className="glass-card p-8 rounded-[2.5rem] text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Award className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div className="text-4xl font-black text-emerald-500">#{data[0]?.Rank || 42}</div>
                    <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-2">Global Rank</div>
                </div>
            </div>

            {/* Badges */}
            <div className="glass-card p-8 rounded-[2.5rem]">
                <h3 className="text-sm font-black uppercase tracking-widest mb-6">Earned Badges</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {badges.map((badge, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center p-6 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)] hover:border-amber-500/30 transition-all"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[var(--bg-primary)] flex items-center justify-center mb-3">
                                {badgeIcons[badge.trim()] || <Star className="w-5 h-5 text-[var(--text-muted)]" />}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-center">{badge.trim()}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Progress to Next Level */}
            <div className="glass-card p-8 rounded-[2.5rem]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black uppercase tracking-widest">Progress to Level {(data[0]?.Level || 5) + 1}</h3>
                    <span className="text-xs font-black text-indigo-500">{((data[0]?.TotalPoints || 1250) % 500) / 500 * 100}%</span>
                </div>
                <div className="w-full h-4 bg-[var(--bg-accent)] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 transition-all duration-1000"
                        style={{ width: `${((data[0]?.TotalPoints || 1250) % 500) / 500 * 100}%` }}
                    ></div>
                </div>
                <p className="text-[10px] font-black text-[var(--text-muted)] mt-4">
                    {(data[0]?.Level || 5) * 500 - (data[0]?.TotalPoints || 1250)} points until next level
                </p>
            </div>

            {/* Achievement Tips */}
            <div className="bg-[var(--bg-accent)] rounded-[2.5rem] p-8 border border-[var(--border-primary)]">
                <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest">How to Earn More Points</h3>
                </div>
                <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
                        <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                        Complete skill assessments to earn 100+ points
                    </li>
                    <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
                        <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                        Attend interviews on time for 50 point bonus
                    </li>
                    <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
                        <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                        Maintain daily login streak for multipliers
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Leaderboard;
