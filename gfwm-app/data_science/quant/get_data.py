import pandas as pd
import numpy as np
import yfinance as yf

tickers = pd.read_csv("../preprocessed.csv")["ticker"]

# remove PEAK
# remove PXD (pioneer energy, aquired by exxon mobil)
# remove WRK
tickers.remove("PEAK")
tickers.remove("PXD")
tickers.remove("WRK")

all_data = pd.DataFrame()
all_daily_returns = {}

# Loop through each ticker and fetch historical data
for ticker in tickers:
    # Fetch historical data for the ticker
    data = yf.download(ticker, start="2000-01-01", end="2024-10-01")
    
    # Keep only the relevant columns and rename them
    data = data[['Open', 'High', 'Low', 'Close', 'Adj Close', 'Volume']]
    data.columns = ['open', 'high', 'low', 'close', 'adjusted_close', 'volume']
    
    # Add the ticker column
    data.insert(0, "ticker", ticker)
    
    data['log_return'] = np.log(data['adjusted_close'] / data['adjusted_close'].shift(1))
    data = data.dropna(subset=['log_return'])
    
    all_daily_returns[ticker] = data["log_return"]
    
    # Append to the main DataFrame
    all_data = pd.concat([all_data, data])

# Reset the index
all_data.reset_index(inplace=True)

# Save the combined DataFrame to CSV
all_data.to_csv("sp500_daily_data.csv", index=False)

# Calculate the covariance matrix
covariance_matrix = pd.DataFrame(all_daily_returns).cov()

covariance_matrix.to_csv("sp500_covariance_matrix.csv", index = True)