import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ weights }) => {
  // Sort weights in descending order
  const sortedWeights = weights.sort((a, b) => b - a);

  const largestWeight = sortedWeights[0];

  // Find the drop-off point
  let dropIndex = sortedWeights.length;
  for (let i = 1; i < sortedWeights.length; i++) {
    // Drop-off threshold: < 1/3 of highest weight
    if (sortedWeights[i] < largestWeight / 3.0) {
      dropIndex = i;
      break;
    }
  }

  // Divide into significant and "other" groups
  const significant = sortedWeights.slice(0, dropIndex);
  const others = sortedWeights.slice(dropIndex);

  // Calculate sums
  const top_stocks_total = significant.reduce((sum, item) => sum + item, 0);
  const other_stocks_total = others.reduce((sum, item) => sum + item, 0);
  const not_allocated = 100 - top_stocks_total - other_stocks_total;

  // Prepare labels and values for the pie chart
  const labels = [
    `Top ${dropIndex} stocks`, // Label for the significant group
    `Other ${others.length} stocks`, // Label for the rest
    "Cash Position",
  ];
  const values = [top_stocks_total, other_stocks_total, not_allocated];

  // Define the background colors for the slices
  const backgroundColors = [
    "#4D6F3E", // Muted dark green for Top
    "#8CBB70", // Muted light green for Less Important
    "#F1E5A9", // Brighter yellow for Rest (Vibrant)
  ];

  // Define the hover colors
  const hoverColors = [
    "#3A5A40", // Darker green for Top
    "#7A9D5E", // Slightly darker light green for Less Important
    "#E1D77A", // Darker yellow for Rest (Vibrant)
  ];

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Percent of portfolio",
        data: values,
        backgroundColor: backgroundColors,
        hoverBackgroundColor: hoverColors,
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
        enabled: true,
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};

export default PieChart;
