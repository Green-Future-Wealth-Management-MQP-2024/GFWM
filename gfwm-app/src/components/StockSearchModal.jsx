import React, { useState } from 'react';

const StockSearchModal = ({ isOpen, onClose, stocks, currentStocks, onAddToPortfolio, onRemovePortfolio, onClickStock }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStocks = stocks.filter(stock =>
    stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.ticker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg p-6 z-50 max-w-3xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Search Stocks</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
        </div>
        <div className="flex items-center mb-3">
    <input
      type="text"
      placeholder="Search by name or ticker"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded"
    />
    <button
      onClick={() => setSearchTerm('')}
      className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:opacity-75"
    >
      Clear
    </button>
  </div>
        <div className="max-h-96 min-h-96 overflow-y-auto">
          <table className="min-w-full bg-white mb-2 text-sm">
            <thead>
              <tr>
                <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">Symbol</th>
                <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">Name</th>
                <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">Combined ESG</th>
                <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">Compatibility</th>
                <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">Edit</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map((stock) =>{
                const isInPortfolio = currentStocks.find((pI) => pI.ticker === stock.ticker);
                            return (
                <tr key={stock.ticker} onClick={() => onClickStock(stock.ticker)} className="hover:bg-gray-100 cursor-pointer">
                  <td className="py-1 px-2 border-b border-gray-300">{stock.ticker}</td>
                  <td className="py-1 px-2 border-b border-gray-300">{stock.name}</td>
                  <td className="py-1 px-2 border-b border-gray-300">{stock.esg_combined.toFixed(2)}</td>
                <td className="py-1 px-2 border-b border-gray-300">{stock.compatibility.toFixed(0)}%</td>
                  <td className="py-1 px-2 border-b border-gray-300">
                  {isInPortfolio ? (
                        <button
                          onClick={(e) => {e.stopPropagation(); onRemovePortfolio(stock.ticker)}}
                          className="hover:opacity-75 bg-red-500 text-white px-2 py-1 rounded"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {e.stopPropagation(); onAddToPortfolio(stock)}}
                          className="hover:opacity-75 bg-green-500 text-white px-2 py-1 rounded"
                        >
                          Add
                        </button>
                      )}
                  </td>


                  
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockSearchModal;