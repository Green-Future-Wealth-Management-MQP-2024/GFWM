import React, { useEffect, useState } from "react";

const StockSearchModal = ({
  isOpen,
  onClose,
  stocks,
  currentStocks,
  onAddStocks,
  onRemoveTickers,
  onClickStock,
  selectedTickers,
  setSelectedTickers,
  handleSelectStock,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    setSearchTerm("");
    if (isOpen && selectedTickers.length > 0) {
      setSelectedCategory("selected");
    }
  }, [isOpen]);

  const categories = [
    { name: "All", key: "all" },
    { name: "Selected Stocks", key: "selected" },
    { name: "In Portfolio", key: "current_portfolio" },
    { name: "Not In Portfolio", key: "not_in_portfolio" },
    { name: "Top Overall ESG", key: "esg_combined" },
    { name: "Top Environment", key: "environment" },
    { name: "Top Governance", key: "governance" },
    { name: "Top Product Responsibility", key: "product_responsibility" },
    { name: "Top Social", key: "social" },
    { name: "Top Human Rights", key: "human_rights" },
  ];

  const filteredStocks = stocks.filter((stock) => {
    const matchesSearchTerm =
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.ticker.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearchTerm;
  });

  const sortedStocks =
    selectedCategory === "all"
      ? filteredStocks
      : selectedCategory === "selected"
      ? filteredStocks.filter((stock) => selectedTickers.includes(stock.ticker))
      : selectedCategory === "current_portfolio"
      ? filteredStocks.filter((stock) => currentStocks.some((cs) => cs.ticker === stock.ticker))
      : selectedCategory === "not_in_portfolio"
      ? filteredStocks.filter((stock) => !currentStocks.some((cs) => cs.ticker === stock.ticker))
      : filteredStocks
          .filter((stock) => stock[selectedCategory] !== undefined)
          .sort((a, b) => (b[selectedCategory] || 0) - (a[selectedCategory] || 0))
          .slice(0, 25);

  if (!isOpen) return null;

  const handleAddSelected = () => {
    if (
      !window.confirm(`Are you sure you want to add the 
      ${selectedTickers.length} selected stock(s) to your portfolio?`)
    ) {
      return;
    }
    // handle adding list of tickers accounting for duplicates
    const stocksToAdd = stocks.filter(
      (stock) => selectedTickers.includes(stock.ticker) && !currentStocks.includes(stock.ticker)
    );
    onAddStocks(stocksToAdd);
    setSelectedTickers([]);
  };

  const handleRemoveSelected = () => {
    if (
      !window.confirm(
        `Are you sure you want to remove the selected ${selectedTickers.length} stock(s) from your portfolio?`
      )
    ) {
      return;
    }
    // handle removing list of selected tickers from portfolio
    onRemoveTickers(selectedTickers);
    setSelectedTickers([]);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg p-6 z-50 max-w-3xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Portfolio Edit</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
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
            onClick={() => {
              setSearchTerm("");
            }}
            className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:opacity-75"
          >
            Clear
          </button>
        </div>
        <div className="flex items-center mb-3">
          <label className="mr-2">Filter by category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSearchTerm("");
            }}
            className="p-2 border border-gray-300 rounded"
          >
            {categories.map((category) => (
              <option key={category.key} value={category.key}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setSelectedCategory("all")}
            className="ml-2 text-xs text-gray-500 hover:underline  hover:opacity-75"
          >
            Clear Filter
          </button>
        </div>
        <div className="max-h-96 min-h-96 overflow-y-auto">
          <table className="min-w-full bg-white mb-2 text-sm">
            <thead className="sticky top-0 bg-white z-10">
              <tr>
                <th className=" border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider"></th>
                <th className="py-0 px-0 border-b-2 border-gray-300 text-left leading-4 text-gray-600"></th>
                <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">
                  Symbol
                </th>
                <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">
                  Name
                </th>
                <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">
                  Combined ESG
                </th>
                <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">
                  Compatibility
                </th>
                <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedStocks.map((stock, index) => {
                const isInPortfolio = currentStocks.find((pI) => pI.ticker === stock.ticker);
                const isSelected = selectedTickers.includes(stock.ticker);
                return (
                  <tr key={stock.ticker} className="hover:bg-gray-100  ">
                    <td
                      className="border-b text-right pl-2 border-gray-300 cursor-pointer "
                      onClick={() => handleSelectStock(stock.ticker)}
                    >
                      <input
                        className="cursor-pointer"
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectStock(stock.ticker)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td
                      className="py-0 px-0 border-b border-gray-300 text-gray-400 text-right cursor-pointer"
                      onClick={() => handleSelectStock(stock.ticker)}
                    >
                      {index + 1}
                    </td>
                    <td
                      className="py-1 px-2 border-b border-gray-300 cursor-pointer"
                      onClick={() => onClickStock(stock.ticker)}
                    >
                      {stock.ticker}
                    </td>

                    <td
                      className="py-1 px-2 border-b border-gray-300 cursor-pointer"
                      onClick={() => onClickStock(stock.ticker)}
                    >
                      {stock.name}
                    </td>
                    <td
                      className="py-1 px-2 border-b border-gray-300 cursor-pointer"
                      onClick={() => onClickStock(stock.ticker)}
                    >
                      {stock.esg_combined.toFixed(2)}
                    </td>
                    <td
                      className="py-1 px-2 border-b border-gray-300 cursor-pointer"
                      onClick={() => onClickStock(stock.ticker)}
                    >
                      {stock.compatibility.toFixed(0)}%
                    </td>
                    <td
                      className="py-1 px-2 border-b border-gray-300 cursor-pointer"
                      onClick={() => onClickStock(stock.ticker)}
                    >
                      {isInPortfolio ? (
                        <span className="text-green-500">In Portfolio</span>
                      ) : (
                        <span className="text-gray-500 text-xs">Not In Portfolio</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end space-x-4 mt-4">
          <div className="flex flex-col text-gray-700">
            <span className="">{selectedTickers.length} stock(s) selected</span>
            <button
              onClick={() => setSelectedTickers([])}
              className=" text-xs hover:underline text-gray-500 hover:opacity-75"
            >
              Clear Selected Stocks
            </button>
          </div>

          <button onClick={handleRemoveSelected} className="hover:opacity-75 px-4 py-2 bg-red-500 text-white rounded">
            Remove Selected
          </button>
          <button onClick={handleAddSelected} className="hover:opacity-75 px-4 py-2 bg-green-500 text-white rounded">
            Add Selected
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockSearchModal;
