import pandas as pd
import numpy as np

timeseries = pd.read_csv("data_science/quant/sp500_timeseries_13-24.csv")

tickers = timeseries.columns[1:].values

#print(tickers)

# for every ticker, figure out the first day present in the dataset
# then cov (A, B) will take only the data that is present for both A and B
first_valid_indices = [timeseries[tickers[i]].first_valid_index() for i in range(len(tickers))]

def covariance(x, y):
    x_bar = np.mean(x)
    y_bar = np.mean(y)
    return np.sum((x - x_bar) * (y - y_bar)) / (len(x) - 1)

# empty cov matrix to be filled with nested for loop
cov_matrix = pd.DataFrame(np.nan, index=tickers, columns=tickers)

for i in range(len(tickers)):
    for j in range(i, len(tickers)):  # Loop over upper triangle

        # start at the later date after which both tickers have data
        start = max(first_valid_indices[i], first_valid_indices[j])
        
        cov_matrix.iloc[i, j] = cov_matrix.iloc[j, i] = covariance(timeseries.iloc[start:, i+1], # add 1 since first column contains dates
                                                                   timeseries.iloc[start:, j+1])

eigenvalues = np.linalg.eigvals(cov_matrix)

is_positive_semidefinite = np.all(eigenvalues >= 0)

print("Cov matrix positive semidefinite?", is_positive_semidefinite)

    
cov_matrix.to_csv("data_science/quant/sp500_cov_matrix.csv", index=True)
