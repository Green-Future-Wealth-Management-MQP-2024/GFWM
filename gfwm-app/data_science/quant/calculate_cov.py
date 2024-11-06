import pandas as pd
from datetime import datetime, timedelta

price_data = pd.read_csv("data_science/quant/sp500_daily_data.csv", parse_dates=["Date"])[['Date', 'ticker', 'log_return']]

# only take into consideration last 10 years of price data
# price_data = price_data[price_data['Date'] >= (datetime.now() - timedelta(days=10*365))]

# remove these tickers which aren't even in the weekly data 
#price_data = price_data[~price_data['ticker'].isin(["CDAY", "FLT"])]

# Since some tickers use different days within the same week, standardize week counts
#min_date = price_data['Date'].min()
#price_data['week'] = (price_data['Date'] - min_date).dt.days // 7


# pivot to make 500 columns
price_data = price_data.pivot(index = 'Date', columns='ticker', values='log_return')

print(price_data.head(5))

# pandas covariance function
#covariance_matrix = price_data.cov()

#covariance_matrix.to_csv("data_science/quant/sp500_covariance_matrix.csv", index=True)
