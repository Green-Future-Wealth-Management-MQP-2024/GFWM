import pandas as pd
import numpy as np
import yfinance as yf

import matplotlib.pyplot as plt

tickers = pd.read_csv("../preprocessed.csv")["ticker"]

# remove PEAK, PXD (pioneer energy, aquired by exxon mobil), WRK (sidney australia listing)
tickers = tickers[~tickers.isin(["PEAK", "PXD", "WRK"])].reset_index(drop=True)

all_data = pd.DataFrame()
all_daily_returns = {}

# Loop through each ticker and fetch historical data
for ticker in tickers:
    # Fetch historical data for the ticker
    data = yf.download(ticker, start="2000-01-01", end="2024-10-01")

    # Keep only the relevant columns and rename them
    data = data[['Open', 'High', 'Low', 'Close', 'Adj Close', 'Volume']]
    data.columns = ['open', 'high', 'low', 'close', 'adjusted_close', 'volume']

    # add new columns
    data.insert(0, "ticker", ticker)

    # calculate two forms of return in new columns
    data.insert(6, 'raw_return',
                data['adjusted_close'] / data['adjusted_close'].shift(1))
    data.insert(7, 'log_return', np.log(data['raw_return']))

    # used to calculate volatility
    data.insert(8, 'squared_log_return', data['log_return'] ** 2)

    # calculate moving averages for volatility and volume
    data.insert(9, 'volatility', np.sqrt(252) *
                data['squared_log_return'].ewm(alpha=0.94, adjust=True).mean())
    data.insert(11, 'volume_100ma', data['volume'].rolling(window=100).mean())

    # drops the first 200 rows (largest moving average window)
    data = data.dropna(subset=['volume_100ma'])

    all_daily_returns[ticker] = data['log_return']

    # Append to the main DataFrame
    all_data = pd.concat([all_data, data])

all_data.drop(columns=['squared_log_return'], inplace=True)

# Save the combined DataFrame to CSV
all_data.to_csv("sp500_daily_data.csv", index=True)


# Calculate the covariance matrix
covariance_matrix = pd.DataFrame(all_daily_returns).cov()

covariance_matrix.to_csv("sp500_covariance_matrix.csv", index=True)
