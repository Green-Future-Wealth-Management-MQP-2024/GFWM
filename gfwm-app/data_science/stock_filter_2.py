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
     # Calculate base weights based on preferences
    total_importance = sum(user_preferences[key] for key in preference_to_column_mapping)
    weights = {key: user_preferences[key] / total_importance for key in preference_to_column_mapping}

    # Adjust weights based on flexibility (higher flexibility reduces preference strictness)
    flexibility_adjustment = 1 - (0.05 * (5 - flexibility))  # Flexibility scales from 0.95 to 1.00
    adjusted_weights = {key: weight * flexibility_adjustment for key, weight in weights.items()}
    averaged_data['compatibility_score'] = sum(adjusted_weights[key] * averaged_data[preference_to_column_mapping[key]] for key in adjusted_weights)
    df_grouped = averaged_data.copy()
    df_grouped = df_grouped.groupby('Symbol').agg({
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
        risk_weight = 0.20 * risk_preference  # Maps 1-5 to risk quantile levels
        risk_threshold = averaged_data['Standard Deviation'].quantile(risk_weight)
        averaged_data['compatibility_score'] = averaged_data['compatibility_score'] / (
            1 + (averaged_data['Standard Deviation'] / risk_threshold)
        )


    # Top stocks based on Predicted Total Returns
    # Top stocks based on Predicted Total Returns
    top_100_stocks = averaged_data.groupby('Symbol').agg({
        'Total Returns': 'mean',
        'Name': 'first',
        'ESG Score': 'mean',
        'ESG Controversies Score': 'mean',
        'Environment Pillar Score': 'mean',
        'Social Pillar Score': 'mean',
        'Governance Pillar Score': 'mean',
        'Standard Deviation': 'mean',
        'compatibility_score': 'mean'
    }).nlargest(100, 'compatibility_score').reset_index()

    top_100_stocks['compatibility_score'] = df_grouped['compatibility_score']

    # Predict Total Returns based on compatibility score and other factors
    top_100_stocks['Predicted Total Returns'] = (
        0
    )

    top_100_stocks = top_100_stocks.rename(columns={"Name": "name",
                            "Symbol": "ticker",
                            "ESG Score": "esg",
                            "ESG Controversies Score": "controversy",
                            "Environment Pillar Score": "environment",
                            "Social Pillar Score": "social",
                            "Governance Pillar Score": "governance",
                            "Total Returns": "annual_return",
                            "Standard Deviation": "sd",
                    })
    
    


    # Convert scores to numeric
    score_columns = ['Emissions Score', 'Governance Pillar Score', 'Product Responsibility Score', 'Social Pillar Score', 'Human Rights Score', 'Total Returns']
    df_grouped[score_columns] = df_grouped[score_columns].apply(pd.to_numeric, errors='coerce')

    
    # Calculate the 75th percentile 
    # emissions_75th_percentile = df_grouped['Emissions Score'].quantile(0.75)
    # gov_75th_percentile = df_grouped['Governance Pillar Score'].quantile(0.75)
    # product_75th_percentile = df_grouped['Product Responsibility Score'].quantile(0.75)
    # social_75th_percentile = df_grouped['Social Pillar Score'].quantile(0.75)
    # human_75th_percentile = df_grouped['Human Rights Score'].quantile(0.75)

    # # Filter symbols 
    # emissions_filtered_stocks = df_grouped[df_grouped['Emissions Score'] >= emissions_75th_percentile]
    # gov_filtered_stocks = df_grouped[df_grouped['Governance Pillar Score'] >= gov_75th_percentile]
    # product_filtered_stocks = df_grouped[df_grouped['Product Responsibility Score'] >= product_75th_percentile]
    # social_filtered_stocks = df_grouped[df_grouped['Social Pillar Score'] >= social_75th_percentile]
    # human_filtered_stocks = df_grouped[df_grouped['Human Rights Score'] >= human_75th_percentile]

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
    

    return(result)

