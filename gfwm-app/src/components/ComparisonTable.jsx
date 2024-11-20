import React from 'react';

const ComparisonTable = ({ data }) => {
  return (
    <div>
      <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Field</th>
            <th>Portfolio</th>
            <th>S&P 500</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.field}</td>
              <td><span className="text-green-700 text-2xl font-bold">{row.portfolio}</span></td>
              <td><span className="text-light-green-700 text-2xl font-bold">{row.sp500}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;
