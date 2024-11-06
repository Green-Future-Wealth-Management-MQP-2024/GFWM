import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useEffect } from "react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RankingFormResults = ({ results }) => {
  const investment_value =  10000 * ((1+ results.avg_return)**10 );
  const data = results.top_100;

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

  //SELECTED TICKER AND OPEN TABLEAU DASHBOARD
  const [selectedTicker, setSelectedTicker] = React.useState(null);

  useEffect(() => { 
    setSelectedTicker(null);
    }, [data]);

    const openTableauDashboard = (ticker) => {
      setSelectedTicker(ticker);

      const popup = window.open('', '_blank', 'width=1200,height=800');
      const embedCode = `
        <div class='tableauPlaceholder' id='viz1730415162190' style='position: relative'>
          <noscript>
            <a href='#'>
              <img alt='Dashboard 1 ' src='https://public.tableau.com/static/images/PC/PCFFZMD54/1_rss.png' style='border: none' />
            </a>
          </noscript>
          <object class='tableauViz' style='display:none;'>
            <param name='host_url' value='https%3A%2F%2Fpublic.tableau.com%2F' />
            <param name='embed_code_version' value='3' />
            <param name='path' value='shared/PCFFZMD54' />
            <param name='toolbar' value='yes' />
            <param name='static_image' value='https://public.tableau.com/static/images/PC/PCFFZMD54/1.png' />
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
          var divElement = document.getElementById('viz1730415162190');
          var vizElement = divElement.getElementsByTagName('object')[0];
          if (divElement.offsetWidth > 800) {
            vizElement.style.width='100%';
            vizElement.style.maxWidth='2250px';
            vizElement.style.height=(divElement.offsetWidth*0.75)+'px';
            vizElement.style.maxHeight='800px';
          } else if (divElement.offsetWidth > 500) {
            vizElement.style.width='100%';
            vizElement.style.maxWidth='2250px';
            vizElement.style.height=(divElement.offsetWidth*0.75)+'px';
            vizElement.style.maxHeight='1387px';
          } else {
            vizElement.style.width='100%';
            vizElement.style.height='3227px';
          }
          var scriptElement = document.createElement('script');
          scriptElement.src = 'https://public.tableau.com/javascripts/api/viz_v1.js';
          vizElement.parentNode.insertBefore(scriptElement, vizElement);
          
        </script>
      `;
      popup.document.open();
      popup.document.write(embedCode);
      popup.document.close();

    };
  

  return (
    <div className="ranking-form-results p-4 bg-white rounded-lg">
      <h2 className="text-xl font-bold mb-2">Results</h2>
      <div className="flex flex-wrap flex-col lg:flex-row lg:items-start ">
        <div className="flex-1 max-w-2xl" style={{ minWidth: '32rem' }}>


          <Bar data={AnnualReturnBar_chartData} options={AnnualReturnBar_Options} />
        </div>

        <div className="flex-1 min-w-72 max-w-sm ">
          <Bar data={sp500_return_data} options={sp500_return_options} />
        </div>
        <div className="ml-5 shrink grow min-w-72 max-w-5xl basis-0 ">
        
          <p className="pb-1">Average ESG Score: <span className="text-green-700 text-2xl font-bold">{results.avg_esg.toFixed(2)}</span></p>
          <p className="pb-1">Average Annual Return: <span className="text-green-700 text-2xl font-bold">{(results.avg_return * 100).toFixed(2)}%</span></p>
          <p className="pb-1">Average S&P Annual Return: <span className="text-green-700 text-2xl font-bold">10.35%</span></p>
          <p>Value of $10,000 invested 10 years ago: <span className="text-green-700 text-2xl font-bold">${investment_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
          <p className="pb-1">Volatility: <span className="text-green-700 text-2xl font-bold">{results.volatility.toFixed(2)}</span></p>
        </div>
      </div>

      <table className="min-w-full bg</table>-white mb-2 text-sm">
        <thead className="sticky top-0 bg-white </tr>z-10">
          <tr>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">Ticker</th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">Name</th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">Annualized Return</th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">Years in S&P Index</th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">Risk (0-100)</th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">ESG Score</th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">E Score</th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">S Score</th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">G Score</th>
            <th className="py-1 px-2 border-b-2 border-gray-300 text-left leading-4 text-gray-600 tracking-wider">Compatibility Score</th>

          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr ref={(el) => (rowRefs.current[item.ticker] = el)} key={item.ticker} 
            className={`hover:bg-gray-100 cursor-pointer ${selectedTicker === item.ticker ? 'bg-gray-100' : ''}`} onClick={() => openTableauDashboard(item.ticker)}>
              <td className="py-1 px-2 border-b border-gray-300">{item.ticker}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.name}</td>
              <td className="py-1 px-2 border-b border-gray-300">{(item.annual_return * 100).toFixed(2)}%</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.years_index}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.risk.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.esg.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.environment.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.social.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.governance.toFixed(2)}</td>
              <td className="py-1 px-2 border-b border-gray-300">{item.compatibility_score.toFixed(2)}</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RankingFormResults;