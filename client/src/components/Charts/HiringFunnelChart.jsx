import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';

const HiringFunnelChart = ({ data }) => {
    // Expected data: { StatusName, ApplicationCount }

    const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#fb7185'];

    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    layout="vertical"
                    data={data}
                    margin={{ top: 20, right: 60, left: 40, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="StatusName"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}
                        width={80}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-primary)',
                            borderRadius: '1rem',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)'
                        }}
                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    />
                    <Bar
                        dataKey="ApplicationCount"
                        radius={[0, 10, 10, 0]}
                        barSize={30}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        <LabelList
                            dataKey="ApplicationCount"
                            position="right"
                            style={{ fill: 'var(--text-primary)', fontSize: 12, fontWeight: 900 }}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default HiringFunnelChart;
