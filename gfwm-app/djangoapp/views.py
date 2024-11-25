
from django.http import JsonResponse
from .models import SurveyResponse
from django.views.decorators.csrf import csrf_exempt
import json

from data_science.stock_filter import filter_stocks
from data_science.quant.portfolio_calculator import calculate_portfolio, ANNUAL_RISK_FREE_RATE

from data_science.quant.portfolio_history import portfolio_history

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
        target_volatility = client_responses['risk_appetite']
        
        use_markowitz = (client_responses['weighing_scheme'] == 'Markowitz Optimized')
        
        # filter stocks using client responses
        # df with two columns: ticker, compatibility
        filter_results = filter_stocks(user_preferences= esg_preferences, flexibility= esg_flexibility)
        
        # this value determines how many stocks to include in portfolio
        portfolio = filter_results.head(100).copy()
        
        # calculate best fit portfolio for the client
        ideal_portfolio_weights, expected_return, expected_volatility, sharpe = calculate_portfolio(portfolio[['ticker', 'compatibility']], 
                                                                                                    target_volatility,
                                                                                                    use_markowitz)
        
        portfolio['weight'] = ideal_portfolio_weights
        
        spy_timeseries, portfolio_timeseries, dates, spy_max_dd, portfolio_max_dd = portfolio_history(portfolio[['ticker',
                                                                                                                 'weight']]
                                                                                                      .set_index('ticker', drop = True))
        
        #calculate summary statistics        
        summary_statistics = {
            "portfolio_esg_score": portfolio[['environment', 'social', 'governance']].to_numpy().mean(),
            
            "portfolio_average_return": expected_return,
            "growth_of_10k_10_years": 1e4 * (1 + expected_return) ** 10,
            
            "portfolio_volatility": expected_volatility,
            "portfolio_sharpe": sharpe,
            
            "sp500_average_return": 0.1345,
            "sp500_average_volatility": 0.156,
            "sp500_sharpe": (0.1345 - ANNUAL_RISK_FREE_RATE) / 0.156,
            
            "spy_max_dd": spy_max_dd,
            "portfolio_max_dd": portfolio_max_dd,
            
            "spy_timeseries": spy_timeseries,
            "portfolio_timeseries": portfolio_timeseries,
            "timeseries_dates": dates,
            
            "portfolio_weighing_scheme": use_markowitz
        }
        
        #package data into a dict of dicts for JsonResponse
    
        return JsonResponse({
            'sp500_compatibility': filter_results.set_index('ticker')['compatibility'].to_dict(),
            'portfolio': portfolio.set_index('ticker')['weight'].to_dict(),
            'summary_statistics': summary_statistics
            })

    return JsonResponse({"error": "Invalid request method."}, status=401)