import pandas as pd
import numpy as np
import data_science.quant.markowitz_optimization as markowitz_optimization

#TODO move this to .env
# risk free rate based of historical average of 30d yield
ANNUAL_RISK_FREE_RATE = 0.0153

# TODO change volatility target to range

def calculate_portfolio(tickers, target_volatility, target_return=[0.08, 0.12]):
    
    #important note: tickers are in the same order in every data source
    n = len(tickers)

    all_performance_summaries = pd.read_csv("data_science/quant/sp500_performance_summaries.csv")
    entire_cov_matrix = pd.read_csv("data_science/quant/sp500_adjusted_cov_matrix.csv")
    entire_cov_matrix.set_index('ticker', inplace=True)

    # keep entries where both tickers are present
    cov_matrix = entire_cov_matrix.loc[tickers, tickers].to_numpy()

    # keep identified tickers and convert to daily mean log returns
    mean_log_returns = (all_performance_summaries[tickers].iloc[0])/252
    # print(mean_log_returns * 252)

    # daily target returns starting from risk free rate to 20% annually
    # scale to annual for graphing
    target_returns = np.linspace(start=pow(ANNUAL_RISK_FREE_RATE+1, 1/365.0) - 1, 
                                 stop=0.2/252, num=50)

    markowitz_portfolios, best_fit = markowitz_optimization.calculate_optimal_portfolios(mean_log_returns,
                                                                               cov_matrix,
                                                                               target_returns,
                                                                               ANNUAL_RISK_FREE_RATE,
                                                                               bounds=[0.25/n, 4.0/n],
                                                                               calculate_best_fit=True)


    #TODO: consider moving this calculation to markowitz_optimization.calculate_ideal_portfolio()

    #calculate tangent line to best fit curve, passing through (0, annual_rfr)
    # vol = ar^2 + br + c
    # derivative: 2ar + b

    # point slope form of line also passing through (vol_t, ret_t)
    # vol - vol_t = slope * (ret - ret_t)

    # at the tangency point (vol_t, ret_t), slopes are equal:
    # vol_t / (ret_t - rfr) = 2a * ret_t + b
    # solve for ret_t to find the tangency point (ret_t, vol_t)

    # best_fit(ret_t) / (ret_t - rfr) = 2a * ret_t + b
    # ar^2 + br + c = (r-rfr)(2ar+b)
    #               = 2a r^2 + (b-2arfr) * r - rfr*b
    # 0 = ar^2 - 2arfr * r - c - rfr*b

    [c, b, a] = best_fit.convert().coef
    tangency_poly = np.polynomial.Polynomial([-c - b * ANNUAL_RISK_FREE_RATE, 
                                            -2*a* ANNUAL_RISK_FREE_RATE,
                                            a])
    #find root in the acceptable range
    approx_tangent_return = [root for root in tangency_poly.roots() if 0 <= root <= 0.5][0]
    
    # we want the portfolio closest to the tangent point
    
    closest_index = (np.abs(markowitz_portfolios['annual_return'] - approx_tangent_return)).argmin()
    
    #columns of portfolio: 'annual_return', 'annual_volatility', 'weights', 'diversification'
    tangent_portfolio = markowitz_portfolios.iloc[closest_index]
    
    
    # interpolate the line between (0, risk_free_rate) and the tangent portfolio
    # target_vol = alpha * tangent_vol + (1-alpha) * 0
    
    alpha = target_volatility / tangent_portfolio['annual_volatility']
    
    expected_return = alpha * tangent_portfolio['annual_return'] + (1-alpha) * ANNUAL_RISK_FREE_RATE
    ideal_weights = alpha * tangent_portfolio['weights']
    
    sharpe = (expected_return - ANNUAL_RISK_FREE_RATE) / target_volatility
    
    return ideal_weights, expected_return, sharpe
