from django.shortcuts import render
from django.http import JsonResponse
from .models import SurveyResponse
from django.views.decorators.csrf import csrf_exempt
import json

from data_science.stock_filter import filter_stocks
from data_science.quant.portfolio_calculator import calculate_portfolio

@csrf_exempt
def hello_api(request):
    return JsonResponse({"message": f"Hello from the Django API! {request}"})

# TODO modify cases to accept drag and drop responses
def handle_client_response_string(response: str):
    match response:
        case "1" | "2":
            return 0
        case "3":
            return 5
        case "4" | "5":
            return 10
        case _:
            return 5

@csrf_exempt
def submit_form(request):
    if request.method == "POST":
        
        # build dict of client responses
        client_responses = json.loads(request.body)
        
        # check that required factors are present
        required_factors = ["environment", "human_rights", "community", "workforce",
                            "product_responsibility", "shareholders", "management"]
        
        missing_keys = [key for key in required_factors + ['risk_appetite', 'flexibility'] if key not in client_responses.keys()]
        if len(missing_keys) > 0:
            return JsonResponse({"error": f"Missing keys: {missing_keys}"}, status=400)
        
        # prepare client responses for filtering and markowitz
        
        esg_preferences = {key: value for (key, value) in client_responses.items() if key in required_factors}
        esg_flexibility = client_responses['flexibility']
        target_volatility = client_responses['risk_appetite']
        
        use_markowitz = (client_responses['weighing_scheme'] == 'Markowitz Optimized')
        
        # filter stocks using client responses
        
        primary_results, secondary_results = filter_stocks(esg_preferences, flexibility=esg_flexibility)
        
        primary_tickers = primary_results['ticker']
        
        print(primary_tickers)
        
        # calculate best fit portfolio for the client
        ideal_portfolio_weights, expected_return, expected_volatility, sharpe = calculate_portfolio(primary_tickers, target_volatility, 
                                                                               use_markowitz=use_markowitz)
        

        #calculate summary statistics   
        
        summary_statistics = {
            "average_esg_score": primary_results[['environment', 'social', 'governance']].to_numpy().mean(),
            
            "portfolio_average_return": expected_return,
            "sp500_average_return": 0.1345,
            "growth_of_10k_10_years": 1e4 * (1 + expected_return) ** 10,
            
            "portfolio_volatility": expected_volatility,
            "portfolio_sharpe": sharpe,
            
            "portfolio_weighing_scheme": use_markowitz
        }
        
        primary_results['weight'] = ideal_portfolio_weights
        
        
        #package data into a dict of dicts for JsonResponse
        
        # this requires serializing the secondary dict of dataframes:
        serial_secondary_results = {factor: df.to_dict(orient = 'records') for factor, df in secondary_results.items()}
        
        return JsonResponse({
            'portfolio_data': primary_results.to_dict(orient='records'),
            'summary_statistics': summary_statistics,
            'secondary_data': serial_secondary_results
            })

    return JsonResponse({"error": "Invalid request method."}, status=401)