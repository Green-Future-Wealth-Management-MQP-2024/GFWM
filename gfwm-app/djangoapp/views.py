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
        client_responses = json.loads(request.body)
        
        # check that required factors are present
        required_factors = ["environment", "human_rights", "community", "workforce",
                            "product_responsibility", "shareholders", "management"]
        
        missing_keys = [key for key in required_factors + ['risk_appetite', 'flexibility'] if key not in client_responses.keys()]
        if len(missing_keys) > 0:
            return JsonResponse({"error": f"Missing keys: {missing_keys}"}, status=400)
        
        # prepare client responses for filtering and markowitz
        
        esg_preferences = {}
        esg_flexibility = 0
        target_volatility = 0.07
        
        for(key, response) in client_responses.items():
            print(key, response)
            
            if key in required_factors:
                
                match response:
                    case "1" | "2":
                        esg_preferences[key] = 0
                    case "3":
                        esg_preferences[key] = 5
                    case "4" | "5":
                        esg_preferences[key] = 10
                    case _:
                        esg_preferences[key] = 5 #default to mid importance
            
            #key is either risk_appetite or flexibility
            
            elif key == 'risk_appetite':
                match response:
                    case "1" | "2":
                        target_volatility = 0.04
                    case "3":
                        target_volatility = 0.07
                    case "4" | "5":
                        target_volatility = 0.01
                    case _:
                        target_volatility = 0.07 #default
            
            elif key == 'flexbility':
                match response:
                    case "1":
                        esg_flexibility = 0
                    case "2":
                        esg_flexibility = 5
                    case "3":
                        esg_flexibility = 10
                    case "4":
                        esg_flexibility = 15
                    case "5":
                        esg_flexibility = 20
                    case _:
                        esg_flexibility = 0 #default
        
        primary_results, secondary_results = filter_stocks(esg_preferences, flexibility=esg_flexibility)
        
        
        primary_tickers = primary_results['ticker']
        
        # calculate best fit portfolio for the client
        ideal_portfolio_weights, expected_return, sharpe = calculate_portfolio(primary_tickers, target_volatility)
        
        #columns of ideal_portfolio: ticker, controversy, environment, social, governance,
        # human_rights, workforce, product_responsibility, shareholders, community
        
        # previous version of filter_stocks
        #results = filter_stocks(client_responses_parsed["environment"], client_responses_parsed["humanRights"], client_responses_parsed["employeeSatisfaction"], client_responses_parsed["productResponsibility"], client_responses_parsed["governance"], client_responses_parsed["community"], client_responses_parsed["bestPractices"], client_responses_parsed["risk"], client_responses_parsed["flexibility"])
        
        
        #calculate summary statistics   
        
        summary_statistics = {
            "average_esg_score": primary_results[['environment', 'social', 'governance']].to_numpy().mean(),
            "average_sp500_return": 13.45,
            "expected_return": expected_return,
            "growth_of_10k_10_years": 1e4 * (1 + expected_return) ** 10,
            "sharpe": sharpe
        }
        
        primary_results['weight'] = ideal_portfolio_weights * 100
        
        
        #package data into a dict of dicts for JsonResponse
        
        # this requires serializing the secondary dict of dataframes:
        serial_secondary_results = {factor: df.to_dict(orient = 'records') for factor, df in secondary_results.items()}
        
        return JsonResponse({
            'portfolio': primary_results.to_dict(orient='records'),
            'summary_statistics': summary_statistics,
            'secondary': serial_secondary_results
            })

    return JsonResponse({"error": "Invalid request method."}, status=401)