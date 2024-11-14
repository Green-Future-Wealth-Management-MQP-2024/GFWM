import pandas as pd
import yfinance as yf
import numpy as np

data = pd.read_csv("data_science/Refinitiv ESG Final Data for Analysis.csv")


columns_to_keep = ["Name", "Symbol", "ESG Controversies Score", "Environment Pillar Score", 
                   'Human Rights Score', 'Workforce Score', 'Product Responsibility Score', 
                   'Shareholders Score','Community Score', "Governance Pillar Score"]

data = data[columns_to_keep]
# pandas prefers single word columns. lowercase for simplicity with variable names
data = data.rename(columns={"Name": "name",
                            "Symbol": "ticker",
                            "ESG Controversies Score": "controversy",
                            "Environment Pillar Score": "environment",
                            "Human Rights Score": "human_rights",
                            "Workforce Score": "workforce",
                            "Product Responsibility Score": "product_responsibility",
                            "Shareholders Score": "shareholders",
                            "Community Score": "community",
                            "Governance Pillar Score": "governance"})

# Delete rows containing the value 'Unknown' 
data = data[~data.eq('Unknown').any(axis=1)]

numeric_columns_to_average = data.columns[3:]

# for each ticker, calculate summary scores in each of the relevant columns
# use exponential weighted average over the years for which we have data

def ewma_summaries(group):
    # Set span based on group size
    span = min(len(group), 10)
    last_row = group.ewm(span = span).mean().iloc[-1]
    return last_row.round(4)

result = (
    data.groupby('ticker')[numeric_columns_to_average]
      .apply(ewma_summaries)
)

#print(result)

result.to_csv('data_science/preprocessed_refinitiv.csv')