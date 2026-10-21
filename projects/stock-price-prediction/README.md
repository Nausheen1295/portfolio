# Stock Price Prediction — Minor Project

Forecasting Apple (AAPL) next-day closing prices with machine learning and deep learning, and testing honestly whether the forecasts are useful.

## Files
| File | Purpose |
|---|---|
| `Stock_Price_Prediction.ipynb` | Full project notebook, already run, with all outputs and charts |
| `stock_prices.csv` | Dataset: daily adjusted closing prices, 3 Jan 2007 – 1 Mar 2016 (AAPL, MSFT, IBM, SBUX, S&P 500) |
| `requirements.txt` | Python packages needed |

## Dataset
Public Yahoo Finance daily price extract (2,306 trading days), mirrored at
`https://raw.githubusercontent.com/plotly/datasets/master/stockdata.csv`. The notebook downloads it automatically if the CSV is missing.

To use a Kaggle dataset instead, put the CSV next to the notebook and edit `CSV_PATH`, `DATE_COL`, `TARGET_COL` and `MARKET_COL` in Section 2.

## How to run
**Google Colab:** upload the notebook and CSV, uncomment the `pip install` line in the first code cell, then *Runtime → Run all*.

**Locally:**
```bash
pip install -r requirements.txt
jupyter notebook Stock_Price_Prediction.ipynb
```
Runs in about a minute on a normal laptop CPU (no GPU needed).

## Method
1. Exploratory data analysis: trends, return distribution, volatility, correlations, autocorrelation
2. 20 features: lagged returns, moving-average gaps, momentum, volatility, RSI, S&P 500 returns
3. Chronological split: train 70 % (2007–2013), validation 15 %, test 15 % (Oct 2014 – Feb 2016)
4. Models predict **next-day return**; price = today's close × (1 + predicted return)
5. Models: Naive and Drift baselines, Ridge Regression, Random Forest, LSTM (Keras)
6. Metrics: RMSE, MAE, MAPE, R², directional accuracy, binomial significance test, trading simulation

## Results (test set, 339 days)
| Model | RMSE ($) | MAE ($) | MAPE (%) | Directional acc. (%) |
|---|---|---|---|---|
| Naive (tomorrow = today) | 1.903 | 1.446 | 1.281 | – |
| Drift (avg. return) | 1.910 | 1.454 | 1.288 | 48.7 |
| Ridge Regression | 1.911 | 1.455 | 1.289 | 48.7 |
| Random Forest | 1.911 | 1.444 | 1.281 | **53.4** |
| LSTM | 1.923 | 1.459 | 1.294 | 49.3 |

**Conclusion:** no model beat the naive baseline on RMSE. Random Forest predicted direction best (53.4 %), but this is not statistically significant (p ≈ 0.12). The results support the Efficient Market Hypothesis: past prices alone carry very little information about tomorrow's move. Exact LSTM figures can vary slightly between machines.

*Educational project only, not financial advice.*
