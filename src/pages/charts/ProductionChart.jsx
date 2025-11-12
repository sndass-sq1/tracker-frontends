import { useContext } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  LabelList,
} from "recharts";
import { UserContext } from "../../UserContext/UserContext"; // adjust path if needed

export default function ProductionChart({ data }) {
  const { theme } = useContext(UserContext);
  const isDark = theme === "dark";

  const currentDay = new Date().getDate();
  const slicedData = data.slice(0, currentDay);

  return (
    <>
      <h2
        className={`h5 text-center pt-3 fw-bold fs-5${
          isDark ? "text-light" : "text-dark"
        }`}
      >
        Per Day Quality %
      </h2>

      <ResponsiveContainer width="100%" height={230}>
        <AreaChart data={slicedData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? "#444" : "#ccc"}
          />
          <XAxis
            dataKey="name"
            interval="preserveStartEnd"
            tick={{ fill: isDark ? "#ccc" : "#333" }}
            axisLine={{ stroke: isDark ? "#555" : "#ccc" }}
            tickLine={{ stroke: isDark ? "#555" : "#ccc" }}
          />
          <YAxis
            tick={{ fill: isDark ? "#ccc" : "#333" }}
            axisLine={{ stroke: isDark ? "#555" : "#ccc" }}
            tickLine={{ stroke: isDark ? "#555" : "#ccc" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#222" : "#fff",
              color: isDark ? "#fff" : "#000",
              border: "none",
            }}
            itemStyle={{ color: isDark ? "#fff" : "#000" }}
            labelStyle={{ color: isDark ? "#ccc" : "#333" }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="purple"
            fill="#800080"
            strokeWidth={2}
            dot={{ r: 6, stroke: "purple", strokeWidth: 2, fill: "#87CEEB" }}
          >
            <LabelList
              dataKey="value"
              position="top"
              dy={18}
              dx={-30}
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                fill: isDark ? "#fff" : "#000",
              }}
              formatter={(value) => (value !== 0 ? value : "")}
            />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
}
