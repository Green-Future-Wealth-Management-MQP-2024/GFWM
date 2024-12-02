import pandas as pd
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

from data_science.stock_filter import filter_stocks
from data_science.quant.portfolio_calculator import calculate_portfolio, ANNUAL_RISK_FREE_RATE, portfolio_history, calculate_summary_statistics

@csrf_exempt
def hello_api(request):
    return JsonResponse({"message": f"Hello from the Django API! {request}"})

@csrf_exempt
def submit_form(request):
    if request.method == "POST":
        
        # build dict of client responses
        client_responses = json.loads(request.body)
        
        # check that required factors are present
        required_factors = ["environment", "human_rights", "community", "workforce",
                            "product_responsibility", "shareholders", "management"]
        
        avoid_factors = ['avoid_fossil_fuels', 'avoid_weapons']
        
        missing_keys = [key for key in required_factors + avoid_factors + ['flexibility', 'risk_appetite']
                        if key not in client_responses.keys()]
        if len(missing_keys) > 0:
            return JsonResponse({"error": f"Missing keys: {missing_keys}"}, status=400)
        
        # prepare client responses for filtering and markowitz
        
        # drag and drop factors
        esg_preferences = {key: value for (key, value) in client_responses.items() if key in required_factors}
        
        # avoid factors (checkbox)
        for avoid_factor in avoid_factors:
            esg_preferences[avoid_factor] = client_responses[avoid_factor]
        
        esg_flexibility = client_responses['flexibility']
        # map risk appetite (0 - 0.2) to cash percent (50% - 10%)
        cash_percent = 0.5 - 2 * client_responses['risk_appetite']
        
        use_markowitz = (client_responses['weighing_scheme'] == 'Markowitz Optimized')
        
        # filter stocks using client responses
        # df with two columns: ticker, compatibility
        filter_results = filter_stocks(user_preferences= esg_preferences, flexibility= esg_flexibility)
        
        # this value determines how many stocks to include in portfolio
        portfolio = filter_results.head(100).copy()
        
        # calculate best fit portfolio for the client
        ideal_portfolio_weights = calculate_portfolio(portfolio[['ticker', 'compatibility']], 
                                                                                                    cash_percent,
                                                                                                    use_markowitz,
                                                                                                    return_summary_statistics=False)
        
        portfolio['weight'] = ideal_portfolio_weights
        
        spy_timeseries, portfolio_timeseries, dates, spy_max_dd, portfolio_max_dd = portfolio_history(portfolio[['ticker',
                                                                                                                 'weight']]
                                                                                                      .set_index('ticker', drop = True))
        
        #calculate summary statistics  
        
        portfolio_return, portfolio_volatility, portfolio_sharpe = calculate_summary_statistics(portfolio_timeseries, return_as_range=False)
        spy_return, spy_volatility, spy_sharpe = calculate_summary_statistics(spy_timeseries, return_as_range=False)
           
        summary_statistics = {
            "portfolio_esg_score": portfolio[['environment', 'social', 'governance']].to_numpy().mean(),
            
            "portfolio_average_return": portfolio_return,
            
            "portfolio_volatility": portfolio_volatility,
            "portfolio_sharpe": portfolio_sharpe,
            
            "sp500_average_return": spy_return,
            "sp500_average_volatility": spy_volatility,
            "sp500_sharpe": spy_sharpe,
            
            "spy_max_dd": spy_max_dd,
            "portfolio_max_dd": portfolio_max_dd,
            
            # save memory by only returning / graphing every 5th datapoint
            "spy_timeseries": spy_timeseries[::5],
            "portfolio_timeseries": portfolio_timeseries[::5],
            "timeseries_dates": dates[::5],
            
            "portfolio_weighing_scheme": use_markowitz
        }
        
        #package data into a dict of dicts for JsonResponse
    
        return JsonResponse({
            'sp500_compatibility': filter_results.set_index('ticker')['compatibility'].to_dict(),
            'portfolio': portfolio.set_index('ticker')['weight'].to_dict(),
            'summary_statistics': summary_statistics
            })

    return JsonResponse({"error": "Invalid request method."}, status=401)

@csrf_exempt
def update_weights(request):
    if request.method == "POST":
        
        # dict of request body:
        # tickers, risk_appetite, weighing_scheme
        update_request_dict = json.loads(request.body)
        
        # TODO update to process ticker and compatibility columns
        client_portfolio = pd.DataFrame(update_request_dict['client_portfolio'])
        
        # map risk appetite (0 - 0.2) to cash percent (50% - 10%)
        cash_percent = 0.5 - 2 * update_request_dict['risk_appetite']
        
        use_markowitz = (update_request_dict['weighing_scheme'] == 'Markowitz Optimized')
        
        # calculate best fit portfolio for the client
        ideal_portfolio_weights = calculate_portfolio(client_portfolio[['ticker', 'compatibility']],
                                                      cash_percent=cash_percent,
                                                      use_markowitz=use_markowitz,
                                                      return_summary_statistics=False)
        
        client_portfolio['weight'] = ideal_portfolio_weights
        
        portfolio_timeseries, dates, portfolio_max_dd = portfolio_history(client_portfolio[['ticker','weight']].set_index('ticker', drop = True),
                                                                          include_spy=False)
        
        #calculate summary statistics   
        
        portfolio_return, portfolio_volatility, portfolio_sharpe = calculate_summary_statistics(portfolio_timeseries, return_as_range=False)
        
             
        summary_statistics = {            
            "portfolio_average_return": portfolio_return,
            
            "portfolio_volatility": portfolio_volatility,
            "portfolio_sharpe": portfolio_sharpe,
            
            "portfolio_max_dd": portfolio_max_dd,
            
            "portfolio_timeseries": portfolio_timeseries[::5],
            "timeseries_dates": dates[::5],
            
            "portfolio_weighing_scheme": use_markowitz
        }
        
        # return format for updated_portfolio: {ticker: weight, ticker: weight etc}
        return JsonResponse({
            "updated_portfolio": client_portfolio[['ticker','weight']].set_index('ticker', drop = True)['weight'].to_dict(),
            "updated_summary_statistics": summary_statistics
        })
    
    return JsonResponse({"error": "Invalid request method."}, status=401)