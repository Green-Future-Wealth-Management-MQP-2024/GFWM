import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useEffect, useState } from "react";
import Papa from "papaparse";
import StockSearchModal from "./StockSearchModal";

import ComparisonTable from "./ComparisonTable";
import PieChart from "./PieChart";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RankingFormResults = ({ results }) => {
   
  results = results || {};
  
  const{average_esg_score, portfolio_average_return, sp500_average_return,
    growth_of_10k_10_years, portfolio_volatility, portfolio_sharpe} = results.summary_statistics;

  const [portfolio_data, setPortfolioData] = useState(results.top_100);
  useEffect(() => { 
    setPortfolioData(results.top_100);
    }, [results]);

  const [sortConfig, setSortConfig] = useState({ key: 'compatibility_score', direction: 'descending' });


  //get SNP 500
  const [csvData, setCsvData] = useState([]);
  const [snp500Data, setSnp500Data] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const csvData = await CSVdata();
      setCsvData(csvData);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (csvData.length > 0 && results.snp500_compatibility) {
      const combinedData = combineData(csvData, results.snp500_compatibility);
      setSnp500Data(combinedData);
    }
  }, [csvData, results.snp500_compatibility]);

  const CSVdata = async () => {
    try {
      const csvSNP = await fetch('/preprocessed.csv');
      const csvSNPData = await csvSNP.text();
      const parsedData = Papa.parse(csvSNPData, { header: true, skipEmptyLines: true });
      return parsedData.data;
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const renameColumns = (data) => {
    return data.map((item) => ({
      ticker: item['Symbol'],
      name: item['Name'],
      esg: parseFloat(item['ESG Score']) || -1,
      controversy: parseFloat(item['ESG Controversies Score']) || -1,
      environment: parseFloat(item['Environment Pillar Score']) || -1,
      social: parseFloat(item['Social Pillar Score']) || -1,
      governance: parseFloat(item['Governance Pillar Score']) || -1,
      annual_return: parseFloat(item['Total Returns']) || -1,
      sd: parseFloat(item['Standard Deviation']) || -1,
      emissions: parseFloat(item['Emissions Score']) || -1,
      product_responsibility: parseFloat(item['Product Responsibility Score']) || -1,
      human_rights: parseFloat(item['Human Rights Score']) || -1,
      compatibility_score: parseFloat(item['compatibility_score']) || -1,
    }));
  };

  const combineData = (csvData, snp500Compatibility) => {
    const renamedData = renameColumns(csvData);
    const combinedData = renamedData.map((item) => {
      const snp500Item = snp500Compatibility.find((snpItem) => snpItem.ticker === item.ticker);
      return {
        ...item,
        compatibility_score: snp500Item ? snp500Item.compatibility_score : item.compatibility_score,
      };
    });
    //console.log(combinedData);
    return combinedData;
  };




  
  const rowRefs = React.useRef([]);

  //PORTFOLIO RETURNS VS S&P INDEX GRAPH

  //ALLOW FOR SORTING OF PORTFOLIO DATA
  // Sort portfolio_data based on sortConfig
  const sorted_portfolio_data = React.useMemo(() => {
    let sortableData = [...portfolio_data]; //shallow copy of memoized data
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
    
    //objects watched by react to update sorted_portfolio_data when these change
  }, [portfolio_data, sortConfig]); 

  // Handle sorting
  const requestSort = key => {
    let direction = 'descending';
    if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'ascending';
    }
    setSortConfig({ key, direction });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // TODO get the sp500 data from the server (benchmarks csv)
  const comparisonTableData = [
    {field: "Annual Return", portfolio: `${(portfolio_average_return * 100).toFixed(2)}%`, sp500: `${(sp500_average_return * 100).toFixed(2)}%`},
    {field: "Delta Return", portfolio: `${((portfolio_average_return - sp500_average_return) * 100).toFixed(2)}%`, sp500: `${((sp500_average_return - portfolio_average_return) * 100).toFixed(2)}%`},
    {field: "Annual Volatility", portfolio: `${(portfolio_volatility * 100).toFixed(2)}%`, sp500:"15.6%"},
    { field: "Growth of $10k in 10 years", portfolio: `${formatCurrency(growth_of_10k_10_years)}`, sp500: `${formatCurrency(10000 * Math.pow(1 + 0.1, 10))}`},
    { field: "Sharpe Ratio", portfolio: `${portfolio_sharpe.toFixed(2)}`, sp500: "0.73"},
    { field: "Average ESG Score", portfolio: `${average_esg_score.toFixed(2)}`, sp500:"66.66"},
    { field: "Number of stocks", portfolio: `${portfolio_data.length}`, sp500: "500" }
  ];


  //SELECTED TICKER AND OPEN TABLEAU DASHBOARD
  const [selectedTicker, setSelectedTicker] = React.useState(null);

    const openTableauDashboard = (ticker) => {
      setSelectedTicker(ticker);

      const popup = window.open('', '_blank', 'width=1600,height=950');
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
  //SCROLL TO TOP
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    //ADD REMOVE
    const handleAddToPortfolio = (stock) => {
      if (!portfolio_data.find((item) => item.ticker === stock.ticker)) {
        setPortfolioData((prevData) => [...prevData, stock]);
      }
      setSelectedTicker(stock.ticker);
    };
  
    const handleRemoveFromPortfolio = (ticker) => {
      setPortfolioData((prevPortfolioData) =>
        prevPortfolioData.filter((item) => !ticker.includes(item.ticker))
      );
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

      <h2 className="text-xl font-bold mb-2">Results</h2>
      

      <div className="flex flex-wrap flex-col lg:flex-row lg:items-start ">
        {/* <div className="flex-1 max-w-2xl" style={{ minWidth: '32rem' }}>
          <Bar data={AnnualReturnBar_chartData} options={AnnualReturnBar_Options} />
        </div>

        <div className="flex-1 min-w-72 max-w-sm ">
          <Bar data={sp500_return_data} options={sp500_return_options} />
        </div> */}

        <div className="ml-5 shrink grow min-w-72 max-w-5xl basis-0 ">
          <ComparisonTable data = {comparisonTableData}></ComparisonTable>
        </div>

        <div className="flex-1 min-w-72 max-w-sm ">
          <PieChart weights={portfolio_data.map((item) => item.weight * 100)} />
        </div>

        
      </div>
      <button onClick={() => setIsModalOpen(true)} className="hover:opacity-75 bg-blue-500 text-white px-4 py-2 rounded mb-4">
        Edit Portfolio
      </button>

      <StockSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentStocks={portfolio_data}
        stocks={snp500Data}
        onAddToPortfolio={handleAddToPortfolio}
        onRemovePortfolio={handleRemoveFromPortfolio}
        onClickStock={openTableauDashboard}
        selectedStocks={selectedStocks}
        setSelectedStocks={setSelectedStocks}
        handleSelectStock={handleSelectStock}
      />
  
<div className="relative">
      <table className="min-w-full bg-white mb-2 text-sm">
        <thead className="sticky top-0 bg-white z-10">
        <tr title="Sort data">
        <th className="border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider"></th>
            <th className="py-0 px-0 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider"></th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer" onClick={() => requestSort('ticker')}>
              Symbol {sortConfig.key === 'ticker' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
            </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer" onClick={() => requestSort('name')}>
              Name {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
            </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer" onClick={() => requestSort('annual_return')}>
              Annualized Return {sortConfig.key === 'annual_return' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
            </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer" onClick={() => requestSort('sd')}>
              SD {sortConfig.key === 'sd' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
            </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer" onClick={() => requestSort('esg')}>
             ESG {sortConfig.key === 'esg' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
            </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer" onClick={() => requestSort('environment')}>
              Environment {sortConfig.key === 'environment' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
            </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer" onClick={() => requestSort('social')}>
              Social {sortConfig.key === 'social' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
            </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer" onClick={() => requestSort('governance')}>
              Governance {sortConfig.key === 'governance' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
            </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer" onClick={() => requestSort('compatibility_score')}>
              Compatibility {sortConfig.key === 'compatibility_score' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
            </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer" onClick={() => requestSort('weight')}>
              Weight {sortConfig.key === 'weight' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
            </th>
  
          </tr>
        </thead>
        <tbody>
          {sorted_portfolio_data.map((item, index) => {

            const isSelected = selectedStocks.includes(item.ticker);
          
          
          return (
            <tr ref={(el) => (rowRefs.current[item.ticker] = el)} key={item.ticker} 
            className={`hover:bg-gray-100 cursor-pointer ${selectedTicker === item.ticker ? 'bg-gray-100' : ''}`} onClick={() => openTableauDashboard(item.ticker)}
            title="Show more">
                <td className="border-b text-right pl-2 border-gray-300 cursor-pointer " onClick={(e) => {e.stopPropagation(); handleSelectStock(item.ticker)}}>
                      <input
                        className='cursor-pointer'
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectStock(item.ticker)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
              <td className="py-0 px-0 border-b border-gray-300 text-gray-400 text-right" onClick={(e) => {e.stopPropagation(); handleSelectStock(item.ticker)}}>{index +1}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.ticker}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.name}</td>
              <td className="py-1 px-2 border-b border-gray-300">{(item.annual_return * 100).toFixed(2)}%</td>
              <td className="py-1 px-2 border-b border-gray-300">{(item.sd * 100).toFixed(2)}%</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.esg.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.environment.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.social.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.governance.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300 ">{item.compatibility_score.toFixed(0)}%</td>
                <td className="py-1 px-2 border-b border-gray-300">{(item.weight * 100).toFixed(2)}%</td>
              

            </tr>
          )})}
        </tbody>
      </table>
    
      </div>

  <button onClick={scrollToTop} className="fixed bottom-4 right-4 bg-green-700 text-white p-2 rounded-full shadow-lg">↑</button>
    </div>
  );
};

export default RankingFormResults;