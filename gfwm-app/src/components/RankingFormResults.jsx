import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RankingFormResults = ({ data }) => {
  // Prepare data for the chart
  const labels = data.map(item => item.ticker);
  const annualReturns = data.map(item => item.annual_return * 100);
  const compatibilityScores = data.map(item => item.compatibility_score);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Annualized % Return',
        data: annualReturns,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Compatibility Score',
        data: compatibilityScores,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Stock Portfolio',
      },
    },
  };

  const openYahooFinance = (ticker) => {
    const url = `https://finance.yahoo.com/quote/${ticker}`;
    window.open(url, '_blank');
  };


  return (
    <div className="ranking-form-results p-4 bg-white rounded-lg">
      <h2 className="text-xl font-bold mb-2">Results</h2>
      <div className="mt-2" style={{ height: '300px' }}>
        <Bar data={chartData} options={options} />
      </div>
      <table className="min-w-full bg-white mb-2 text-sm">
        <thead>
          <tr>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">Ticker</th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">Name</th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">Annualized % Return</th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">Years in S&P Index</th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">Risk (0-100)</th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">Compatibility Score</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.ticker} className="hover:bg-gray-100 cursor-pointer" onClick={() => openYahooFinance(item.ticker)}>
              <td className="py-1 px-2 border-b border-gray-300">{item.ticker}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.name}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.annual_return * 100}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.years_index}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.risk}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.compatibility_score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RankingFormResults;