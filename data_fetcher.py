import requests
import pandas as pd
from config import TWELVEDATA_KEY

BASE_URL = "https://api.twelvedata.com/time_series"

def get_ohlc(symbol, interval, outputsize=200):
    params = {
        "symbol": symbol,
        "interval": interval,
        "outputsize": outputsize,
        "apikey": TWELVEDATA_KEY
    }
    r = requests.get(BASE_URL, params=params, timeout=10)
    data = r.json()
    if "values" not in data:
        return None
    df = pd.DataFrame(data["values"])
    df = df.iloc[::-1].reset_index(drop=True)
    df["datetime"] = pd.to_datetime(df["datetime"])
    for col in ["open", "high", "low", "close"]:
        df[col] = df[col].astype(float)
    return df

def get_multi_tf_data(symbol):
    return {
        "4h": get_ohlc(symbol, "4h", 100),
        "1h": get_ohlc(symbol, "1h", 100),
        "15min": get_ohlc(symbol, "15min", 100)
    }
