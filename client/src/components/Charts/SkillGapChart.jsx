import React from 'react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';

const SkillGapChart = ({ data }) => {
    // Expected data: [{ SkillName, GapScore, SkillGap }] - uses SkillGap for the radar

    // Handle undefined or empty data
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center text-slate-300">
                    <p className="text-xs font-black uppercase tracking-widest">No skill data</p>
                </div>
            </div>
        );
    }

    // Ensure all data points have valid numeric values (max 10 items)
    const chartData = data.slice(0, 10).map(item => ({
        ...item,
        SkillName: item.SkillName || 'Unknown',
        // Use SkillGap if available, otherwise normalize GapScore to 0-10 scale
        SkillGap: item.SkillGap !== undefined ? Number(item.SkillGap) : Math.min(10, Number(item.GapScore) / 10)
    }));

    return (
        <div className="h-full min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                        dataKey="SkillName"
                        tick={{ fontSize: 9, fontWeight: '900', fill: '#64748b', letterSpacing: '0.05em' }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                    <Radar
                        name="Proficiency"
                        dataKey="SkillGap"
                        stroke="#7c3aed"
                        strokeWidth={3}
                        fill="#7c3aed"
                        fillOpacity={0.15}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SkillGapChart;
