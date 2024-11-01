%Omega = xlsread('Returns_Covariance_Matrix_no_RZV.xlsx');
%mu = xlsread('Expected_Returns_no_RZV.xlsx');

Omega = readtable('sp500_covariance_matrix.csv');
data = readtable('sp500_daily_data.csv');

row_tickers = Omega.Properties.VariableNames(2:end); % Exclude the first column header
col_tickers = Omega{:, 1}; % First column as tickers

% Convert the table to a numeric matrix, excluding the first column
Omega = Omega{:, 2:end};

% Group by ticker and calculate the mean of the 'log_return' column
mu = varfun(@mean, data, 'InputVariables', 'log_return', 'GroupingVariables', 'ticker');

% Display the table of ticker means
disp(mu);

p = Portfolio('AssetMean',mu.mean_log_return, 'AssetCovar',Omega,'lb', 0,'budget', 1);
plotFrontier(p, 20);

p = setSolver(p, 'fmincon', 'Display', 'off', 'Algorithm', 'sqp', ...
        'SpecifyObjectiveGradient', true, 'SpecifyConstraintGradient', true, ...
        'ConstraintTolerance', 1.0e-8, 'OptimalityTolerance', 1.0e-8, 'StepTolerance', 1.0e-8); 

weights = estimateMaxSharpeRatio(p)       

te = 0.08;
p = setTrackingError(p,te,weights);

[risk, ret] = estimatePortMoments(p,weights);
hold on
plot(risk,ret,'*r');