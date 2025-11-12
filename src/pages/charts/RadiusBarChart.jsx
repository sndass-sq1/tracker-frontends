

import { React, useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";

const colors = [
  "url(#gradient1)",
  "url(#gradient2)",
  "url(#gradient3)",
  "url(#gradient4)",
  "url(#gradient5)",
];

const RadiusBarChart = ({ dashboardData }) => {
  const data = [
    {
      number: "01",
      name: "Coder",
      value: dashboardData?.coders_count,
      color: "text-danger",
    },
    {
      number: "02",
      name: "Auditor",
      value: dashboardData?.auditors_count,
      color: "text-primary",
    },
    {
      number: "03",
      name: "Lead",
      value: dashboardData?.leads_count,
      color: "text-info",
    },
    {
      number: "04",
      name: "Head",
      value: dashboardData?.project_heads_count,
      color: "text-success",
    },
    {
      number: "05",
      name: "Manager",
      value: dashboardData?.managers_count,
      color: "text-warning",
    },
  ];
  const [chartWidth, setChartWidth] = useState(500);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setChartWidth(225);
      } else {
        setChartWidth(500);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxValue = Math.max(...data.map((item) => item.value || 0));

  return (
    <div className=" text-center d-flex justify-content-center ">
      <div className="mx-auto">
        <BarChart
          width={chartWidth}
          height={320}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          {/* Define linear gradient */}
          <defs>
            <linearGradient id="gradient1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F44771" />
              <stop offset="100%" stopColor="#FD29B5" />
            </linearGradient>
          </defs>
          <defs>
            <linearGradient id="gradient2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4262fe" />
              <stop offset="100%" stopColor="#C059ff" />
            </linearGradient>
          </defs>
          <defs>
            <linearGradient id="gradient3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#475ef4" />
              <stop offset="100%" stopColor="#3a96ff" />
            </linearGradient>
          </defs>
          <defs>
            <linearGradient id="gradient4" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3cffff" />
              <stop offset="100%" stopColor="#7cffc2" />
            </linearGradient>
          </defs>
          <defs>
            <linearGradient id="gradient5" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff865a" />
              <stop offset="100%" stopColor="#ff5b4d" />
            </linearGradient>
          </defs>
          <XAxis dataKey="number" />
          <YAxis domain={[0, Math.ceil(maxValue * 1.0)]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="value"
            fill="transparent"
            shape={<CustomBar />}
            barSize={30}
          >
            <LabelList
              dataKey="value"
              content={<CustomLabel data={data} />}
              position="insideTop"
            />
          </Bar>
        </BarChart>
      </div>
      <div className="mt-5 mx-auto ">
        {data.map((item, index) => (
          <div
            key={index}
            className="col-12 col-md-5 d-flex align-items-center mb-4 "
          >
            <span className={`font-weight-bold mx-2 ${item.color}`}>
              {item.number}
            </span>
            <span className="text-dark font-weight-medium">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CustomBar = (props) => {
  const { x, y, width, height } = props;
  const radius = 10;

  return (
    <g>
      <clipPath id={`top-radius-clip-${props.index}`}>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={radius}
          ry={radius}
        />
      </clipPath>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={colors[props.index % colors.length]}
        clipPath={`url(#top-radius-clip-${props.index})`}
      />
    </g>
  );
};

const CustomLabel = (props) => {
  const { x, y, width, height, index, data } = props;
  const currentData = data[index];

  return (
    <g>
      <text
        x={x + width}
        y={y + height + 100}
        fill="#000"
        textAnchor="low"
        fontSize={12}
        dominantBaseline="low"
      >
        {`${currentData.number} - ${currentData.name}`}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        className=" p-2 border "
        style={{ backgroundColor: "#fff", borderColor: "#ccc", color: "#000" }}
      >
        <p>
          <strong>{data.name}</strong>
        </p>
        <p>Value: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default RadiusBarChart;
