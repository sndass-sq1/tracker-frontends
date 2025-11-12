import React, { useContext } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  LabelList,
} from "recharts";
import { UserContext } from "../../UserContext/UserContext";

const ProductionCountChart = ({ data }) => {
  const { theme } = useContext(UserContext);

  const isDark = theme === "dark";

  // Fallback for empty data
  if (!data || data.length === 0) {
    const emptyData = [{ date: "No Data", production: 0 }];
    return (
      <>
        <h2
          className={`h5 text-center pt-3 fw-bold fs-5${
            isDark ? "text-light" : "text-dark"
          }`}
        >
          Production Quality
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={emptyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              stroke={isDark ? "#444" : "#ccc"}
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="date"
              tick={{ fill: isDark ? "#ccc" : "#333" }}
              axisLine={{ stroke: isDark ? "#555" : "#ccc" }}
              tickLine={{ stroke: isDark ? "#555" : "#ccc" }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
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
            {/* <Legend wrapperStyle={{ color: isDark ? "#fff" : "#000" }} /> */}
            <Line
              type="monotone"
              dataKey="production"
              stroke="#2b7fff"
              activeDot={{ r: 8 }}
            >
              <LabelList
                dataKey="production"
                position="top"
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  fill: isDark ? "#eee" : "#333",
                }}
                formatter={(value) => (value !== 0 ? value : "")}
              />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </>
    );
  }

  const currentDay = Math.min(new Date().getDate(), data.length);
  const slicedData = data.slice(0, currentDay);

  return (
    <>
      <h2
        className={`h5 text-center pt-3 fw-bold fs-5${
          isDark ? "text-light" : "text-dark"
        }`}
      >
        Production Quality
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={slicedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            stroke={isDark ? "#444" : "#ccc"}
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="date"
            tickFormatter={(value, index) => `D${index + 1}`}
            tick={{ fill: isDark ? "#ccc" : "#333" }}
            axisLine={{ stroke: isDark ? "#555" : "#ccc" }}
            tickLine={{ stroke: isDark ? "#555" : "#ccc" }}
          />
          <YAxis
            domain={[0, "auto"]}
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
          {/* <Legend wrapperStyle={{ color: isDark ? "#fff" : "#000" }} /> */}
          <Area
            type="monotone"
            dataKey="production"
            stroke="#2b7fff"
            fill="#2b7fff"
            activeDot={{ r: 8 }}
            dot={{ r: 6, stroke: "#2b7fff", strokeWidth: 2, fill: "#87CEEB" }}
          >
            <LabelList
              dataKey="production"
              position="top"
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                fill: isDark ? "#eee" : "#333",
              }}
              formatter={(value) => (value !== 0 ? value : "")}
            />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
};

export default ProductionCountChart;
