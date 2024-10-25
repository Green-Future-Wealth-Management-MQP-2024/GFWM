import React from "react";

const RankingFormResults = ({ data }) => {
  console.log(Object.values(data))
  return (
    <div className="ranking-form-results p-4 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Results</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">Ticker</th>
            <th className="py-2 px-4 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">Name</th>
            <th className="py-2 px-4 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">Annualized % Return</th>
            <th className="py-2 px-4 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">Standard Deviation</th>
            <th className="py-2 px-4 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">Years in S&P Index</th>
            <th className="py-2 px-4 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">Compatibility Score</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(data).map((item) => (
            <tr key={item.ticker} className="hover:bg-gray-100">
              <td className="py-2 px-4 border-b border-gray-300">{item.ticker}</td>
              <td className="py-2 px-4 border-b border-gray-300">{item.name}</td>
              <td className="py-2 px-4 border-b border-gray-300">{item.annual_return * 100}</td>
              <td className="py-2 px-4 border-b border-gray-300">{item.sd}</td>
              <td className="py-2 px-4 border-b border-gray-300">{item.years_index}</td>
              <td className="py-2 px-4 border-b border-gray-300">{item.compatibility_score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RankingFormResults;