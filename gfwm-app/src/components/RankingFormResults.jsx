import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useEffect, useState } from "react";
import Papa from "papaparse";
import StockSearchModal from "./StockSearchModal";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RankingFormResults = ({ results }) => {
  results = results || {};
  const [data, setData] = useState(results.top_100);
  useEffect(() => { 
    setData(results.top_100);
    }, [results]);

  const [sortConfig, setSortConfig] = useState({ key: 'compatibility_score', direction: 'descending' });
  const snp_avg = 0.1035;
  const portfolio_avg_esg = data.reduce((sum, item) => sum + item.esg, 0) / data.length;
  const portfolio_avg_return = data.reduce((sum, item) => sum + item.annual_return, 0) / data.length;
  const portfolio_volatility = Math.sqrt(data.reduce((sum, item) => sum + item.sd ** 2, 0) / data.length);
  const portfolio_sharpe = (portfolio_avg_return - 0.03) / portfolio_volatility;
  const investment_value =  10000 * ((1+ portfolio_avg_return)**10 );


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
    console.log(combinedData);
    return combinedData;
  };


  const top20s = [
    {
      data: snp500Data.sort((a, b) => b.environment - a.environment).slice(0, 20),
      name: 'Environment'
    },
    {
      data: snp500Data.sort((a, b) => b.emissions - a.emissions).slice(0, 20),
      name: 'Emissions'
    },
    {
      data:  snp500Data.sort((a, b) => b.governance - a.governance).slice(0, 20),
      name: 'Governance'
    },
    {
      data:  snp500Data.sort((a, b) => b.product_responsibility - a.product_responsibility).slice(0, 20),
      name: 'Product Responsibility'
    },
    {
      data:  snp500Data.sort((a, b) => b.social - a.social).slice(0, 20),
      name: 'Social'
    },
    {
      data:  snp500Data.sort((a, b) => b.human_rights - a.human_rights).slice(0, 20),
      name: 'Human Rights'
    }
  ];



