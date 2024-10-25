import pandas as pd
import numpy as np

import requests

api_key = "HWNPOV64EX80DSBA"

tickers = pd.read_csv("../preprocessed.csv")["ticker"][:10]

all_df = []

all_adj_close = {}

for ticker in tickers:

    url = f"https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED&symbol={ticker}&apikey={api_key}"

    alpha_vantage_data = requests.get(url).json()["Weekly Adjusted Time Series"]
    df = pd.DataFrame.from_dict(alpha_vantage_data, orient="index")
    
    # Rename columns
    # index -> date
    # clean up alpha vantage headers
    
    df.reset_index(inplace=True)
    df.rename(columns={"index": "date"}, inplace=True)
    
    new_column_names = {
        "1. open": "open",
        "2. high": "high",
        "3. low": "low",
        "4. close": "close",
        "5. adjusted close": "adjusted_close",
        "6. volume": "volume",
        "7. dividend amount": "dividend_amount"
    }
    df.rename(columns=new_column_names, inplace=True)
    
    df.insert(1, "ticker", ticker)
    
    all_df.append(df)
    all_adj_close["ticker"] = df["adjusted_close"]
       
    print(f"{ticker} done")
    

# Calculate the covariance matrix
covariance_matrix = pd.DataFrame(all_adj_close).cov()

print(covariance_matrix.head())

# Optional: Set the index and columns to the tickers (already done in this case)
covariance_matrix.index = tickers
covariance_matrix.columns = tickers

# Concatenate all dataframes and save to csv
pd.concat(all_df).to_csv("sp500_weekly_adjusted.csv") 