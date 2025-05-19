import React, { useEffect, useRef } from "react";
import ApexCharts from "apexcharts";

const chartOptions = {
  series: [
    {
      name: "Banned",
      data: [412, 413, 1731, 412, 1, 1731],
      color: "#ff0000",
    },
    {
      name: "No Ban",
      data: [643, 413, 765, 412, 1423, 1731],
      color: "#34d399",
    },
  ],
  chart: {
    height: "90%",
    maxWidth: "100%",
    type: "area",
    fontFamily: "k2d, sans-serif",
    dropShadow: {
      enabled: false,
    },
    toolbar: {
      show: false,
    },
  },
  tooltip: {
    enabled: true,
    x: {
      show: false,
    },
  },
  legend: {
    show: true,
  },
  fill: {
    type: "gradient",
    gradient: {
      opacityFrom: 0.55,
      opacityTo: 0,
      shade: "#1C64F2",
      gradientToColors: ["#1C64F2"],
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: 6,
  },
  grid: {
    show: false,
    strokeDashArray: 4,
    padding: {
      left: 2,
      right: 2,
      top: 0,
    },
  },
  xaxis: {
    categories: [
      "01 February",
      "02 February",
      "03 February",
      "04 February",
      "05 February",
      "06 February",
      "07 February",
    ],
    labels: {
      show: false,
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "center",
      fontFamily: "Inter, sans-serif",
      fontSize: "14px",
      labels: {
        colors: "#333",
        useSeriesColors: false,
      },
      markers: {
        width: 12,
        height: 12,
        radius: 12,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    show: false,
    labels: {
      formatter: function (value: any) {
        return value;
      },
    },
  },
};

type UserStatistics = {
  users?: any;
  className?: string;
};

const UserStatistics: React.FC<UserStatistics> = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = new ApexCharts(chartRef.current, chartOptions);
    chart.render();

    return () => chart.destroy();
  }, []);

  return (
    <>
      <div ref={chartRef} />
    </>
  );
};

export default UserStatistics;
