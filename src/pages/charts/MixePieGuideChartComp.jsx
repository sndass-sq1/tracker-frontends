/** @format */

import React from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, LabelList } from "recharts";

const MixePieGuideChartComp = ({ data }) => {
  const names = ["Approved", "Rejected", "Pending"];
  const colors = ["#34c759", "#f64e60", "#2998f3"];

  const total = data.reduce((acc, val) => acc + (val || 0), 0);

  const chartData =
    total === 0
      ? [{ name: "No Data", value: 1, realValue: 0, color: "#d3d3d3" }]
      : names.map((name, index) => ({
          name,
          value: data[index] || 0,
          realValue: data[index] || 0,
          color: colors[index],
        }));

  return (
    <div className='d-flex justify-content-center align-items-center'>
      <div style={{ position: "relative", width: 420, height: 220 }}>
        <PieChart width={420} height={220}>
          <Pie
            data={chartData}
            dataKey='value'
            cx='50%'
            cy='50%'
            innerRadius={60}
            outerRadius={85}
            startAngle={180}
            endAngle={-180}
            cornerRadius={15}
            paddingAngle={total === 0 ? 0 : -15}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke='none' />
            ))}

            {/* Show label values inside pie */}
            <LabelList
              dataKey='realValue'
              position='inside'
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                fill: "#ffffff",
              }}
              formatter={(val) => (val !== 0 ? val : "")}
            />
          </Pie>

          {/* Tooltip always available */}
          <Tooltip
            formatter={(value, name, props) => {
              const entry = chartData.find((item) => item.name === name);
              return [`${entry?.realValue || 0}`, `${name}`];
            }}
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "10px",
              border: "1px solid #ccc",
            }}
          />

          {/* Legend always shown */}
          <Legend
            layout='vertical'
            align='right'
            verticalAlign='middle'
            iconSize={10}
            formatter={(value) => {
              const entry = chartData.find((item) => item.name === value);
              return `${value}: ${entry?.realValue || 0}`;
            }}
          />
        </PieChart>

        {/* Center white circle for donut effect */}
        <div
          className=' rounded-circle shadow d-flex justify-content-center align-items-center bg-transparent'
          style={{
            position: "absolute",
            width: "100px",
            height: "100px",
            top: "50%",
            left: "38%",
            transform: "translate(-50%, -50%)",
            zIndex: 1,
          }}>
          {total === 0 && (
            <span style={{ fontWeight: "bold", fontSize: "13px" }}>
              No Data
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MixePieGuideChartComp;
