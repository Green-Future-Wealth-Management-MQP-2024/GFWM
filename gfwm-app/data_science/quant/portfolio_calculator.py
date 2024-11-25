import pandas as pd
import numpy as np
import data_science.quant.markowitz_optimization as markowitz_optimization
from math import floor

# TODO move this to .env
# risk free rate based of historical average of 30d yield
ANNUAL_RISK_FREE_RATE = 0.0153


def round_alpha(alpha):

    # round alpha down to nearest 5% for simplicity in valuing cash position
    # alpha is percent allocated to portfolio, 1-alpha is cash

    if alpha > 1:
        # target volatility is higher than found portfolio:
        # find a solution depending on weighting method
        return 2

    # interesting case: alpha <= 1
    if alpha > 0.975:
        return 0.975
    else:
        return floor(alpha * 20) / 20.0


# TODO change volatility target to range
def calculate_portfolio(ticker_compatibility_df, target_volatility, use_markowitz):

    performance_summaries = pd.read_csv("data_science/quant/sp500_performance_summaries.csv")
    #sp500_tickers = performance_summaries.columns.tolist()

    tickers = ticker_compatibility_df['ticker']
    compatibility_scores = ticker_compatibility_df['compatibility']

    # TODO move this check to filter stocks so it does not return tickers for which we don't have financial data
    # important note: tickers are in the same order in every data source

    n = len(tickers)
    annual_returns = performance_summaries[tickers].iloc[0]

    adjusted_cov_matrix = pd.read_csv(
        "data_science/quant/sp500_adjusted_cov_matrix.csv")
    adjusted_cov_matrix.set_index('ticker', inplace=True)

    true_cov_matrix = pd.read_csv(
        "data_science/quant/sp500_raw_cov_matrix.csv")
    true_cov_matrix.set_index('ticker', inplace=True)

    # keep entries where both tickers are present
    adjusted_cov_matrix = adjusted_cov_matrix.loc[tickers, tickers].to_numpy()
    true_cov_matrix = true_cov_matrix.loc[tickers, tickers].to_numpy()

    if (use_markowitz):

        # keep identified tickers and convert to daily mean log returns
        mean_log_returns = annual_returns/252
        # print(mean_log_returns * 252)

        # daily target returns starting from risk free rate to 20% annually
        # scale to annual for graphing

        # efficiency improvement:
        # calculate fewer target returns in the range most likely to contain the tangency portfolio
        # the tangent portfolio has returns around 15%, only worth calculating target returns in that range
        target_returns = np.linspace(start=0.1/252,
                                     stop=0.25/252, num=20)

        bounds = [0.5/n, 3.0/n]
        #TODO speed up: precalculate the markowitz ideal portfolio for all the combinations of factors
        # then run markowitz again after the client edits their portfolio and chooses to recalculate the weights
        markowitz_portfolios = markowitz_optimization.calculate_optimal_portfolios(true_mean_returns=mean_log_returns,
                                                                                   adjusted_mean_returns=mean_log_returns,
                                                                                   true_cov=true_cov_matrix,
                                                                                   adjusted_cov=adjusted_cov_matrix,
                                                                                   target_returns=target_returns,
                                                                                   annual_risk_free_rate=ANNUAL_RISK_FREE_RATE,
                                                                                   bounds=bounds)

        # idea: calculate the slope of the line between (0, rfr), (point)
        # the steepest slope is the ideal portfolio we want

        # slope = (return - rfr) / volatility
        # same as picking the portfolio with the largest sharpe!

        markowitz_portfolios['slope'] = (
            markowitz_portfolios['annual_return'] - ANNUAL_RISK_FREE_RATE) / markowitz_portfolios['annual_volatility']

        tangent_portfolio_index = markowitz_portfolios['slope'].argmax()

        tangent_portfolio = markowitz_portfolios.iloc[tangent_portfolio_index]

        # interpolate the line between (0, risk_free_rate) and the tangent portfolio
        # target_vol = alpha * tangent_vol + (1-alpha) * 0

        alpha = target_volatility / tangent_portfolio['annual_volatility']

        alpha = round_alpha(alpha)
        
        if alpha < 1:        
            ideal_weights = np.array(alpha * tangent_portfolio['weights']).reshape(n, 1)
        
        # rare case: the client's volatility tolerance is higher than the tangent portfolio
        # find the portfolio with the closest volatility
        # assuming there is a portfolio that high
        else:
            # TODO debug this case giving returns around 5%, not 15+%
            # for the time being, this case never hits as volatility input doesn't go this high
            closest_portfolio_index = markowitz_portfolios.loc[tangent_portfolio_index:, 'annual_volatility'].sub(target_volatility).abs().argmin()
            closest_portfolio = markowitz_portfolios.iloc[closest_portfolio_index]
            print(tangent_portfolio_index, closest_portfolio_index)
            print(closest_portfolio)
            ideal_weights = np.array(closest_portfolio['weights']).reshape(n, 1)

    # not markowitz -> equal weights
    else:
        ideal_weights = np.repeat(1.0/n, n).reshape(n, 1)
        # still want to hit close to the target volatility using cash to reduce volatility
        equal_weights_volatility = np.sqrt(252 * (ideal_weights.T @ true_cov_matrix @ ideal_weights)[0][0])

        alpha = round_alpha(target_volatility / equal_weights_volatility)

        if alpha < 1:
            ideal_weights = ideal_weights * alpha
        # else case: no change to ideal weights

    expected_return = np.dot(ideal_weights.reshape(n,), annual_returns)

    expected_volatility = np.sqrt(252 * 
                                  (ideal_weights.T @ true_cov_matrix @ ideal_weights)[0][0])

    sharpe = (expected_return - ANNUAL_RISK_FREE_RATE) / expected_volatility

    return ideal_weights.tolist(), expected_return, expected_volatility, sharpe
