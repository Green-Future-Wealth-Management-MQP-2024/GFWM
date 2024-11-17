import pandas as pd
import yfinance as yf
import numpy as np

data = pd.read_csv("data_science/Refinitiv ESG Final Data for Analysis.csv")

columns_to_keep = ['Symbol', 'Name', 'ESG Combined Score', 'ESG Controversies Score', 
                   'Environment Pillar Score', 'Social Pillar Score','Governance Pillar Score',
                   'Human Rights Score', 'Community Score', 'Workforce Score', 'Product Responsibility Score', 
                   'Shareholders Score','Management Score']

data = data[columns_to_keep]
# pandas prefers single word columns. lowercase for simplicity with variable names
data = data.rename(columns={"Symbol": "ticker",
                            "Name": "name",
                            "ESG Combined Score": "esg_combined",
                            "ESG Controversies Score": "controversy",
                            "Environment Pillar Score": "environment",
                            "Social Pillar Score": "social",
                            "Governance Pillar Score": "governance",
                            "Human Rights Score": "human_rights",
                            "Community Score": "community",
                            "Workforce Score": "workforce",
                            "Product Responsibility Score": "product_responsibility",
                            "Shareholders Score": "shareholders",
                            "Management Score": "management"
                            })

# Delete rows containing the value 'Unknown' 
data = data[~data.eq('Unknown').any(axis=1)]

numeric_columns_to_average = data.columns[2:]

# for each ticker, calculate summary scores in each of the relevant columns
# use exponential weighted average over the years for which we have data

def ewma_summaries(group):
    # Set span based on group size
    span = min(len(group), 10)
    #TODO selecting columns inside here, after the group by, is deprecated
    last_row = group[numeric_columns_to_average].ewm(span = span).mean().iloc[-1]
    last_row['name'] = group['name'].iloc[0]
    return last_row.round(4)

result = (
    data.groupby('ticker')
      .apply(ewma_summaries)
)

#print(result)

result.to_csv('data_science/preprocessed_refinitiv.csv')