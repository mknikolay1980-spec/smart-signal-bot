import os
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
TELEGRAM_CHANNEL = os.getenv("TELEGRAM_CHANNEL")
TWELVEDATA_KEY = os.getenv("TWELVEDATA_KEY")
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET")

SYMBOLS = ["XAU/USD", "DJI"]
TF_TRIGGER = "15min"
TF_SETUP = "1h"
TF_TREND = "4h"

# Sinyal Filtreleri
MIN_SCORE = 2
RR_LEVELS = [1, 2, 3]
