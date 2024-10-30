import pandas as pd
import numpy as np

import cvxopt as opt
from cvxopt import blas, solvers

# from data_science import stock_filter

# call filter stocks to come up with universe of 100 stocks
# tickers = stock_filter.filter_stocks(5, 5, 5)["ticker"]


def calculate_optimal_portfolios(mean_returns, cov, target_returns, bounds = None):
    
    n = len(mean_returns)
    
    # results df
    empty = np.empty(len(target_returns))
    optimal_portfolios = pd.DataFrame({'target_return': target_returns,
                                   'annual_return': empty,
                                   'annual_volatility': empty,
                                   'weights': empty})

    # minimize x * cov * x
    # subject to:
    # Gx <= h:  0 <= x <= upper_bound
    #               -x <= 0, x <= upper_bound
    # Ax = b: 1.x = 1, mean_returns * x = target_return

    # make sure these are floats    
    if bounds is None:
        bounds[0] = 0.0
        bounds[1] = 2.5/n

    # Create the matrices to enforce lower_bound <= x_i <= upper_bound
    
    # This will require 2 * n constraints (one for each bound on each variable)
    G = opt.matrix(0.0, (2 * n, n))
    for i in range(n):
        G[i, i] = -1.0
        G[n + i, i] = 1.0

    # Create the h vector for the bounds
    h = opt.matrix(-bounds[0], (2 * n, 1))
    for i in range(n):
        h[i + n] = bounds[1]

    A = opt.matrix(1.0, (2, n))
    for i in range(n):
        A[1, i] = mean_returns[i]

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
    best_fit = np.polynomial.Polynomial.fit(
        optimal_portfolios['annual_return'], 
        optimal_portfolios['annual_volatility'], 4)
    
    return optimal_portfolios, best_fit


def montecarlo_random_portfolios(mean_returns, cov, bounds = None):
    
    rng = np.random.default_rng()
    
    n = len(mean_returns)

    montecarlo_iterations = int(1e5)
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