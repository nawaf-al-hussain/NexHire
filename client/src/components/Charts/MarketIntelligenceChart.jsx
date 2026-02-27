import React from 'react';

const MarketIntelligenceChart = ({ data = [], type = 'demand-supply' }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-xs font-black text-[var(--text-muted)] opacity-50 uppercase tracking-widest">
                No market data available
            </div>
        );
    }

    // Group by skill and get average scores
    const skillStats = React.useMemo(() => {
        const stats = {};
        data.forEach(item => {
            const skill = item.SkillName || 'Unknown';
            if (!stats[skill]) {
                stats[skill] = {
                    name: skill,
                    demand: 0,
                    supply: 0,
                    salary: 0,
                    count: 0,
                    rising: 0,
                    falling: 0,
                    stable: 0
                };
            }
            stats[skill].demand += (item.DemandScore || 0);
            stats[skill].supply += (item.SupplyScore || 0);
            stats[skill].salary += (item.AvgSalary || 0);
            stats[skill].count += 1;
            if (item.SalaryTrend === 'Rising') stats[skill].rising++;
            else if (item.SalaryTrend === 'Falling') stats[skill].falling++;
            else stats[skill].stable++;
        });

        return Object.values(stats).map(s => ({
            ...s,
            demand: Math.round(s.demand / s.count),
            supply: Math.round(s.supply / s.count),
            salary: Math.round(s.salary / s.count),
            imbalance: Math.round((s.demand / s.count) - (s.supply / s.count))
        })).sort((a, b) => b.demand - a.demand).slice(0, 10);
    }, [data]);

    // Market condition distribution
    const conditionDistribution = React.useMemo(() => {
        const dist = { 'Critical Shortage': 0, 'High Demand': 0, 'Balanced': 0, 'Oversupply': 0 };
        data.forEach(item => {
            const gap = (item.DemandScore || 0) - (item.SupplyScore || 0);
            if (gap > 40) dist['Critical Shortage']++;
            else if (gap > 15) dist['High Demand']++;
            else if (gap < -15) dist['Oversupply']++;
            else dist['Balanced']++;
        });
        return Object.entries(dist).map(([name, value]) => ({ name, value }));
    }, [data]);

    const maxValue = Math.max(...skillStats.map(s => Math.max(s.demand, s.supply)), 100);

    if (type === 'conditions') {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    {conditionDistribution.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <div
                                className={`w-3 h-3 rounded-full ${item.name === 'Critical Shortage' ? 'bg-red-500' :
                                        item.name === 'High Demand' ? 'bg-orange-500' :
                                            item.name === 'Oversupply' ? 'bg-green-500' :
                                                'bg-blue-500'
                                    }`}
                            />
                            <div className="flex-1">
                                <div className="text-xs font-black">{item.name}</div>
                                <div className="text-[10px] text-[var(--text-muted)]">{item.value} skills</div>
                            </div>
                            <div className="text-sm font-black text-[var(--text-secondary)]">
                                {Math.round((item.value / data.length) * 100)}%
                            </div>
                        </div>
                    ))}
                </div>

                {/* Simple bar visualization */}
                <div className="space-y-2">
                    {conditionDistribution.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <div className="w-20 text-[10px] font-bold text-[var(--text-muted)] truncate">{item.name}</div>
                            <div className="flex-1 h-4 bg-[var(--bg-accent)] rounded overflow-hidden">
                                <div
                                    className={`h-full rounded ${item.name === 'Critical Shortage' ? 'bg-red-500' :
                                            item.name === 'High Demand' ? 'bg-orange-500' :
                                                item.name === 'Oversupply' ? 'bg-green-500' :
                                                    'bg-blue-500'
                                        }`}
                                    style={{ width: `${(item.value / data.length) * 100}%` }}
                                />
                            </div>
                            <div className="w-8 text-[10px] font-black text-right">{item.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {skillStats.slice(0, 8).map((skill, idx) => (
                <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black">{skill.name}</span>
                        <div className="flex gap-4 text-[9px]">
                            <span className="text-red-400">D: {skill.demand}</span>
                            <span className="text-green-400">S: {skill.supply}</span>
                        </div>
                    </div>
                    <div className="relative h-6 bg-[var(--bg-accent)] rounded-full overflow-hidden">
                        {/* Supply bar (background) */}
                        <div
                            className="absolute top-0 left-0 h-full bg-green-500/30 rounded-full"
                            style={{ width: `${(skill.supply / maxValue) * 100}%` }}
                        />
                        {/* Demand bar (foreground) */}
                        <div
                            className="absolute top-0 left-0 h-full bg-red-500/50 rounded-full"
                            style={{ width: `${(skill.demand / maxValue) * 100}%` }}
                        />
                        {/* Gap indicator */}
                        {skill.demand - skill.supply > 20 && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-black text-white bg-red-600 px-1.5 py-0.5 rounded">
                                GAP
                            </div>
                        )}
                    </div>
                </div>
            ))}

            <div className="flex items-center justify-center gap-6 pt-4 border-t border-[var(--border-primary)]">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500/50 rounded" />
                    <span className="text-[9px] font-black text-[var(--text-muted)]">Demand</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500/30 rounded" />
                    <span className="text-[9px] font-black text-[var(--text-muted)]">Supply</span>
                </div>
            </div>
        </div>
    );
};

export default MarketIntelligenceChart;
