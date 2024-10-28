# TODO
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
import matplotlib.pyplot as plt

from data_science import stock_filter

# call filter stocks to come up with universe of 100 stocks
# tickers = stock_filter.filter_stocks(5, 5, 5)["ticker"]
tickers = pd.read_csv("data_science/quant/constituents.csv")["Symbol"]

# remove same list as in get_data along with VFC
tickers = tickers[~tickers.isin(["PEAK", "PXD", "WRK", "CDAY", "FLT", "BRK.B", "BF.B", "VFC",
                                'AMTM', 'GLW', 'GEHC', 'GEV', 'KVUE', 'SW', 'SOLV', 'VLTO'])].reset_index(drop=True).to_list()

# read csv for return and cov matrix
price_data = pd.read_csv(
    "data_science/quant/sp500_weekly_data.csv")[["ticker", "log_return", "volatility"]]
# keep selected tickers
price_data = price_data[price_data['ticker'].isin(tickers)]

cov_matrix = pd.read_csv(
    "data_science/quant/sp500_weekly_covariance_matrix.csv")
cov_matrix = cov_matrix.set_index('ticker')
# keep entries where both tickers are present
cov_matrix = cov_matrix.loc[tickers, tickers].to_numpy()


mean_log_returns = price_data.groupby(by="ticker").log_return.agg("mean")

# Returns the mean and standard deviation of returns for a random portfolio


def random_portfolio():
    rand_weights = np.random.rand(len(tickers))
    rand_weights = rand_weights / sum(rand_weights)

    est_return = np.dot(mean_log_returns, rand_weights) * 252

    sigma = np.sqrt(
        np.matmul(rand_weights.T, np.matmul(cov_matrix, rand_weights)))

    # This recursion reduces outliers to keep plots pretty
    if sigma > 0.03:
        return random_portfolio()
    return est_return, sigma


n_portfolios = 1000
means, stds = np.column_stack([
    random_portfolio()
    for _ in range(n_portfolios)
])

# plot markowitz bullet
fig = plt.figure()
plt.plot(stds, means, 'o', markersize=5)
plt.xlabel('std')
plt.ylabel('mean')
plt.title('Mean and standard deviation of returns of randomly generated portfolios')
plt.show()
# py.iplot_mpl(fig, filename='mean_std', strip_style=True)
