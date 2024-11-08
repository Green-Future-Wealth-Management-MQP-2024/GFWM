import pandas as pd
import numpy as np

import cvxopt as opt
from cvxopt import blas, solvers
solvers.options["show_progress"] = True

# from data_science import stock_filter

# call filter stocks to come up with universe of 100 stocks
# tickers = stock_filter.filter_stocks(5, 5, 5)["ticker"]


def calculate_optimal_portfolios(mean_returns, cov, target_returns, annual_risk_free_rate = 0.02, bounds = None):
    
    n = len(mean_returns)
    
    # convert to daily rate
    risk_free_rate = pow(annual_risk_free_rate+1, 1/365.0) - 1
    
    target_returns = target_returns[np.where(target_returns > risk_free_rate)]
    
    # initialize results dataframe
    empty = np.empty(len(target_returns))
    optimal_portfolios = pd.DataFrame({'target_return': target_returns,
                                   'annual_return': empty,
                                   'annual_volatility': empty,
                                   'weights': empty,
                                   'diversification': empty})

    
    # make sure these are floats    
    if bounds is None or len(bounds) != 2:
        bounds = [0.0, 2.0/n]
    elif(len(bounds) ==2):
        bounds[0] = float(bounds[0])
        bounds[1] = float(bounds[1])
    
    # minimize w * cov * w
    # subject to:
    # Gw <= h: (2n+1, n)(n, 1) <= (2n+1, 1)  
    #   -w <= -lower_bound (lower_bound <= w <= upper_bound)
    #   w <= upper_bound
    #   1.w <= 1
    
    ''' example for n = 4
    -1  0   0   0       w1     =        -w1
    0   -1  0   0       w2              -w2
    0   0   -1  0       w3              -w3
    0   0   0  -1       w4              -w4
    1   0   0   0                       w1
    0   1   0   0                       w2
    0   0   1   0                       w3
    0   0   0   1                       w4
    1   1   1   1                       w1+w2+w3+w4
    '''
    
    # Aw = b: (1, n)(n, 1) = (1,1)
    # mean_returns * w = target_return

    G = opt.matrix(0.0, (1 + 2 * n, n))
    for i in range(n):
        G[i, i] = -1.0
        G[n + i, i] = 1.0
        G[2*n, i] = 1.0

    h = opt.matrix(-bounds[0], (1 + 2 * n, 1))
    for i in range(n):
        h[i + n] = bounds[1]
    h[2*n] = 1.0

    A = opt.matrix(mean_returns, (1, n))

    # Calculate efficient frontier weights using quadratic programming
    optimal_portfolios['weights'] = optimal_portfolios['target_excess_return'].map(
        lambda tgt: solvers.qp(cov, -mean_returns, G, h, A, b=opt.matrix(tgt))['x']
    )

    # Calculate annual return and annual volatility metrics based off of weights
    optimal_portfolios['annual_return'] = optimal_portfolios['weights'].map(
        lambda w: 252.0 * blas.dot(mean_returns, w)
    )
    optimal_portfolios['annual_volatility'] = optimal_portfolios['weights'].map(
        lambda w: np.sqrt(252.0 * blas.dot(w, cov*w))
    )
    
    optimal_portfolios['diversification'] = optimal_portfolios['weights'].map(
        lambda w: 1 - 10*np.sum((w - 1.0/n)**4)
    )

    # Calculate quadratic best fit
    # annual_return as independent variable, annual_volatility as dependent variable
    best_fit = np.polynomial.Polynomial.fit(
        optimal_portfolios['annual_return'], 
        optimal_portfolios['annual_volatility'], 2)
    
    return optimal_portfolios, best_fit


def montecarlo_random_portfolios(mean_returns, cov, bounds = None):
    
    rng = np.random.default_rng()
    
    n = len(mean_returns)

    montecarlo_iterations = int(1e4)
    montecarlo_portfolios = pd.DataFrame(index=range(montecarlo_iterations))
    
    if(bounds is None):
        bounds = [0.0, n/4.0]

    # Generate random weights array and assign to 'random_weights' column
    montecarlo_portfolios['random_weights'] = list(
        rng.uniform(low=bounds[0], high=bounds[1], size=(montecarlo_iterations, n)))
    
    montecarlo_portfolios['random_weights'] = montecarlo_portfolios['random_weights'].map(
        lambda w: opt.matrix(w/sum(w))
    )

    montecarlo_portfolios['annual_return'] = montecarlo_portfolios['random_weights'].map(
        lambda w: 252 * blas.dot(w, mean_returns)
    )

    montecarlo_portfolios['annual_volatility'] = montecarlo_portfolios['random_weights'].map(
        lambda w: np.sqrt(252.0 * blas.dot(w, cov*w))
    )
    
    return montecarlo_portfolios