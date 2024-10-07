import React from "react";

const RankingFormResults = ({ data }) => {
    console.log(data);
  return (
    <div className="ranking-form-results">
      <h2>Results</h2>
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Name</th>
            <th>Score</th>
            <th>Growth Estimate (5 yrs)</th>
          </tr>
        </thead>
        <tbody>
            {data.map((row) => (
                <tr key={row.symbol}>
                <td>{row.symbol}</td>
                <td>{row.name}</td>
                <td>{row.score}</td>
                <td>{row.growth_estimate_5_yrs}</td>
                </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default RankingFormResults;