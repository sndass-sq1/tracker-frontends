/** @format */

import React, { useContext } from "react";
import {
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
import { UserContext } from "../UserContext/UserContext"; // adjust the path if needed

const ModelChart = ({ chartData }) => {
  const { theme } = useContext(UserContext);
  const isDark = theme === "dark";

  const strokeColor = isDark ? "#FFA500" : "#FF8C00";
  const fillColor = isDark
    ? "rgba(255, 165, 0, 0.4)"
    : "rgba(255, 140, 0, 0.4)";
  const labelFill = isDark ? "#fff" : "#000";
  const gridStroke = isDark ? "#444" : "#ccc";
  const tooltipBg = isDark ? "#222" : "#fff";
  const tooltipText = isDark ? "#fff" : "#000";

  return (
    <div className="p-3 ">
      <h2
        className={`text-center fw-bold fs-5 ${isDark ? "text-light" : "text-dark"
          }`}
      >
        Chart Count Over Time
      </h2>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey="time_window" stroke={labelFill} />
          <YAxis stroke={labelFill} />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              color: tooltipText,
              border: "none",
            }}
            itemStyle={{ color: tooltipText }}
            labelStyle={{ color: isDark ? "#ccc" : "#333" }}
          />
          <Legend
            wrapperStyle={{
              color: labelFill,
              fontSize: "14px",
            }}
          />
          <Area
            type="monotone"
            dataKey="chart_count"
            stroke={strokeColor}
            fill={fillColor}
            activeDot={{ r: 8 }}
            name="Chart Count"
          >
            <LabelList
              dataKey="chart_count"
              position="top"
              formatter={(value) => (value !== 0 ? value : "")}
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                fill: labelFill,
              }}
            />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ModelChart;
