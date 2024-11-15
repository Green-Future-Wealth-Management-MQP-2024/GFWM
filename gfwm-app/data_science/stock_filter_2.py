import pandas as pd
def filter_stocks(environment, humanRights, employeeSatisfaction, productResponsibility, governance, community, bestPractices, risk, flexibility):
    averaged_data = pd.read_csv('data_science/preprocessed.csv')
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
    # Calculate base weights based on preferences
    total_importance = sum(user_preferences[key] for key in preference_to_column_mapping)
    weights = {key: user_preferences[key] / total_importance for key in preference_to_column_mapping}
    # Adjust weights based on flexibility (higher flexibility reduces preference strictness)
    flexibility_adjustment = 1 - (0.05 * (5 - flexibility))  # Flexibility scales from 0.95 to 1.00
    adjusted_weights = {key: weight * flexibility_adjustment for key, weight in weights.items()}
    # Compatibility score calculation with penalties for deviation
    for index, row in averaged_data.iterrows():
        score = 100  # Start with a perfect score
        for key, value in user_preferences.items():
            if key in ['How flexible are you with your preferences in stocks', 'What is the risk you are willing to take']:
                continue
            column = preference_to_column_mapping.get(key)
            if value == 1:
                continue  # Skip this preference as it is not important
            elif value == 2:
                threshold = averaged_data[column].quantile(0.25 - 0.05 * (flexibility - 1))
            elif value == 3:
                threshold = averaged_data[column].quantile(0.50 - 0.05 * (flexibility - 1))
            elif value == 4:
                threshold = averaged_data[column].quantile(0.70 - 0.05 * (flexibility - 1))
            elif value == 5:
                threshold = averaged_data[column].quantile(0.90 - 0.05 * (flexibility - 1))
            # Calculate deviation from the threshold
            deviation = max(0, threshold - row[column])  # No penalty if above the threshold
            penalty = (deviation / threshold) * 100  # Normalize deviation as a percentage of the threshold
            score -= penalty  # Subtract penalty from the score
        # Adjust score for risk preference
        risk_weight = 0.20 * user_preferences['What is the risk you are willing to take']  # Maps 1-5 to risk quantile levels
        risk_threshold = averaged_data['Standard Deviation'].quantile(risk_weight)
        risk_penalty = (row['Standard Deviation'] / risk_threshold) * 100 if row['Standard Deviation'] > risk_threshold else 0
        score -= risk_penalty
        # Ensure score doesn't go below 0
        score = max(0, score)
        # Update compatibility_score for the row
        averaged_data.at[index, 'compatibility_score'] = score
    # Grouped Data
    df_grouped = averaged_data.groupby('Symbol').agg({
        'Emissions Score': 'mean',
        'Governance Pillar Score': 'mean',
        'Product Responsibility Score': 'mean',
        'Social Pillar Score': 'mean',
        'Human Rights Score': 'mean',
        'Total Returns': 'mean',
        'Name': 'first',
        'ESG Score': 'mean',
        'ESG Controversies Score': 'mean',
        'Environment Pillar Score': 'mean',
        'Social Pillar Score': 'mean',
        'Governance Pillar Score': 'mean',
        'Standard Deviation': 'mean',
        'compatibility_score': 'mean'
    }).reset_index()
    # Top stocks based on compatibility score
    top_100_stocks = df_grouped.nlargest(100, 'compatibility_score').reset_index()
    # Rename columns for output
    top_100_stocks = top_100_stocks.rename(columns={
        "Name": "name",
        "Symbol": "ticker",
        "ESG Score": "esg",
        "ESG Controversies Score": "controversy",
        "Environment Pillar Score": "environment",
        "Social Pillar Score": "social",
        "Governance Pillar Score": "governance",
        "Total Returns": "annual_return",
        "Standard Deviation": "sd"
    })
    df_grouped = df_grouped.rename(columns={"Name": "name",
                                "Symbol": "ticker",
                                "Name": "name",
                                "ESG Score": "esg",
                                "ESG Controversies Score": "controversy",
                                "Environment Pillar Score": "environment",
                                "Social Pillar Score": "social",
                                "Governance Pillar Score": "governance",
                                "Total Returns": "annual_return",
                                "Standard Deviation": "sd",
                                "Emissions Score": "emissions",
                                "Product Responsibility Score": "product_responsibility",
                                "Human Rights Score": "human_rights",
                        })
    # Top 20 stocks
    top_20_stocks_enviroment = df_grouped.sort_values(by='environment', ascending=False).head(20)
    top_20_stocks_emissions = df_grouped.sort_values(by='emissions', ascending=False).head(20)
    top_20_stocks_gov = df_grouped.sort_values(by='governance', ascending=False).head(20)
    top_20_stocks_product = df_grouped.sort_values(by='product_responsibility', ascending=False).head(20)
    top_20_stocks_social = df_grouped.sort_values(by='social', ascending=False).head(20)
    top_20_stocks_human = df_grouped.sort_values(by='human_rights', ascending=False).head(20)
    result = {
        'top_100': top_100_stocks[['ticker', 'name' , 'annual_return', 'sd', 'compatibility_score', 'esg', 'environment', 'social', 'governance']].to_dict(orient='records'),
        'top_20s': [
            {"data": top_20_stocks_enviroment.to_dict(orient='records'),
                             'name': 'Environment'  },
            {"data": top_20_stocks_emissions.to_dict(orient='records'),
                                 'name': 'Emissions'
            },
            {"data": top_20_stocks_gov.to_dict(orient='records'),
                           'name': 'Governance'
            },
             {"data": top_20_stocks_product.to_dict(orient='records'),
                               'name': 'Product Responsibility'
            },
            {"data": top_20_stocks_social.to_dict(orient='records'),
                              'name': 'Social'
            },
            {"data": top_20_stocks_human.to_dict(orient='records'),
                             'name': 'Human Rights'
            }
        ],
        },
    # # Filter and print all S&P 500 stocks with their metrics
    # sp500_stocks = df_grouped[['ticker', 'name', 'annual_return', 'sd', 'esg', 'environment', 'social', 'governance', 'compatibility_score']]
    # print("All S&P 500 Stocks with Metrics:")
    # print(sp500_stocks.to_string(index=False))
    return(result)














