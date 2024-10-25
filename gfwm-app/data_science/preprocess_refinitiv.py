import pandas as pd
import yfinance as yf
import numpy as np

data = pd.read_csv("Refinitiv ESG Final Data for Analysis.csv")

columns_to_keep = ["Name", "Symbol", "Year", "ESG Controversies Score", "Environment Pillar Score",
                   "Social Pillar Score", "Governance Pillar Score", "Total Returns", "Standard Deviation"]
data = data[columns_to_keep]
# pandas prefers single word columns. lowercase for simplicity with variable names
data = data.rename(columns={"Name": "name",
                            "Symbol": "ticker",
                            "Year": "year",
                            "ESG Controversies Score": "controversy",
                            "Environment Pillar Score": "environment",
                            "Social Pillar Score": "social",
                            "Governance Pillar Score": "governance",
                            "Total Returns": "annual_return",
                            "Standard Deviation": "sd"})
last_complete_year = 2022
#data = data[data['year'] <= last_complete_year]

preprocessed_data = {}

for header in data.columns.values:
    preprocessed_data[header] = []

# build new columns under each header, example:
# Apple | AAPL | last year present | weighted controversy score | weighted env score | weighted social score | weighted gov score | annualized returns | average sd

# https://www.desmos.com/calculator/dip9x7liy0
def weight(year):
    x = last_complete_year-year
    w = 0.56 - 0.38* np.arctan(0.4*x - 2)
    #w = -0.000217813 * x**3 + 0.00645862 * x**2 -0.0861945 * x + 1
    return w

    #return 1.5 - 0.5 * np.exp(x * 0.0475)
    #return 1 - x/23.0

#TODO: add years in SP500

for ticker, block in data.groupby("ticker"):
    
    num_years = len(block)  # max in dataset is 22
    
    # create annualized return from returns
    # https://www.investopedia.com/terms/a/annualized-total-return.asp

    annual_return = pow(
        (pd.to_numeric(block["annual_return"])+1).prod(), 1.0/num_years) - 1

    # average of standard deviations

    sd = pd.to_numeric(block["sd"]).mean()
    
    #remove last row (2023) since it doensn't have esg data
    esg_block = block.iloc[:-1]
    
    weights = weight(esg_block["year"].array) #recommended instead of .values
    weights = weights/sum(weights)
    
    #print(len(weights), [round(w*100, 4) for w in weights])

    # dot product weights with values to form one weighted average for each category
    controversy = np.dot(pd.to_numeric(esg_block["controversy"], "coerce"), weights)
    env = np.dot(pd.to_numeric(esg_block["environment"]), weights)
    social = np.dot(pd.to_numeric(esg_block["social"]), weights)
    gov = np.dot(pd.to_numeric(esg_block["governance"]), weights)
    

    preprocessed_data["name"].append(block["name"].values[0])
    preprocessed_data["ticker"].append(ticker)
    preprocessed_data["year"].append(last_complete_year)

    preprocessed_data["controversy"].append(controversy)
    preprocessed_data["environment"].append(env)
    preprocessed_data["social"].append(social)
    preprocessed_data["governance"].append(gov)

    preprocessed_data["annual_return"].append(annual_return)
    preprocessed_data["sd"].append(sd)

# Save the DataFrame to a CSV file
# Set index=False to avoid writing row indices
df = pd.DataFrame(preprocessed_data).round(6)
df.to_csv('preprocessed.csv', index=False)
