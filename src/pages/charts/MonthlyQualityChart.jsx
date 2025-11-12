import React from 'react';
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

const MonthlyQualityChart = () => {
    // Sample data for production percentage over 31 days
    const data = [
        { day: 'D1', production: 85 },
        { day: 'D2', production: 88 },
        { day: 'D3', production: 82 },
        { day: 'D4', production: 90 },
        { day: 'D5', production: 78 },
        { day: 'D6', production: 92 },
        { day: 'D7', production: 85 },
        { day: 'D8', production: 89 },
        { day: 'D9', production: 91 },
        { day: 'D10', production: 87 },
        { day: 'D11', production: 84 },
        { day: 'D12', production: 88 },
        { day: 'D13', production: 90 },
        { day: 'D14', production: 86 },
        { day: 'D15', production: 83 },
        { day: 'D16', production: 89 },
        { day: 'D17', production: 91 },
        { day: 'D18', production: 85 },
        { day: 'D19', production: 88 },
        { day: 'D20', production: 92 },
        { day: 'D21', production: 87 },
        { day: 'D22', production: 84 },
        { day: 'D23', production: 90 },
        { day: 'D24', production: 86 },
        { day: 'D25', production: 89 },
        { day: 'D26', production: 91 },
        { day: 'D27', production: 85 },
        { day: 'D28', production: 88 },
        { day: 'D29', production: 90 },
        { day: 'D30', production: 87 },
        { day: 'D31', production: 92 }
    ];

    return (
        <>
            <h2 className="h5 text-center pt-3 chart-head">Monthly Quality % </h2>
            <ResponsiveContainer width="100%" height={220} p={10}>
                <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="production"
                        stroke="#2b7fff"
                        activeDot={{ r: 8 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </>
    );
};

export default MonthlyQualityChart;
