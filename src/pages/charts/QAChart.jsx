

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const data = [
    { week: 'Week 1', internal: 60, external: 65 },
    { week: 'Week 2', internal: 100, external: 85 },
    { week: 'Week 3', internal: 90, external: 75 },
    { week: 'Week 4', internal: 85, external: 80 },
    { week: 'Week 5', internal: 100, external: 95 }
];

export default function QAChart() {
    return (
        <>
            <h2 className="h5 text-center pt-3 chart-head">Week wise QA Score</h2>

            <ResponsiveContainer width="95%" height={220}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" axisLine={false} />
                    <YAxis domain={[60, 110]} axisLine={false} />
                    <Tooltip />
                    <Legend />
                    <Line
                        type="linear"
                        dataKey="internal"
                        stroke="#FFD700"
                        strokeWidth={2}
                        dot={{ r: 6 }}
                        legendType="plainline"
                    />
                    <Line
                        type="linear"
                        dataKey="external"
                        stroke="#D8BFD8"
                        strokeWidth={2}
                        dot={{ r: 6 }}
                        legendType="plainline"
                    />
                </LineChart>
            </ResponsiveContainer>
        </>
    );
}
