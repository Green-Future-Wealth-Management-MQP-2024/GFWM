import React from "react";

const RankingFormResults = ({ data }) => {
  return (
    <div className="ranking-form-results p-4 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Results</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">Symbol</th>
            <th className="py-2 px-4 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">Name</th>
            <th className="py-2 px-4 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">Score</th>
            <th className="py-2 px-4 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">Growth Estimate (5 yrs)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.symbol} className="hover:bg-gray-100">
              <td className="py-2 px-4 border-b border-gray-300">{row.symbol}</td>
              <td className="py-2 px-4 border-b border-gray-300">{row.name}</td>
              <td className="py-2 px-4 border-b border-gray-300">{row.score}</td>
              <td className="py-2 px-4 border-b border-gray-300">{row.growth_estimate_5_yrs}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RankingFormResults;