//ANNUAL RETURN AND COMPATIBILITY SCORE BAR CHART
  const topData = data.slice(0, 20);
  const sortedDataAnnualRet = topData.sort((a, b) => b.annual_return - a.annual_return);
  const labels = sortedDataAnnualRet.map(item => item.ticker);
  const annualReturns = sortedDataAnnualRet.map(item => item.annual_return * 100);
  const compatibilityScores = sortedDataAnnualRet.map(item => item.compatibility_score);

  const AnnualReturnBar_chartData = {
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
  const AnnualReturnBar_Options = {
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
  const rowRefs = React.useRef([]);

  //PORTFILO RETURNS VS S&P INDEX
  const sp500_return = 0.1035;
  const sp500_value = 10000 * ((1+ sp500_return)**10 );
  const sp500_return_data = {
    labels: ['Portfolio', 'S&P 500'],
    datasets: [
      {
        label: '10 Year Return',
        data: [investment_value, sp500_value],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  const sp500_return_options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Portfolio Returns vs S&P 500',
      },
    },
  };

  //SORT DATA IN TABLE
 // Sort data based on sortConfig
 const sortedData = React.useMemo(() => {
  let sortableData = [...data];
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
}, [data, sortConfig]);

// Handle sorting
const requestSort = key => {
  let direction = 'descending';
  if (sortConfig.key === key && sortConfig.direction === 'descending') {
    direction = 'ascending';
  }
  setSortConfig({ key, direction });
};


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
      if (!data.find((item) => item.ticker === stock.ticker)) {
        setData((prevData) => [...prevData, stock]);
      }
      setSelectedTicker(stock.ticker);
    };
  
    const handleRemoveFromPortfolio = (ticker) => {
      setData(data.filter((item) => item.ticker !== ticker));
      setSelectedTicker(ticker);
    };

  const [isModalOpen, setIsModalOpen] = React.useState(false);
    
  return (
    <div className="ranking-form-results p-4 bg-white rounded-lg">

      <h2 className="text-xl font-bold mb-2">Results</h2>
      <button onClick={() => setIsModalOpen(true)} className="hover:opacity-75 bg-blue-500 text-white px-4 py-2 rounded mb-4">
        Search and Add Stocks
      </button>
      <StockSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentStocks={data}
        stocks={snp500Data}
        onAddToPortfolio={handleAddToPortfolio}
        onRemovePortfolio={handleRemoveFromPortfolio}
        onClickStock={openTableauDashboard}
      />
      <div className="flex flex-wrap flex-col lg:flex-row lg:items-start ">
        <div className="flex-1 max-w-2xl" style={{ minWidth: '32rem' }}>
          <Bar data={AnnualReturnBar_chartData} options={AnnualReturnBar_Options} />
        </div>

        <div className="flex-1 min-w-72 max-w-sm ">
          <Bar data={sp500_return_data} options={sp500_return_options} />
        </div>
        <div className="ml-5 shrink grow min-w-72 max-w-5xl basis-0 ">
        
          <p className="pb-1">Average ESG Score: <span className="text-green-700 text-2xl font-bold">{portfolio_avg_esg.toFixed(2)}</span></p>
          <p className="pb-1">Average Annual Return: <span className="text-green-700 text-2xl font-bold">{(portfolio_avg_return * 100).toFixed(2)}%</span></p>
          <p className="pb-1">Average S&P Annual Return: <span className="text-green-700 text-2xl font-bold">{(snp_avg *100).toFixed(2)}%</span></p>
          <p className="pb-1">Value of $10,000 invested 10 years ago: <span className="text-green-700 text-2xl font-bold">${investment_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
          <p className="pb-1">SD/Volatility: <span className="text-green-700 text-2xl font-bold">{(portfolio_volatility * 100).toFixed(2)}%</span></p>
          <p className="pb-1">Sharpe Ratio: <span className="text-green-700 text-2xl font-bold">{portfolio_sharpe.toFixed(2)}</span></p>
        </div>
      </div>
<div className="relative">
      <table className="min-w-full bg-white mb-2 text-sm">
        <thead className="sticky top-0 bg-white </tr>z-10">
        <tr title="Sort data">
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider"></th>
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
              ESG Score {sortConfig.key === 'esg' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
            </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer" onClick={() => requestSort('environment')}>
              E Score {sortConfig.key === 'environment' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
            </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer" onClick={() => requestSort('social')}>
              S Score {sortConfig.key === 'social' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
            </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer" onClick={() => requestSort('governance')}>
              G Score {sortConfig.key === 'governance' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
            </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer" onClick={() => requestSort('compatibility_score')}>
              Compatibility {sortConfig.key === 'compatibility_score' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
            </th>
  
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <tr ref={(el) => (rowRefs.current[item.ticker] = el)} key={item.ticker} 
            className={`hover:bg-gray-100 cursor-pointer ${selectedTicker === item.ticker ? 'bg-gray-100' : ''}`} onClick={() => openTableauDashboard(item.ticker)}
            title="Show more">
              <td className="py-0 px-0 border-b border-gray-300 text-gray-400 text-right">{index +1}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.ticker}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.name}</td>
              <td className="py-1 px-2 border-b border-gray-300">{(item.annual_return * 100).toFixed(2)}%</td>
              <td className="py-1 px-2 border-b border-gray-300">{(item.sd * 100).toFixed(2)}%</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.esg.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.environment.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.social.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.governance.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300 ">{item.compatibility_score.toFixed(0)}%</td>
              <td onClick={(e) => {e.stopPropagation(); handleRemoveFromPortfolio(item.ticker)}}> 
                <button  className="bg-red-500 text-white px-1 rounded">X</button>
                </td>

            </tr>
          ))}
        </tbody>
      </table>
    
      </div>
{top20s.map((top_20) => ( 
      <div className="relative">
      <h2 className="text-xl font-bold mb-2">Top 20 {top_20.name} Stocks</h2>
      <table className="min-w-full bg-white mb-2 text-sm">
        <thead className="sticky top-0 bg-white </tr>z-10">
        <tr>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">
              Symbol
            </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider ">
              Name 
            </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider ">
              Annualized Return</th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider ">
              SD</th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">
              ESG Score
            </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider " >
              E Score</th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider " >
              S Score </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider" >
              G Score </th>
              <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider" >
              Emissions</th>
              <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider" >
              Product</th>
              <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider" >
              Human Rights</th>
              <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider" >
              Compatibility</th>


  
          </tr>
        </thead>
        <tbody>
          {top_20.data.map((item, index) => {
            const isInPortfolio = data.find((pI) => pI.ticker === item.ticker);
            return (
            
            <tr key={item.ticker} 
            className={`hover:bg-gray-100 cursor-pointer ${selectedTicker === item.ticker ? 'bg-gray-100' : ''}`} onClick={() => openTableauDashboard(item.ticker)}
            title="Show more">
              <td className="py-1 px-2 border-b border-gray-300">{item.ticker}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.name}</td>
              <td className="py-1 px-2 border-b border-gray-300">{(item.annual_return * 100).toFixed(2)}%</td>
              <td className="py-1 px-2 border-b border-gray-300">{(item.sd * 100).toFixed(2)}%</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.esg.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.environment.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.social.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.governance.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.emissions.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.product_responsibility.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.human_rights.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.compatibility_score.toFixed(0)}%</td>
              <td onClick={(e) => {e.stopPropagation(); handleAddToPortfolio(item)}}>
              <button
            className={`px-1 rounded mr-2 ${isInPortfolio ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 text-white'}`}
            disabled={isInPortfolio}
          >
            {isInPortfolio ? '✓' : ' + '}
          </button>
                </td>
            </tr>
          )})}
        </tbody>
      </table>
      <button onClick={scrollToTop} className="fixed bottom-4 right-4 bg-green-700 text-white p-2 rounded-full shadow-lg">↑</button>
      </div>

))}
    </div>
  );
};

export default RankingFormResults;