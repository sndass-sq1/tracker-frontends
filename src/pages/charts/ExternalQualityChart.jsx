import {
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const data = [
  { week: "Week 5", quality: 80 },
  { week: "Week 4", quality: 75 },
  { week: "Week 3", quality: 78 },
  { week: "Week 2", quality: 85 },
  { week: "Week 1", quality: 90 },
];

export default function ExternalQualityChart() {
  return (
    <>
      <h2 className="h5 text-center pt-3 chart-head">External Quality</h2>

      <ResponsiveContainer width="100%" height={210}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ left: 30, right: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[70, 100]} axisLine={false} />
          <YAxis dataKey="week" type="category" axisLine={false} />
          {/* <Bar dataKey="quality" fill="#DBAEFF" barSize={12} /> */}
        </BarChart>
      </ResponsiveContainer>

      <p className="text-center text-muted mt-2 small">Quality(%)</p>
    </>
  );
}
