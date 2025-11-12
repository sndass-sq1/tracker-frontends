import React, { useContext } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";
import { UserContext } from "../../UserContext/UserContext"; // adjust if needed

const COLORS = ["#FF6F6F", "#C1F0B8", "#FFB97A", "#79D279"];
const GREY_COLOR = "#e0e0e0";

export default function ErrorsDonoutChart({ data }) {
  const { theme } = useContext(UserContext);
  const isDark = theme === "dark";

  const isEmpty =
    !data || data.length === 0 || data.every((d) => !d.value || d.value === 0);

  const fallbackData = [{ name: "No Data", value: 1 }];

  return (
    <>
      <h2
        className={`text-center pt-3 fw-bold fs-5 ${
          isDark ? "text-light" : "text-dark"
        }`}
      >
        Category wise Errors
      </h2>
      <ResponsiveContainer width="100%" height={230}>
        <PieChart>
          <Pie
            data={isEmpty ? fallbackData : data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            dataKey="value"
          >
            {(isEmpty ? fallbackData : data).map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={isEmpty ? GREY_COLOR : COLORS[index % COLORS.length]}
                stroke="none"
                strokeWidth={0}
              />
            ))}

            {/* Label inside each slice */}
            {!isEmpty && (
              <LabelList
                dataKey="value"
                position="inside"
                style={{
                  fontSize: "14px",
                  fill: isDark ? "#fff" : "#000",
                }}
                formatter={(value) => (value !== 0 ? value : "")}
              />
            )}
          </Pie>

          {/* ✅ Tooltip - always visible */}
          <Tooltip
            formatter={(value, name) => [`${value}`, `${name}`]} // Optional custom format
            contentStyle={{
              backgroundColor: isDark ? "#222" : "#fff",
              color: isDark ? "#fff" : "#000",
              border: "none",
            }}
            itemStyle={{ color: isDark ? "#fff" : "#000" }}
            labelStyle={{ color: isDark ? "#ccc" : "#333" }}
          />

          {/* ✅ Legend - always visible */}
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{
              fontSize: "13px",
              color: isDark ? "#fff" : "#000",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
}
