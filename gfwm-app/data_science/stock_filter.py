import pandas as pd
from math import floor

from functools import reduce


def filter_stocks(user_preferences, count=100, flexibility=0, tickers_only=False):
    
    """
    Filters the ESG dataset based off the user_preferences dict.
    
    Args:
        user_preferences (dict):
        count (int): Unused
        flexibility (int 0 - 100): Percent to extend the acceptable threshold
        tickers_only (boolean): Whether to return a series of only tickers or dataframe with more columns
        
    Returns:
        (Primary dataframes, dict of secondary dataframes): First df: stocks filtered out using user ratings of mid or high importance\n
        dict['factor']: stocks not in primary dataset with high scores in 'factor' and good scores in factors rated mid or high\n
        Note that factors rated as not important are never used for filtering in either primary or secondary data.\n
        Columns: ticker, controversy, environment, social, governance,
        human_rights, community, workforce, product_responsibility, shareholders, management, 
        compatibility

    """

    data = pd.read_csv("../preprocessed_refinitiv.csv")
    
    # primary results come from:
    high_quantile_threshold = 0.6  - flexibility/100.0
    mid_quantile_threshold = 0.4 - flexibility/100.0
    
    compatibility_penalties = {}
    
    # find three quantiles for each factor: 
    #   0: to use when factor is considered in primary result
    #   1: to use when considered in secondary result as high
    #   2: to use when considered in secondary result as mid
    # {factor: (high_importance_quantile, mid_importance_quantile), etc.}
    factor_quantiles = {}
    
    # split the user preferences by primary and secondary
    for factor, value in user_preferences.items():
        mid = data[factor].quantile(mid_quantile_threshold)
        high = data[factor].quantile(high_quantile_threshold)
        
        if value == 10:
            factor_quantiles[factor] = (high, mid, mid) # in secondary results always considered mid
            
            # lose 10 points for lower ranking in important factors
            compatibility_penalties[factor] = 10
        elif value == 5:
            factor_quantiles[factor] = (mid, high, mid)
            # lose less points for lower ranking in mid importance factors
            compatibility_penalties[factor] = 5
        else:
            # don't lose points in factors ranked not important
            compatibility_penalties[factor] = 0

    #calculate compatibility scores for all stocks
    # calculating it after filtering would rank within the filtered results
    # use decile ranks within important columns
    
    def calculate_row_compatibility(row):
        ranks = row.rank(pct=True).values
        #categorize ranks into 10 deciles (9th from top, etc ... up to top): bottom 10%, next 10% etc up to top 10%
        deciles = [9 - min(9, floor(r * 10)) for r in ranks]
        
        #calculate penalties for low deciles in important columns
        #TODO: convert to dot product?
        score = 100
        for idx, factor in enumerate(row.index):
            score -= compatibility_penalties[factor] * deciles[idx]
        return score
        
    
    data['compatibility'] = data[factor_quantiles.keys()].apply(calculate_row_compatibility, axis = 1)
    
    
    # now filter rows that meet the user's criteria
    
    # how to find stocks not in primary list that could be secondary options:
    # top stocks if one mid importance column was high and the rest of (mid and high) were mid
    
    primary_masks = []
    secondary_masks = {}
    for factor, quantiles in factor_quantiles.items():
        
        # use thresholds used for primary filtering
        primary_masks.append(data[factor] >= quantiles[0])
        
        #calculate the masks when the factor is most important and rest are mid importance
        masks = []
        for other_factor in factor_quantiles.keys():
            if(other_factor == factor):
                # treat this factor as high importance
                masks.append(data[factor] >= quantiles[1])
            else:
                # treat all others as mid importance
                masks.append(data[factor] >= quantiles[2])
        secondary_masks[factor] = masks        
    
    # combine masks using element-wise AND
    primary_combined_mask = reduce(lambda mask1, mask2: [el1 and el2 for el1, el2 in zip(mask1, mask2)],
                                   primary_masks)
    primary_filtered_data = data[primary_combined_mask].reset_index(drop=True)

    if (tickers_only):
        return primary_filtered_data['ticker']
    
    # combine secondary masks using element-wise AND
    secondary_combined_masks = {factor: reduce(lambda mask1, mask2: [el1 and el2 for el1, el2 in zip(mask1, mask2)], 
                                     masks) for factor, masks in secondary_masks.items()}
    
    # secondary masks should not include anything in primary
    secondary_combined_masks = {factor: [m2 and not m1 for m1, m2 in zip(primary_combined_mask, combined_mask)]
                                         for factor, combined_mask in secondary_combined_masks.items()}
    
    secondary_filtered_data = {factor: data[mask].reset_index(drop = True) for factor, mask in secondary_combined_masks.items()}
    
    return primary_filtered_data, secondary_filtered_data

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
