

import React, { useContext } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { UserContext } from "../../UserContext/UserContext"; // adjust if needed

export default function InternalQualityChart({ data }) {
  const { theme } = useContext(UserContext);
  const isDark = theme === "dark";

  return (
    <>
      <h2
        className={`text-center pt-3 fw-bold fs-5 ${isDark ? "text-light" : "text-dark"
          }`}
      >
        Internal Quality
      </h2>
      <ResponsiveContainer width="100%" height={210}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ left: 30, right: 20 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? "#444" : "#ccc"}
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            axisLine={false}
            tick={{ fill: isDark ? "#ccc" : "#333" }}
          />
          <YAxis
            dataKey="week"
            type="category"
            axisLine={false}
            tick={{ fill: isDark ? "#ccc" : "#333" }}
          />
          <Tooltip
            formatter={(value) => `${value}%`}
            contentStyle={{
              backgroundColor: isDark ? "#222" : "#fff",
              color: isDark ? "#fff" : "#000",
              border: "none",
            }}
            itemStyle={{ color: isDark ? "#fff" : "#000" }}
            labelStyle={{ color: isDark ? "#ccc" : "#333" }}
          />
          <Bar dataKey="quality" fill="#5b5fc7" barSize={12} />
        </BarChart>
      </ResponsiveContainer>
      <p
        className={`text-center mt-2 small ${isDark ? "text-muted" : "text-secondary"
          }`}
      >
        Quality (%)
      </p>
    </>
  );
}
