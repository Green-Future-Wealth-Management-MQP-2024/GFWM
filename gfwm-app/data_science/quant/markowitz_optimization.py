import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

import cvxopt as opt
from cvxopt import blas, solvers

# from data_science import stock_filter

# call filter stocks to come up with universe of 100 stocks
# tickers = stock_filter.filter_stocks(5, 5, 5)["ticker"]


# read csv for return and cov matrix
all_price_data = pd.read_csv(
    "data_science/quant/sp500_daily_data.csv")[["ticker", "log_return", "volatility"]]

entire_cov_matrix = pd.read_csv(
    "data_science/quant/sp500_covariance_matrix.csv")
entire_cov_matrix = entire_cov_matrix.set_index('ticker')

unique_tickers = pd.Series(all_price_data['ticker'].unique())


tickers = unique_tickers.sample(
    frac=75/500, random_state=1).reset_index(drop=True)
n = len(tickers)

# keep selected tickers
price_data = all_price_data[all_price_data['ticker'].isin(tickers)]

# keep entries where both tickers are present
cov_matrix = entire_cov_matrix.loc[tickers, tickers].to_numpy()

mean_log_returns = price_data.groupby(by="ticker").log_return.agg("mean")
mu_bar = np.mean(mean_log_returns)
mu_sd = np.std(mean_log_returns)

# Convert to cvxopt matrices
cov = opt.matrix(cov_matrix)
mean_returns = opt.matrix(mean_log_returns)

# daily target returns. scale to annual for graphing
target_returns = np.linspace(
    start=mu_bar - mu_sd, stop=mu_bar + mu_sd, num=80)

empty = np.empty(len(target_returns))
optimal_portfolios = pd.DataFrame({'target_return': target_returns,
                                   'annual_return': empty,
                                   'annual_volatility': empty,
                                   'weights': empty})


def calculate_optimal_portfolios():

    # minimize x cov x
    # subject to:
    # Gx <= h:  0 <= x <= upper_bound
    #               -x <= 0, x <= upper_bound
    # Ax = b: 1.x = 1, mean_returns * x = target_return

    upper_bound = 2.5/n

    # Create the G matrix to enforce 0 <= x_i <= 2/n
    # This will require 2 * n constraints (one for each bound on each variable)
    G = opt.matrix(0.0, (2 * n, n))
    for i in range(n):
        G[i, i] = -1.0
        G[n + i, i] = 1.0

    # Create the h vector for the bounds
    h = opt.matrix(0.0, (2 * n, 1))
    for i in range(n):
        h[i + n] = upper_bound

    A = opt.matrix(1.0, (2, n))
    for i in range(n):
        A[1, i] = mean_log_returns[i]

    # Calculate efficient frontier weights using quadratic programming
    optimal_portfolios['weights'] = optimal_portfolios['target_return'].map(
        lambda tgt: solvers.qp(cov, -mean_returns, G, h, A, b=opt.matrix((1.0, tgt), (2, 1)))['x'])

    # Calculate annual return and annual volatility metrics based off of weights
    optimal_portfolios['annual_return'] = optimal_portfolios['weights'].map(
        lambda w: 252.0 * blas.dot(mean_returns, w)
    )
    optimal_portfolios['annual_volatility'] = optimal_portfolios['weights'].map(
        lambda w: np.sqrt(252.0 * blas.dot(w, cov*w))
    )

    # Calculate quadratic best fit
    # annual_return as independent variable, annual_volatility as dependent variable
    return np.polynomial.Polynomial.fit(optimal_portfolios['annual_return'], optimal_portfolios['annual_volatility'], 2)


rng = np.random.default_rng()

montecarlo_iterations = int(1e5)
montecarlo_portfolios = pd.DataFrame(index=range(montecarlo_iterations))


def montecarlo_random_portfolios():

    # Generate random weights array and assign to 'random_weights' column
    montecarlo_portfolios['random_weights'] = list(
        rng.uniform(low=0, high=4.0/n, size=(montecarlo_iterations, n)))
    
    montecarlo_portfolios['random_weights'] = montecarlo_portfolios['random_weights'].map(
        lambda w: opt.matrix(w/sum(w))
    )

    montecarlo_portfolios['annual_return'] = montecarlo_portfolios['random_weights'].map(
        lambda w: 252 * blas.dot(w, mean_returns)
    )

    montecarlo_portfolios['annual_volatility'] = montecarlo_portfolios['random_weights'].map(
        lambda w: np.sqrt(252.0 * blas.dot(w, cov*w))
    )


# generate portfolios and plot results together

montecarlo_random_portfolios()

best_fit = calculate_optimal_portfolios()

lowest_risk = optimal_portfolios.sort_values(by='annual_volatility').loc[0]
print(lowest_risk['weights'])

fig = plt.figure()

plt.scatter(montecarlo_portfolios['annual_volatility'],
            montecarlo_portfolios['annual_return'], s=1, alpha=0.2)

plt.scatter(optimal_portfolios['annual_volatility'],
            optimal_portfolios['annual_return'], s=2, c='orange', alpha=0.9)

plt.ylabel('expected annualized log return')
plt.xlabel('annual volatility')

plt.plot([best_fit(tgt*252.0) for tgt in target_returns],
         [tgt*252.0 for tgt in target_returns])

plt.title(f"Portfolios of {n} SP500 stocks")
plt.show()
