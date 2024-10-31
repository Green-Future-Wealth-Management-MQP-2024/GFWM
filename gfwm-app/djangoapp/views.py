from django.shortcuts import render
from django.http import JsonResponse
from .models import SurveyResponse
import pandas as pd
from django.views.decorators.csrf import csrf_exempt
import json

from data_science.stock_filter import filter_stocks

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

        #print(client_responses_parsed)

        # Check for required keys
        required_keys = ["environment", "humanRights", "employeeSatisfaction", "productResponsibility", "governance", "community", "bestPractices", "risk"]
        for key in required_keys:
            if key not in client_responses_parsed:
                return JsonResponse({"error": f"Missing key: {key}"}, status=400)

        # Save to database
        # response = SurveyResponse(environmental=environmental, social=social, governance=governance)
        # response.save()

        # Imported function from data science modules
        # results = filter_stocks(client_responses_parsed["environment"], client_responses_parsed["humanRights"], client_responses_parsed["employeeSatisfaction"], client_responses_parsed["productResponsibility"], client_responses_parsed["governance"], client_responses_parsed["community"], client_responses_parsed["bestPractices"], client_responses_parsed["risk"])
        results = filter_stocks(3,3,3)
        
        #print(results)
        
        return JsonResponse(results, safe=False)

    return JsonResponse({"error": "Invalid request method."}, status=401)