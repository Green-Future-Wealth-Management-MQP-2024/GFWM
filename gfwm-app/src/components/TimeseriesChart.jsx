import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Chart = ({ portfolio, spy, dates }) => {
  
//     //autogenerate labels
//   const generateLabels = (startDate, numPoints, intervalDays) => {
//     const labels = [];
//     const start = new Date(startDate);

//     for (let i = 0; i < numPoints; i++) {
//       const newDate = new Date(start);
//       newDate.setDate(start.getDate() + i * intervalDays);
//       labels.push(
//         `${
//           newDate.getMonth() + 1
//         }/${newDate.getDate()}/${newDate.getFullYear()}`
//       );
//     }

//     return labels;
//   };

//   const labels = generateLabels("2013-01-01", portfolio.length, 7);

    console.log(dates);

  const tension = 0.2; // line smoothness
  const borderWidth = 2;
  const pointRadius = 0; // No circles displayed
  const pointHoverRadius = 2; // But still show hover effect

  const data = {
    labels: dates,
    datasets: [
      {
        label: "Portfolio",
        data: portfolio,
        borderColor: "rgba(75, 192, 192, 1)", // Line color
        backgroundColor: "rgba(75, 192, 192, 0.2)", // Fill under the line
        tension,
        borderWidth,
        pointRadius,
        pointHoverRadius,
      },
      {
        label: "S&P 500",
        data: spy,
        borderColor: "rgba(255, 99, 132, 1)", // Line color
        backgroundColor: "rgba(255, 99, 132, 0.2)", // Fill under the line
        tension,
        borderWidth,
        pointRadius,
        pointHoverRadius,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        title: {
          display: false, // Remove x-axis title
        },
      },
      y: {
        title: {
          display: true,
          text: "Value",
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default Chart;
