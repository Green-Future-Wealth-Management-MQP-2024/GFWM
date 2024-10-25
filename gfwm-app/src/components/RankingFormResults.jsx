import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useEffect } from "react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RankingFormResults = ({ data }) => {

  const top20Data = data.slice(0, 20);
  const sortedData = top20Data.sort((a, b) => b.annual_return - a.annual_return);
  // Prepare data for the chart
  const labels = sortedData.map(item => item.ticker);
  const annualReturns = sortedData.map(item => item.annual_return * 100);
  const compatibilityScores = sortedData.map(item => item.compatibility_score);

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
  const rowRefs = React.useRef([]);
  const [selectedTicker, setSelectedTicker] = React.useState(null);

  useEffect(() => { 
    setSelectedTicker(null);
    }, [data]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top 20 Annualized Returns in Portfolio',
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const ticker = labels[index];
        const rowRef = rowRefs.current[ticker];
        setSelectedTicker(ticker);
        if (rowRef) {
          rowRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    },
  };

  const openYahooFinance = (ticker) => {
    const url = `https://finance.yahoo.com/quote/${ticker}`;
    window.open(url, '_blank');
    setSelectedTicker(ticker);
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
          {data.map((item, index) => (
            <tr ref={(el) => (rowRefs.current[item.ticker] = el)} key={item.ticker} 
            className={`hover:bg-gray-100 cursor-pointer ${selectedTicker === item.ticker ? 'bg-gray-100' : ''}`} onClick={() => openYahooFinance(item.ticker)}>
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