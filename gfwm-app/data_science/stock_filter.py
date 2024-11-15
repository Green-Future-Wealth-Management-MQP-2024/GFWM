import pandas as pd
from functools import reduce


def filter_stocks(user_preferences, count=100, flexibility=0, tickers_only=False):
    
    """
    Filters the ESG dataset based off the user_preferences dict.
    
    Args:
        user_preferences (dict):
        count (int): Unused
        flexibility (int 0 - 100): Percent to extend the acceptable threshold
        tickers_only (boolean): Whether to return a series of tickers or dataframe with more columns
        
    Returns:
        (Primary dataframes, list of secondary dataframes): First df: stocks that meet all most important ESG preferences\n
        Second df onwards: stocks that meet secondary ESG preferences\n
        Columns: ticker, controversy, environment, social, governance,
        human_rights, workforce, product_responsibility, shareholders, community

    """

    data = pd.read_csv("../preprocessed_refinitiv.csv")

    quantile_threshold = 0.6 * (1 - flexibility/100.0)
    
    #select the factors that have a value of 10
    top_factors = {factor:data[factor].quantile(quantile_threshold) for factor, value in user_preferences.items() if value == 10}
    # print(top_factors)

    # filter rows where the selected factors are higher than their quantiles
    masks = [data[factor] >= quantile for factor, quantile in top_factors.items()]
    
    # combine masks using element-wise AND
    combined_mask = reduce(lambda mask1, mask2: [
                           el1 and el2 for el1, el2 in zip(mask1, mask2)], masks)
    primary_filtered_data = data[combined_mask].reset_index(drop=True)

    if (tickers_only):
        return primary_filtered_data['ticker']

    return primary_filtered_data

# only returns tickers
def filter_stocks_mass(user_preference_dicts, count=100, flexibility=0):

    data = pd.read_csv("../preprocessed_refinitiv.csv")

    quantile_threshold = 0.6 * (1 - flexibility/100.0)
    factors = ["environment", "human_rights", "workforce", 
               "product_responsibility", "shareholders", "community", "governance"]
    quantiles = {factor: data[factor].quantile(quantile_threshold) for factor in factors}
    
    result = []
    
    for user_preference_dict in user_preference_dicts:
        
        #select the factors that have a value of 10
        top_factors = {factor:quantiles[factor] for factor, value in user_preference_dict.items() if value == 10}

        # filter rows where the selected factors are higher than their quantiles
        masks = [data[factor] >= quantile for factor, quantile in top_factors.items()]
        # combine masks using element-wise AND
        combined_mask = reduce(lambda mask1, mask2: [
                            el1 and el2 for el1, el2 in zip(mask1, mask2)], masks)
        selected_tickers = data[combined_mask].reset_index(drop=True)['ticker']
        
        combination = ', '.join(top_factors.keys())
        result.append((combination, selected_tickers))

    return result

'''
TODO add compatibility score to filter_stocks return type

    # Calculates a compatibility score based off esg, annual returns, and risk (ranking of sd)
    data['compatibility_score'] = data['combined esg'] + 8 * data['annual_return'] - 0.2 * data['sd']
  
    # Top 100
    top_100 = sorted_data.head(100)

    # Average ESG Score for the top 100 companies
    avg_esg = top_100['combined esg'].mean()

    # Average Annual Return for the top 100 companies
    avg_return = top_100['annual_return'].mean()

    volatility = top_100['sd'].mean()

    result = {
        'top_100': sorted_data[['ticker', 'name', 'annual_return', 'years_index', 'sd', 'compatibility_score', 'esg', 'environment', 'social', 'governance']].to_dict(orient='records'),
        'avg_esg': avg_esg,
        'avg_return': avg_return,
        'volatility': volatility
    }


    # Shows the top companies that match user preferences
    # TODO clear up output
    # idea: print symbol, name, portfolio weight, past return, past risk
    return(result)
'''

'''
test_dict = {'environment':10, 
             'human_rights': 10,  
             'workforce':1,
             'product_responsibility':5,
             'shareholders':1,
             'community':10,
             'governance':5}
print(filter_stocks(test_dict, tickers_only=True))
'''
