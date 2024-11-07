import pandas as pd
import numpy as np
import yfinance as yf

esg_tickers = pd.read_csv("data_science/Refinitiv ESG Final Data for Analysis.csv")["Symbol"].unique()
tickers = pd.read_csv("data_science/quant/SP500_ticker_metadata.csv")['ticker']

#intersection of tickers in ESG data and the SP500 data we have
#todo: only get the timeseries data for the ESG tickers we have
tickers = pd.Series(list(set(esg_tickers) & set(tickers)))

# remove PEAK, 
# PXD (pioneer energy, aquired by exxon mobil), 
# WRK (sidney australia listing)
#CDAY renamed to DAY
#FLT listed in australia

# Filter out bad tickers using mask
tickers = tickers[~tickers.isin(["PEAK", "PXD", "WRK", "CDAY", "FLT", "BRK.B", "BF.B"])]

timeseries_13_18 = pd.read_csv("data_science/quant/SP500_timeseries_1-1-13--12-31-18.csv")
timeseries_19_24 = pd.read_csv("data_science/quant/SP500_timeseries_1-1-19--11-1-24.csv")

# remove columns (days) with no data, for example holidays
timeseries_13_18 = timeseries_13_18.dropna(axis=1, how='all')
timeseries_19_24 = timeseries_19_24.dropna(axis=1, how='all')

# transpose so each column turns in a timeseries for one ticker
# also reverse order so dates increase from top to bottom
timeseries_13_18 = timeseries_13_18.set_index('ticker').T.iloc[::-1]
timeseries_13_18.columns.name = None
timeseries_19_24 = timeseries_19_24.set_index('ticker').T.iloc[::-1]
timeseries_19_24.columns.name = None

# Concatenate along the rows (axis=0)
timeseries = pd.concat([timeseries_13_18, timeseries_19_24], axis=0)#.reset_index(drop = True)

#print(timeseries.shape)

# Save the combined DataFrame to CSV
timeseries.to_csv("data_science/quant/sp500_timeseries_13-24.csv", index=True)