from django.shortcuts import render
from django.http import JsonResponse
from .models import SurveyResponse
import pandas as pd
from django.views.decorators.csrf import csrf_exempt
import json

from data_science.stock_filter import filter_stocks

# Set pandas options to display all rows and columns without truncation
pd.set_option('display.max_rows', None)
pd.set_option('display.max_columns', None)
pd.set_option('display.max_colwidth', None)
pd.set_option('display.expand_frame_repr', False)

# Load your data here
data = pd.read_csv("data_science/preprocess.csv")

@csrf_exempt
def hello_api(request):
    return JsonResponse({"message": f"Hello from the Django API! {request}"})

@csrf_exempt
def submit_form(request):
    if request.method == "POST":
        client_responses = json.loads(request.body)
        # print(client_responses)
        # Parse form data
        client_responses_parsed = {key: int(value) for key, value in client_responses.items()}

        print(client_responses_parsed)

        # Check for required keys
        required_keys = ['fossilFuels', 'environment', 'weapons', 'social', 'governance']
        for key in required_keys:
            if key not in client_responses_parsed:
                return JsonResponse({"error": f"Missing key: {key}"}, status=400)

        # Calculate ESG values
        environmental = (client_responses_parsed['fossilFuels'] + client_responses_parsed['environment']) / 2
        social = (client_responses_parsed['weapons'] + client_responses_parsed['social']) / 2
        governance = client_responses_parsed['governance']

        # Save to database
        response = SurveyResponse(environmental=environmental, social=social, governance=governance)
        response.save()

        # Imported function from data science modules
        filtered_stocks = filter_stocks(environmental, social, governance)
        #returns ['Symbol', 'Name', 'Annual Return', 'Growth Estimate', 'Volatility',  'Final Score']

        json_result = []

        for _, row in filtered_stocks.iterrows():
            row_object = {
                "symbol": row['Symbol'].strip(),
                "name": row['Name'].strip(),
                "annual_return": row['Annual Return'],
                "growth_estimate": row['Growth Estimate'],
                "volatility": row['Volatility'],
                "score": row['Final Score']
            }
            json_result.append(row_object)

        return JsonResponse(json_result, safe=False)

    return JsonResponse({"error": "Invalid request method."}, status=401)
    # User responses to the questionnaire
    user_preferences = {
        'Environmental': environmental,
        'Social': social,
        'Governance': governance
    }

    # Normalizes user preferences (so they sum to 1)
    total_weight = sum(user_preferences.values())
    weights = {key: value / total_weight for key, value in user_preferences.items()}

    # Function to calculate ESG weight multiplier based on user preference
    def calculate_esg_weight_multiplier(user_preference):
        if user_preference == 3:
            return 0
        else:
            return user_preference - 2 

    # Calculates the weights for each category
    esg_weight_multipliers = {
        'Environmental': calculate_esg_weight_multiplier(user_preferences['Environmental']),
        'Social': calculate_esg_weight_multiplier(user_preferences['Social']),
        'Governance': calculate_esg_weight_multiplier(user_preferences['Governance'])
    }

    # Calculates a weighted ESG risk score for each company
    data['Weighted ESG Risk Score'] = (
        data['Environment Risk Score'] * weights['Environmental'] * esg_weight_multipliers['Environmental'] +
        data['Social Risk Score'] * weights['Social'] * esg_weight_multipliers['Social'] +
        data['Governance Risk Score'] * weights['Governance'] * esg_weight_multipliers['Governance']
    )

    # Calculates a final score
    data['Final Score'] = (data['Growth Estimate (+5 years)'] * 10) - (data['Weighted ESG Risk Score'])

    # Sorts the companies by the final score
    sorted_data = data.sort_values(by='Final Score', ascending=False)

    return sorted_data[['Symbol', 'Name', 'Growth Estimate (+5 years)', 'Final Score']].head(20)