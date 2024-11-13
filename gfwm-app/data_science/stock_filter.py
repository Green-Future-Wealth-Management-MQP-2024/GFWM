import pandas as pd
import os
from functools import reduce


'''
user_preferences: dict of {feature: importance}
                environment, human_rights, workforce, 
                product_responsibility, shareholders, community, governance
count: how many tickers to return
flexibility: % by which to extend acceptable ranges. ex: 20 allows 20% more values
'''


def filter_stocks(user_preferences, count=100, flexibility=0, tickers_only=False):

    # sort user preferences in order of decreasing importance
    sorted_user_preferences = sorted(user_preferences.items(),
                                     key=lambda item: item[1],
                                     reverse=True)

    data = pd.read_csv("../preprocessed_refinitiv.csv")

    quantile_threshold = 0.65 * (1 - flexibility/100.0)

    # pair[0] is the name of the factor (column)
    top_3_factors = {pair[0]: data[pair[0]].quantile(quantile_threshold)
                     for pair in sorted_user_preferences[:3]}

    # print(top_3_factors)

    # filter rows where the selected factors are higher than their quantiles
    masks = [data[factor[0]] >= factor[1] for factor in top_3_factors.items()]
    # combine masks using element-wise AND
    combined_mask = reduce(lambda mask1, mask2: [
                           el1 and el2 for el1, el2 in zip(mask1, mask2)], masks)
    filtered_data = data[combined_mask].reset_index(drop=True)

    if (tickers_only):
        return filtered_data['ticker']

    return filtered_data

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
test_dict = {'environment':10, 
             'human_rights': 10,  
             'workforce':1,
             'product_responsibility':5,
             'shareholders':1,
             'community':10,
             'governance':5}
print(filter_stocks(test_dict, tickers_only=True))
'''
