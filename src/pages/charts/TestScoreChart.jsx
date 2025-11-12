
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const data = [
    { name: 'Week 1', score: 85 },
    { name: 'Week 2', score: 60 },
    { name: 'Week 3', score: 70 },
    { name: 'Week 4', score: 80 },
    { name: 'Week 5', score: 75 }
];

export default function TestScoreChart() {
    return (
        <>
           <h2 className="h5 text-center pt-3 chart-head">Test Score %</h2>

            <ResponsiveContainer width="100%" height={220} >
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[50, 100]} />
                    <Tooltip />
                    {/* Curve Line */}
                    <Line
                        type="monotone"
                        dataKey="score"
                        stroke=" #00E396"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </>
    );
}
