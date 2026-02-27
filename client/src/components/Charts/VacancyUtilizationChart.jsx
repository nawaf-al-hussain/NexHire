import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const VacancyUtilizationChart = ({ data }) => {
    // Expected data: [{ JobTitle, FilledPositions, RemainingVacancies, TotalApplications }]

    const chartData = data.slice(0, 10).map(item => ({
        ...item,
        Utilization: ((item.FilledPositions / (item.FilledPositions + item.RemainingVacancies)) * 100).toFixed(1)
    }));

    return (
        <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="JobTitle"
                        tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-primary)',
                            borderRadius: '1rem',
                            fontSize: '11px',
                            fontWeight: 'bold'
                        }}
                    />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                    />
                    <Bar
                        name="Filled"
                        dataKey="FilledPositions"
                        stackId="a"
                        fill="#6366f1"
                        radius={[0, 0, 0, 0]}
                    />
                    <Bar
                        name="Remaining"
                        dataKey="RemainingVacancies"
                        stackId="a"
                        fill="#8b5cf6"
                        opacity={0.3}
                        radius={[10, 10, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default VacancyUtilizationChart;
