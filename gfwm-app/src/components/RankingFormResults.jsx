import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";
import Papa from "papaparse";
import StockSearchModal from "./StockSearchModal";

import ComparisonTable from "./ComparisonTable";
import PieChart from "./PieChart";
import TimeseriesChart from "./TimeseriesChart";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RankingFormResults = ({ results, columns }) => {
  // unpack results object into df, df, dict

  // 'sp500_compatibility': filter_results[['ticker', 'compatibility']].to_dict(orient='records'),
  // 'portfolio': portfolio[['ticker', 'weight']].to_dict(orient = 'records'),
  // 'summary_statistics':

  const {
    sp500_compatibility: server_compatibility_scores,
    portfolio: server_portfolio_weights,
    summary_statistics,
  } = results;

  const {
    portfolio_esg_score,
    portfolio_average_return,
    growth_of_10k_10_years,
    portfolio_volatility,
    portfolio_sharpe,
    sp500_average_return,
    sp500_average_volatility,
    sp500_sharpe,
    spy_max_dd,
    portfolio_max_dd,
    spy_timeseries,
    portfolio_timeseries,
    timeseries_dates,
  } = summary_statistics;

  // MANAGE STOCK DATA OBJECT

  // contains all stocks the client might want to invest in
  // stocks removed by fossil fuels / weapons have compatibility 0 by default
  const [stock_data, setStockData] = useState([]);

  // runs when server's compatibility score changes
  // augments preprocessed csv with compatibility scores from server
  useEffect(() => {
    // stop if there are no compatibility scores to augment stock_data with
    if (!server_compatibility_scores) return;

    const augmentStockData = async () => {
      try {
        const preprocessedCSV = await fetch("/preprocessed_refinitiv.csv"); //public version of preprocessed
        const preprocessedCSVText = await preprocessedCSV.text();
        const parseResult = Papa.parse(preprocessedCSVText, {
          header: true,
          skipEmptyLines: true,
        });
        // List of columns known to be numeric
        //TODO make this not hardcoded
        const numericColumns = [
          "esg_combined",
          "controversy",
          "environment",
          "social",
          "governance",
          "human_rights",
          "community",
          "workforce",
          "product_responsibility",
          "shareholders",
          "management",
          "annual_return",
          "volatility",
          "fossil_fuels",
          "weapons",
          "tobacco",
        ];

        //augment data with compatibility column pulled from server response
        const augmentedData = parseResult.data.map((row) => {
          // Convert specific numeric columns
          const parsedRow = {
            ...row,
            ...Object.fromEntries(
              numericColumns.map((col) => [col, Number(row[col]) || 0]) // Convert or default to 0
            ),
          };

          // Match ticker to score or assign 0
          // 0 happens if the ticker was excluded for fossil fuels or weapons involvement
          const compatibility = server_compatibility_scores[row.ticker] || 0;

          return {
            ...parsedRow,
            compatibility, // Add compatibility score as a new property
          };
        });

        console.log("updated stock data wth compatibility", augmentedData);

        setStockData(augmentedData);
      } catch (error) {
        console.error(
          "Error with augmenting preprocessed CSV with server's compatibility scores:",
          error
        );
      }
    };

    augmentStockData();
  }, [server_compatibility_scores]);
  //--------------------------------

  // MANAGE PORTFOLIO DATA OBJECT

  // copy of the selected stocks from the overall S&P 500 data
  // also includes weight column
  const [portfolio_data, setPortfolioData] = useState([]);

  // runs when the server updates the portfolio weights object
  // copies correct rows (tickers) from stock_data and augments with given weight
  useEffect(() => {
    if (!server_portfolio_weights) return;

    const updatePortfolioData = async () => {
      //TODO speed this up either by
      // 1. returning a proper object of {ticker1: weight1, ticker2: weight2 ...}
      // 2. making a hashmap on the client of the same format

      // first check if the ticker exists in the portfolio object
      const portfolioData = stock_data
        .filter(
          (row) => server_portfolio_weights.hasOwnProperty(row.ticker)

          //then access the weight directly by ticker
        )
        .map((row) => {
          const weight = server_portfolio_weights[row.ticker] || 0;
          return {
            ...row,
            weight, // Add the weight property
          };
        });
      setPortfolioData(portfolioData);
    };

    updatePortfolioData();
  }, [server_portfolio_weights, stock_data]);
  //-----------------------------------

  // HANDLE SORTING OF PORTFOLIO DATA

  const [sortConfig, setSortConfig] = useState({
    key: "compatibility", //default sort by compatibility
    direction: "descending",
  });

  // Sort portfolio_data based on sortConfig
  const sorted_portfolio_data = React.useMemo(() => {
    let sortableData = [...portfolio_data]; //shallow copy of memoized data
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [portfolio_data, sortConfig]); // update sorted_portfolio_data when these change

  // Handle sorting
  const requestSort = (key) => {
    let direction = "descending";
    if (sortConfig.key === key && sortConfig.direction === "descending") {
      direction = "ascending";
    }
    setSortConfig({ key, direction });
  };
  //------------------------------

  const rowRefs = React.useRef([]);

  // VALUES FOR COMPARISON TABLE
  const comparisonTableData = [
    {
      field: "Average Return",
      portfolio: `${(portfolio_average_return * 100).toFixed(2)}% (delta ${(
        (portfolio_average_return - sp500_average_return) *
        100
      ).toFixed(2)}%)`,
      sp500: `${(sp500_average_return * 100).toFixed(2)}%`,
    },
    {
      field: "Average Standard Deviation",
      portfolio: `${(portfolio_volatility * 100).toFixed(2)}% (delta ${(
        (portfolio_volatility - sp500_average_volatility) *
        100
      ).toFixed(2)}%)`,
      sp500: `${(sp500_average_volatility * 100).toFixed(2)}%`,
    },
    // {
    //   field: "Growth of $10k in 10 years",
    //   portfolio: `$${growth_of_10k_10_years.toFixed(2)}`,
    //   sp500: `$${(10000 * Math.pow(1 + sp500_average_return, 10)).toFixed(2)}`,
    // },
    {
      field: "Sharpe Ratio",
      portfolio: `${portfolio_sharpe.toFixed(2)}`,
      sp500: `${sp500_sharpe.toFixed(2)}`,
    },
    {
      field: "Max Drawdown",
      portfolio: `${(portfolio_max_dd * 100).toFixed(2)}%`,
      sp500: `${(spy_max_dd * 100).toFixed(2)}%`,
    },
    {
      field: "Average ESG Score",
      portfolio: `${portfolio_esg_score.toFixed(2)}`,
      sp500: "66.66",
    },
    {
      field: "Number of stocks",
      portfolio: `${portfolio_data.length}`,
      sp500: "500",
    },
  ];

  // OPEN TABLEAU DASHBOARD FOR SELECTED TICKER
  const [selectedTicker, setSelectedTicker] = React.useState(null);

  const openTableauDashboard = (ticker) => {
    setSelectedTicker(ticker);

    const popup = window.open("", "_blank", "width=1600,height=950");
    const embedCode = `
    <div class='tableauPlaceholder' id='viz1731438480314' style='position: relative'>
        <noscript>
          <a href='#'>
            <img alt='Dashboard 1' src='https://public.tableau.com/static/images/In/IndividualStock3_0/Dashboard1/1_rss.png' style='border: none' />
          </a>
        </noscript>
        <object class='tableauViz' style='display:none;'>
          <param name='host_url' value='https%3A%2F%2Fpublic.tableau.com%2F' />
          <param name='embed_code_version' value='3' />
          <param name='site_root' value='' />
          <param name='name' value='IndividualStock3_0/PrimaryDashboard' />
          <param name='tabs' value='no' />
          <param name='toolbar' value='yes' />
          <param name='static_image' value='https://public.tableau.com/static/images/In/IndividualStock3_0/Dashboard1/1.png' />
          <param name='animate_transition' value='yes' />
          <param name='display_static_image' value='yes' />
          <param name='display_spinner' value='yes' />
          <param name='display_overlay' value='yes' />
          <param name='display_count' value='yes' />
          <param name='language' value='en-US' />
          <param name='filter' value='Symbol=${ticker}' />
        </object>
      </div>
      <script type='text/javascript'>
        var divElement = document.getElementById('viz1731438480314');
        var vizElement = divElement.getElementsByTagName('object')[0];
      
          vizElement.style.width = '100%';
          vizElement.style.height = '100%';
        
        var scriptElement = document.createElement('script');
        scriptElement.src = 'https://public.tableau.com/javascripts/api/viz_v1.js';
        vizElement.parentNode.insertBefore(scriptElement, vizElement);
      </script>
      `;
    popup.document.open();
    popup.document.write(embedCode);
    popup.document.close();
  };
  //--------------

  //SCROLL TO TOP
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  //ADD REMOVE
  const handleAddToPortfolio = (stock) => {

    // if not already in portfolio, add it
    if (!portfolio_data.find((item) => item.ticker === stock.ticker)) {








      const stockWithWeight = { ...stock, weight: 0 }; // Add the weight field

      setPortfolioData((prevData) => [...prevData, stockWithWeight]);
    }
    setSelectedTicker(stock.ticker);
  };

  const handleRemoveFromPortfolio = (ticker) => {
    setPortfolioData(portfolio_data.filter((item) => item.ticker !== ticker));
    setSelectedTicker(ticker);
  };

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedStocks, setSelectedStocks] = useState([]);

  const handleSelectStock = (ticker) => {
    setSelectedStocks((prevSelected) =>
      prevSelected.includes(ticker)
        ? prevSelected.filter((item) => item !== ticker)
        : [...prevSelected, ticker]
    );
    setSelectedTicker(ticker);
  };

  return (
    <div className="ranking-form-results p-4 bg-white rounded-lg">
      <h2 className="text-xl font-bold mb-2">Results Summary</h2>
      <div className="flex flex-wrap flex-col lg:flex-row gap-4 items-start w-full">
        {/* Comparison Table */}
        <div className="flex-none w-full sm:w-[35%] min-w-[200px]">
          <ComparisonTable data={comparisonTableData} />
        </div>

        {/* Timeseries Chart */}
        <div className="flex-grow w-[40%]">
          <TimeseriesChart
            portfolio={portfolio_timeseries}
            spy={spy_timeseries}
            dates={timeseries_dates}
          />
        </div>

        {/* Pie Chart */}
        <div className="flex-none w-[20%] min-w-[100px]">
          <PieChart weights={portfolio_data.map((item) => item.weight * 100)} />
        </div>
      </div>
      <h2 className="text-xl font-bold mb-2">Portfolio</h2>
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="hover:opacity-75 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Edit Portfolio
        </button>

        {/* <button
          disabled={true} // Disables the button
          className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
        >
          Recalculate Weights
        </button> */}
      </div>
      <StockSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentStocks={portfolio_data}
        stocks={stock_data}
        onAddToPortfolio={handleAddToPortfolio}
        onRemovePortfolio={handleRemoveFromPortfolio}
        onClickStock={openTableauDashboard}
        selectedStocks={selectedStocks}
        setSelectedStocks={setSelectedStocks}
        handleSelectStock={handleSelectStock}
      />
      <div className="relative">
        <table className="min-w-full bg-white mb-2 text-sm">
          <thead className="sticky top-0 bg-white </tr>z-10">
            <tr title="Sort data">
              <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider"></th>

              <th
                className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer"
                onClick={() => requestSort("ticker")}
              >
                Symbol{" "}
                {sortConfig.key === "ticker" &&
                  (sortConfig.direction === "ascending" ? "▲" : "▼")}
              </th>

              <th
                className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer"
                onClick={() => requestSort("name")}
              >
                Name{" "}
                {sortConfig.key === "name" &&
                  (sortConfig.direction === "ascending" ? "▲" : "▼")}
              </th>
              <th
                className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer"
                onClick={() => requestSort("annual_return")}
              >
                Annualized Return{" "}
                {sortConfig.key === "annual_return" &&
                  (sortConfig.direction === "ascending" ? "▲" : "▼")}
              </th>
              <th
                className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer"
                onClick={() => requestSort("sd")}
              >
                Standard Deviation{" "}
                {sortConfig.key === "volatility" &&
                  (sortConfig.direction === "ascending" ? "▲" : "▼")}
              </th>
              <th
                className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer"
                onClick={() => requestSort("esg")}
              >
                Combined ESG{" "}
                {sortConfig.key === "esg_combined" &&
                  (sortConfig.direction === "ascending" ? "▲" : "▼")}
              </th>
              <th
                className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer"
                onClick={() => requestSort("environment")}
              >
                Environment{" "}
                {sortConfig.key === "environment" &&
                  (sortConfig.direction === "ascending" ? "▲" : "▼")}
              </th>
              <th
                className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer"
                onClick={() => requestSort("social")}
              >
                Social{" "}
                {sortConfig.key === "social" &&
                  (sortConfig.direction === "ascending" ? "▲" : "▼")}
              </th>
              <th
                className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer"
                onClick={() => requestSort("governance")}
              >
                Governance{" "}
                {sortConfig.key === "governance" &&
                  (sortConfig.direction === "ascending" ? "▲" : "▼")}
              </th>
              <th
                className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer"
                onClick={() => requestSort("compatibility")}
              >
                Compatibility{" "}
                {sortConfig.key === "compatibility" &&
                  (sortConfig.direction === "ascending" ? "▲" : "▼")}
              </th>
              <th
                className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer"
                onClick={() => requestSort("weight")}
              >
                Weight{" "}
                {sortConfig.key === "weight" &&
                  (sortConfig.direction === "ascending" ? "▲" : "▼")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted_portfolio_data.map((item, index) => {
              const isSelected = selectedStocks.includes(item.ticker);
              return (
                <tr
                  ref={(el) => (rowRefs.current[item.ticker] = el)}
                  key={item.ticker}
                  className={`hover:bg-gray-100 cursor-pointer ${
                    selectedTicker === item.ticker ? "bg-gray-100" : ""
                  }`}
                  onClick={() => openTableauDashboard(item.ticker)}
                  title="Show more"
                >
                  <td
                    className="border-b text-right pl-2 border-gray-300 cursor-pointer "
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectStock(item.ticker);
                    }}
                  >
                    <input
                      className="cursor-pointer"
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectStock(item.ticker)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>

                  <td className="py-1 px-2 border-b border-gray-300">
                    {item.ticker}
                  </td>
                  <td className="py-1 px-2 border-b border-gray-300">
                    {item.name}
                  </td>
                  <td className="py-1 px-2 border-b border-gray-300">
                    {(item.annual_return * 100).toFixed(2)}%
                  </td>
                  <td className="py-1 px-2 border-b border-gray-300">
                    {(item.volatility * 100).toFixed(2)}%
                  </td>
                  <td className="py-1 px-2 border-b border-gray-300">
                    {item.esg_combined.toFixed(2)}
                  </td>
                  <td className="py-1 px-2 border-b border-gray-300">
                    {item.environment.toFixed(2)}
                  </td>
                  <td className="py-1 px-2 border-b border-gray-300">
                    {item.social.toFixed(2)}
                  </td>
                  <td className="py-1 px-2 border-b border-gray-300">
                    {item.governance.toFixed(2)}
                  </td>
                  <td className="py-1 px-2 border-b border-gray-300 ">
                    {item.compatibility.toFixed(0)}%
                  </td>
                  <td className="py-1 px-2 border-b border-gray-300">
                    {(item.weight * 100).toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RankingFormResults;
