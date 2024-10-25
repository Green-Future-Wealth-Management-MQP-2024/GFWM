import pandas as pd

def filter_stocks(environmental, social, governance):

    data = pd.read_csv("data_science/preprocessed.csv")

    # User responses to the questionnaire 
    user_preferences = {
        'environmental': environmental,  # Based on Question 1 and 3
        'social': social,         # Based on Question 2 and 4
        'governance': governance      # Based on Question 5
    }

    # Function to calculate ESG weight multiplier based on user preference
    # https://www.desmos.com/calculator/qiajcvxolv
    def weight_multiplier(user_preference):
        return (1.325 * user_preference) - 1.325 

    # Calculates a weighted ESG risk score for each company based on user responses to questionnaire
    # range: [0, 100*16.5]
    weighted_esg_risk_score = (
        data['environment'] * weight_multiplier(user_preferences['environmental']) +
        data['social'] * weight_multiplier(user_preferences['social']) +
        data['governance'] * weight_multiplier(user_preferences['governance'])
    )
    
    # this makes it the combined esg score is [0, 16.5]
    data['combined esg'] = weighted_esg_risk_score / 100 * data["controversy"] / 100

    # Calculates a compatibility score based off esg, annual returns, and volatility
    data['compatibility_score'] = data['combined esg'] + 5 * data['annual_return'] - 1 * data["sd"]

    # Sorts the companies by the final score 
    sorted_data = data.sort_values(by='compatibility_score', ascending=False)

    # Shows the top companies that match user preferences
    # TODO clear up output
    # idea: print symbol, name, portfolio weight, past return, past risk
    return(sorted_data[['ticker', 'name', 'annual_return', 'sd',  'compatibility_score']].head(50))

