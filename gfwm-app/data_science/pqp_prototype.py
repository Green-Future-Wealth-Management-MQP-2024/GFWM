import pandas as pd
import sys

import os

# Set pandas options to display all rows and columns without truncation
pd.set_option('display.max_rows', None)  # To display all rows
pd.set_option('display.max_columns', None)  # To display all columns
pd.set_option('display.max_colwidth', None)  # To display full column content without truncation
pd.set_option('display.expand_frame_repr', False)  # To avoid breaking large dataframes into multiple lines

data = pd.read_csv("data_science/preprocess.csv")

environmental = 1
social = 1
governance = 1

if(len(sys.argv) == 4):
    environmental = float(sys.argv[1])
    social = float(sys.argv[2])
    governance = float(sys.argv[3])


# User responses to the questionnaire 
user_preferences = {
    'Environmental': environmental,  # Based on Question 1 and 3
    'Social': social,         # Based on Question 2 and 4
    'Governance': governance      # Based on Question 5
}

# Function to calculate ESG weight multiplier based on user preference
weight_multiplier_dict = {1: 0, 2: 1.5, 3: 2.75, 4: 4.25, 5: 5}
def weight_multiplier(user_preference):
    return weight_multiplier_dict.get(user_preference)

# Calculates the weights for each category
esg_weight_multipliers = {
    'Environmental': weight_multiplier(user_preferences['Environmental']),
    'Social': weight_multiplier(user_preferences['Social']),
    'Governance': weight_multiplier(user_preferences['Governance'])
}

# Calculates a weighted ESG risk score for each company based on user responses to questionnaire
weighted_esg_risk_score = (
    data['Environment Risk Score'] * esg_weight_multipliers['Environmental'] +
    data['Social Risk Score'] * esg_weight_multipliers['Social'] +
    data['Governance Risk Score'] * esg_weight_multipliers['Governance']
)

# Normalize the weight esg scores to [0, 10]
min = 5
max = 0
for val in weighted_esg_risk_score:
    if val < min:
        min = val
    if val > max:
        max = val
for i in range(len(weighted_esg_risk_score)):
    weighted_esg_risk_score[i] = 10 * (weighted_esg_risk_score[i] - min)/(max-min)
    
data['Weighted ESG Risk Score'] = weighted_esg_risk_score

# Calculates a final score based on both the ESG risk score and the growth estimate
# Better (higher scores) involve higher growth estimates and lower risk
# TODO find a way to convert final score into portfolio weights
data['Final Score'] = data['Growth Estimate'] / 5 - data['Weighted ESG Risk Score']

# Sorts the companies by the final score 
sorted_data = data.sort_values(by='Final Score', ascending=False)

# Shows the top companies that match user preferences
# TODO clear up output
# idea: print symbol, name, portfolio weight, past return, past risk
print(sorted_data[['Symbol', 'Name', 'Annual Return', 'Growth Estimate', 'Volatility',  'Final Score']].head(20))

sys.stdout.flush()
