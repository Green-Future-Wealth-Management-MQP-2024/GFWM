import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useEffect, useState } from "react";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RankingFormResults = ({results}) => {

  /* on the python side:
    return JsonResponse({
            'portfolio': primary_results.to_dict(orient='records'),
            'summary_statistics': summary_statistics,
            'secondary': serial_secondary_results
    })
  */
  
  //portolio is a dataframe with columns: ticker, esg_combined, controversy, environment, social, governance,
 //                                       human_rights, community, workforce, product_responsibility, shareholders, management, 
//                                        name, mean_return, volatility, weight, compatibility
  //summary_statistics contains "average_esg_score", "portfolio_average_return",
  //                             "sp500_average_return", "growth_of_10k_10_years", 
  //                             "portfolio_volatility", "sharpe"
  
  //unpack results object

  const { portfolio_data, summary_statistics, secondary_data } = results;

  const{average_esg_score, portfolio_average_return, sp500_average_return,
    growth_of_10k_10_years, portfolio_volatility, portfolio_sharpe} = summary_statistics


  //results = results[0] || {};
  const [sortConfig, setSortConfig] = useState({ key: 'compatibility', direction: 'descending' });
  
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


  //SELECTED TICKER AND OPEN TABLEAU DASHBOARD
  const [selectedTicker, setSelectedTicker] = React.useState(null);

  useEffect(() => { 
    setSelectedTicker(null);
    }, [portfolio_data]);

  const openTableauDashboard = (ticker) => {
      setSelectedTicker(ticker);

      const popup = window.open('', '_blank', 'width=1800,height=1000');
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
          <param name='name' value='IndividualStock3_0/Dashboard1' />
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
          vizElement.style.height = '1000px';
        
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

    //TODO ADD REMOVE
    const handleAddToPortfolio = (ticker) => {

    };
  
    const handleRemoveFromPortfolio = (ticker) => {
    };

  const formatFactor = (factor) => {
      return factor
        .split('_') // Split by underscores, resulting in an array of words
        .map(word =>
          word.charAt(0).toUpperCase() + word.slice(1) // Capitalize the first letter of each word
        )
        .join(' '); // Join the array back into a single string
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
        
          <p className="pb-1">Portfolio ESG Score: <span className="text-green-700 text-2xl font-bold">{average_esg_score.toFixed(2)}</span></p>
          <p className="pb-1">Portfolio Annual Return: <span className="text-green-700 text-2xl font-bold">{(portfolio_average_return * 100).toFixed(2)}%</span></p>
          <p className="pb-1">S&P 500 Annual Return: <span className="text-green-700 text-2xl font-bold">{(sp500_average_return *100).toFixed(2)}%</span></p>
          <p className="pb-1">Value of $10,000 invested in portfolio 10 years ago: <span className="text-green-700 text-2xl font-bold">${growth_of_10k_10_years.toFixed(2)}</span></p>
          <p className="pb-1">Portfolio SD/Volatility: <span className="text-green-700 text-2xl font-bold">{(portfolio_volatility * 100).toFixed(2)}%</span></p>
          <p className="pb-1">Portfolio Sharpe Ratio: <span className="text-green-700 text-2xl font-bold">{portfolio_sharpe.toFixed(2)}</span></p>
          <p className="pb-1">Portfolio Size: <span className="text-green-700 text-2xl font-bold">{sorted_portfolio_data.length} stocks</span></p>
          
        </div>
      </div>
<div className="relative">
      <table className="min-w-full bg-white mb-2 text-sm">
        <thead className="sticky top-0 bg-white </tr>z-10">
        <tr title="Sort data">
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer" onClick={() => requestSort('ticker')}>
              Ticker {sortConfig.key === 'ticker' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
            </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer" onClick={() => requestSort('name')}>
              Name {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
            </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer" onClick={() => requestSort('mean_return')}>
              Annualized Return {sortConfig.key === 'mean_return' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
            </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer" onClick={() => requestSort('volatility')}>
              Volatility {sortConfig.key === 'volatility' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
            </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer" onClick={() => requestSort('esg_combined')}>
              Combined ESG {sortConfig.key === 'esg_combined' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
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
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer" onClick={() => requestSort('compatibility')}>
              Compatibility {sortConfig.key === 'compatibility' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
            </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider cursor-pointer" onClick={() => requestSort('weight')}>
              Weight {sortConfig.key === 'weight' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
            </th>
  
          </tr>
        </thead>
        <tbody>
          {sorted_portfolio_data.map((item, index) => (
            <tr ref={(el) => (rowRefs.current[item.ticker] = el)} key={item.ticker} 
            className={`hover:bg-gray-100 cursor-pointer ${selectedTicker === item.ticker ? 'bg-gray-100' : ''}`} onClick={() => openTableauDashboard(item.ticker)}
            title="Show more">
              <td className="py-1 px-2 border-b border-gray-300">{item.ticker}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.name}</td>
              <td className="py-1 px-2 border-b border-gray-300">{(item.mean_return * 100).toFixed(2)}%</td>
              <td className="py-1 px-2 border-b border-gray-300">{(item.volatility * 100).toFixed(2)}%</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.esg_combined.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.environment.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.social.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.governance.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.compatibility}</td>
              <td className="py-1 px-2 border-b border-gray-300">{(item.weight * 100).toFixed(2)}%</td>
              <td className="py-1 px-2 border-b border-gray-300"> 
                <button onClick={() => handleRemoveFromPortfolio(item.ticker)} className="bg-red-500 text-white px-1 rounded">X</button>
                </td>

            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={scrollToTop} className="fixed bottom-4 right-4 bg-green-700 text-white p-2 rounded-full shadow-lg">↑</button>
      </div>
{Object.entries(secondary_data).map(([factor, data]) => (
      <div className="relative">
      <h2 className="text-xl font-bold mb-2">Top {formatFactor(factor)} Stocks</h2>
      <table className="min-w-full bg-white mb-2 text-sm">
        <thead className="sticky top-0 bg-white </tr>z-10">
        <tr>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">
              Ticker
            </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider ">
              Name 
            </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider ">
              Annualized Return</th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider ">
              Volatility</th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">
              Combined ESG
            </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider " >
              Environment
            </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider " >
              Social
            </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider" >
              Governance
            </th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider" >
              Compatibility
            </th>
  
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.ticker} 
            className={`hover:bg-gray-100 cursor-pointer ${selectedTicker === item.ticker ? 'bg-gray-100' : ''}`} onClick={() => openTableauDashboard(item.ticker)}
            title="Show more">
              <td className="py-1 px-2 border-b border-gray-300">{item.ticker}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.name}</td>
              <td className="py-1 px-2 border-b border-gray-300">{(item.mean_return * 100).toFixed(2)}%</td>
              <td className="py-1 px-2 border-b border-gray-300">{(item.volatility * 100).toFixed(2)}%</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.esg_combined.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.environment.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.social.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.governance.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.compatibility}</td>
              <td><button onClick={() => handleAddToPortfolio(item)} className="bg-green-500 text-white px-1 rounded mr-2">+</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

))}
    </div>
  );
};

export default RankingFormResults;