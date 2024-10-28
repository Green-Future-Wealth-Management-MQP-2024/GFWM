#TODO
# equal weights
# markowitz no short to see what happens
# add upper bound to each weight

# exp weighted moving average of volatility

# garch model for volatility modeling

# covered calls
# short term atm options to model volatility

# bloomberg terminal - stratton hall 4th floor

import pandas as pd
import numpy as np

from data_science import stock_filter

# call filter stocks to come up with universe of 100 stocks
tickers = stock_filter.filter_stocks(5, 5, 5)["ticker"]

# read csv for return and cov matrix
price_data = pd.read_csv("data_science/quant/sp500_weekly_data.csv")[["ticker", "log_return", "volatility"]]
cov_matrix = pd.read_csv("data_science/quant/sp500_weekly_covariance_matrix.csv").to_numpy()

print(cov_matrix)

mean_log_returns = {}

for ticker, block in price_data.groupby(by = "ticker"):
    mean_log_returns[ticker] = np.mean(block['log_return'])

# generate 500 random portfolios under sd 2

# def random_portfolio(returns):
#     ''' 
#     Returns the mean and standard deviation of returns for a random portfolio
#     '''

#     p = np.asmatrix(np.mean(returns, axis=1))
#     w = np.asmatrix(rand_weights(returns.shape[0]))
#     C = np.asmatrix(np.cov(returns))
    
#     mu = w * p.T
#     sigma = np.sqrt(w * C * w.T)
    
#     # This recursion reduces outliers to keep plots pretty
#     if sigma > 2:
#         return random_portfolio(returns)
#     return mu, sigma

# n_portfolios = 500
# means, stds = np.column_stack([
#     random_portfolio(return_vec) 
#     for _ in xrange(n_portfolios)
# ])

# plot markowitz bullet