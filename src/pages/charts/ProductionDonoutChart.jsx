
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer,Legend } from 'recharts';

const data = [
    { name: 'Updated', value: 33 },
    { name: 'Deleted', value: 60 },
    { name: 'Admin Errors', value: 45 }
];

const COLORS = ['#fed0ee','#fbe38e','#d0e8ff']; // Light pink, yellow, Light Blue
export default function ProductionDonoutChart() {
    return (
        <>
            <h2 className="h5 text-center pt-3 chart-head ">Weekly Production %</h2>

            <ResponsiveContainer width="100%" height={230} >
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        // paddingAngle={5}
                        dataKey="value">
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </>
    );
}
