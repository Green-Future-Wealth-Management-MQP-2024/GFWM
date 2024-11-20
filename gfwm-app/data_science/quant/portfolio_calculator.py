import pandas as pd
import numpy as np
import data_science.quant.markowitz_optimization as markowitz_optimization

#TODO move this to .env
# risk free rate based of historical average of 30d yield
ANNUAL_RISK_FREE_RATE = 0.0153

# TODO change volatility target to range

def calculate_portfolio(tickers, target_volatility, use_markowitz):
    
    #important note: tickers are in the same order in every data source
    n = len(tickers)
    annual_returns = pd.read_csv("data_science/quant/sp500_performance_summaries.csv")[tickers].iloc[0]
    
    adjusted_cov_matrix = pd.read_csv("data_science/quant/sp500_adjusted_cov_matrix.csv")
    adjusted_cov_matrix.set_index('ticker', inplace=True)
    
    true_cov_matrix = pd.read_csv("data_science/quant/sp500_raw_cov_matrix.csv")
    true_cov_matrix.set_index('ticker', inplace=True)
    
    # keep entries where both tickers are present
    adjusted_cov_matrix = adjusted_cov_matrix.loc[tickers, tickers].to_numpy()
    true_cov_matrix = true_cov_matrix.loc[tickers, tickers].to_numpy()
    
    if(use_markowitz):

        # keep identified tickers and convert to daily mean log returns
        mean_log_returns = annual_returns/252
        # print(mean_log_returns * 252)

        # daily target returns starting from risk free rate to 20% annually
        # scale to annual for graphing
        target_returns = np.linspace(start=pow(ANNUAL_RISK_FREE_RATE+1, 1/365.0) - 1, 
                                    stop=0.3/252, num=80)
        
        bounds = [0.333/n, 3.0/n]
        markowitz_portfolios = markowitz_optimization.calculate_optimal_portfolios(true_mean_returns=mean_log_returns,
                                                                                   adjusted_mean_returns=mean_log_returns,
                                                                                   true_cov=true_cov_matrix,
                                                                                   adjusted_cov=adjusted_cov_matrix,
                                                                                   target_returns=target_returns,
                                                                                   annual_risk_free_rate=ANNUAL_RISK_FREE_RATE,
                                                                                   bounds = bounds)


        # idea: calculate the slope of the line between (0, rfr), (point)
        # the steepest slope is the ideal portfolio we want
        
        # slope = (return - rfr) / volatility
        # same as picking the portfolio with the largest sharpe!
        
        markowitz_portfolios['slope'] = (markowitz_portfolios['annual_return'] - ANNUAL_RISK_FREE_RATE) / markowitz_portfolios['annual_volatility']
        
        tangent_portfolio_index = markowitz_portfolios['slope'].argmax()
        
        tangent_portfolio = markowitz_portfolios.iloc[tangent_portfolio_index]        
        
        # interpolate the line between (0, risk_free_rate) and the tangent portfolio
        # target_vol = alpha * tangent_vol + (1-alpha) * 0
        
        alpha = target_volatility / tangent_portfolio['annual_volatility']
        
        # in most cases, target volatility is less than tangent portfolio:
        if alpha <= 1:
            print(f'alpha: {alpha}')
            print(tangent_portfolio)
            ideal_weights = np.array(alpha * tangent_portfolio['weights']).reshape(n, 1)  
        
        # rare case: the client's volatility tolerance is higher than the tangent portfolio
        # find the portfolio with the closest volatility
        # assuming there is a portfolio that high
        else:
            closest_portfolio = markowitz_portfolios.iloc[markowitz_portfolios.loc[tangent_portfolio_index:, 'annual_volatility'].sub(target_volatility).abs().argmin()]
            print(closest_portfolio)
            ideal_weights = np.array(closest_portfolio['weights']).reshape(n, 1)

    #not markowitz -> equal weights
    else:
        ideal_weights = np.repeat(1.0/n, n).reshape(n, 1)
    
    expected_return = np.dot(ideal_weights.reshape(n,), annual_returns)
    
    expected_volatility = np.sqrt(252 * (ideal_weights.T @ true_cov_matrix @ ideal_weights)[0][0])
    
    sharpe = (expected_return - ANNUAL_RISK_FREE_RATE) / expected_volatility
    
    return ideal_weights, expected_return, expected_volatility, sharpe
