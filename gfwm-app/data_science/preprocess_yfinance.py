import pandas as pd
import yfinance as yf

data = pd.read_csv("SP 500 ESG Risk Ratings.csv")
data = data.dropna()

# Gets unique stock symbols from the data
unique_symbols = data['Symbol'].unique()

# Creates a dictionary to store the 5-year growth estimates data for each unique symbol
growth_estimates_data = {}

# Loops through each unique symbol to get the growth estimate over the next 5 years
for symbol in unique_symbols:
    stock = yf.Ticker(symbol)
    
    # Retrieves growth estimates data from yfinance
    growth_estimates = stock.growth_estimates
    
    # Checks if growth estimates data is available
    if growth_estimates is not None and '+5y' in growth_estimates.index:
        # Extracts the growth estimate for the next 5 years in the 'stock' column
        growth_5y = growth_estimates.loc['+5y', 'stock']
        
        # Stores the growth estimate in the dictionary
        growth_estimates_data[symbol] = growth_5y
    else:
        growth_estimates_data[symbol] = None
        
# Converts the growth estimates data into a DataFrame
growth_estimates_df = pd.DataFrame.from_dict(growth_estimates_data, orient='index', columns=['Growth Estimate (+5 years)'])

# Merges the growth estimates data with the original data 
data = data.merge(growth_estimates_df, left_on='Symbol', right_index=True)

# Save the DataFrame to a CSV file
data.to_csv('preprocess.csv', index=False)  # Set index=False to avoid writing row indices