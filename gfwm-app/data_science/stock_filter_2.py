import pandas as pd

def filter_stocks(environment, humanRights, employeeSatisfaction, productResponsibility, governance, community, bestPractices, risk, flexibility):

    averaged_data = pd.read_csv("data_science/preprocessed.csv")


    # User responses to the questionnaire 
    user_preferences = {
        'How important is environmental protection to you': environment,  # Question 1
        'How important are human rights protection to you': humanRights,   # Question 2
        'How important is employee satisfaction': employeeSatisfaction,     # Question 3
        'How important is product responsibility (Data privacy, Responsible Marketing, Product Quality)': productResponsibility,    # Question 4
        'How important is shareholder satisfaction': governance,  # Question 5
        'How important is a high community score (Respecting business ethics, protecting public health, and being a good citizen)': community,           # Question 6
        'How important is best practices and corporate governance to you': bestPractices,       # Question 7
        'What is the risk you are willing to take': risk,       # Question 8
        'How flexible are you with your preferences in stocks': flexibility   # Question 9
    }

        # Mapping user preferences 
    preference_to_column_mapping = {
        'How important is environmental protection to you': 'Environment Pillar Score',
        'How important are human rights protection to you': 'Human Rights Score',
        'How important is employee satisfaction': 'Workforce Score',
        'How important is product responsibility (Data privacy, Responsible Marketing, Product Quality)': 'Product Responsibility Score',
        'How important is shareholder satisfaction': 'Shareholders Score',
        'How important is a high community score (Respecting business ethics, protecting public health, and being a good citizen)': 'Community Score',
        'How important is best practices and corporate governance to you': 'Governance Pillar Score'
    }
    # Calculate weights based on user preferences
    total_importance = sum(user_preferences[key] for key in user_preferences if key in preference_to_column_mapping)
    weights = {key: user_preferences[key] / total_importance for key in user_preferences if key in preference_to_column_mapping}

    # Calculate compatibility score
    averaged_data['compatibility_score'] = sum(
        weights[key] * averaged_data[preference_to_column_mapping[key]] for key in weights
    )
    
        # Filtering based on user preferences
    flexibility = user_preferences['How flexible are you with your preferences in stocks']
    for key, value in user_preferences.items():
        if key in ['How flexible are you with your preferences in stocks', 'What is the risk you are willing to take']:
            continue
        column = preference_to_column_mapping.get(key)
        if value == 1:
            continue 
        elif value == 2:
            threshold = averaged_data[column].quantile(0.25 - 0.05 * (flexibility - 1))
        elif value == 3:
            threshold = averaged_data[column].quantile(0.50 - 0.05 * (flexibility - 1))
        elif value == 4:
            threshold = averaged_data[column].quantile(0.70 - 0.05 * (flexibility - 1))
        elif value == 5:
            threshold = averaged_data[column].quantile(0.90 - 0.05 * (flexibility - 1))
        averaged_data = averaged_data[averaged_data[column] >= threshold]

    # Filtering on risk question
    risk_preference = user_preferences['What is the risk you are willing to take']
    if risk_preference >= 1:
        risk_threshold = averaged_data['Standard Deviation'].quantile(min(1, 0.20 * risk_preference)) #take a look 
        averaged_data = averaged_data[averaged_data['Standard Deviation'] <= risk_threshold]

    # Top stocks based on Predicted Total Returns
    # Top stocks based on Predicted Total Returns
    top_100_stocks = averaged_data.groupby('Symbol').agg({
        'Total Returns': 'mean',
        'Name': 'first',
        'Year': 'first',
        'ESG Score': 'mean',
        'ESG Controversies Score': 'mean',
        'Environment Pillar Score': 'mean',
        'Social Pillar Score': 'mean',
        'Governance Pillar Score': 'mean',
        'Standard Deviation': 'mean',
        'compatibility_score': 'mean'
    }).nlargest(100, 'compatibility_score').reset_index()

    top_100_stocks['Predicted Total Returns'] = top_100_stocks['Total Returns'] * 10
    top_100_stocks['Predicted Total Returns'] = top_100_stocks['Predicted Total Returns'].apply(lambda x: f"{x:.2f}%")

    top_100_stocks = top_100_stocks.rename(columns={"Name": "name",
                            "Symbol": "ticker",
                            "Year": "years_index",
                            "ESG Score": "esg",
                            "ESG Controversies Score": "controversy",
                            "Environment Pillar Score": "environment",
                            "Social Pillar Score": "social",
                            "Governance Pillar Score": "governance",
                            "Total Returns": "annual_return",
                            "Standard Deviation": "sd",
                    })
    
    # Average ESG Score for the top 100 companies
    avg_esg = top_100_stocks['esg'].mean()

    # Average Annual Return for the top 100 companies
    avg_return = top_100_stocks['annual_return'].mean()

    volatility = top_100_stocks['sd'].mean()

    result = {
        'top_100': top_100_stocks[['ticker', 'name', 'annual_return', 'years_index', 'sd', 'compatibility_score', 'esg', 'environment', 'social', 'governance']].to_dict(orient='records'),
        'avg_esg': avg_esg,
        'avg_return': avg_return,
        'volatility': volatility
    }

    return(result)

