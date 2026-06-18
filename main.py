import os
import hmac
import requests
from fastapi import FastAPI, Request, HTTPException

app = FastAPI()

PORT = int(os.getenv("PORT", 8000))

TELEGRAM_TOKEN = os.environ["TELEGRAM_TOKEN"]
TELEGRAM_CHANNEL = os.environ["TELEGRAM_CHANNEL"]
TWELVEDATA_KEY = os.environ["TWELVEDATA_KEY"]
WEBHOOK_SECRET = os.environ["WEBHOOK_SECRET"]

TELEGRAM_API = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}"


def send_message(chat_id: str | int, text: str) -> None:
    requests.post(
        f"{TELEGRAM_API}/sendMessage",
        json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"},
        timeout=10,
    )


def get_btc_price() -> str:
    url = "https://api.twelvedata.com/price"
    params = {"symbol": "BTC/USD", "apikey": TWELVEDATA_KEY}
    resp = requests.get(url, params=params, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    if "price" not in data:
        raise ValueError(data.get("message", "TwelveData hatası"))
    price = float(data["price"])
    return f"<b>BTC/USD Anlık Fiyat</b>\n💰 <code>${price:,.2f}</code>"


def verify_secret(request: Request) -> None:
    token = request.headers.get("X-Telegram-Bot-Api-Secret-Token", "")
    if not hmac.compare_digest(token, WEBHOOK_SECRET):
        raise HTTPException(status_code=403, detail="Forbidden")


@app.get("/")
async def health():
    return {"status": "ok", "bot": "smart-signal-bot"}


@app.post("/webhook")
async def webhook(request: Request):
    verify_secret(request)

    update = await request.json()
    message = update.get("message") or update.get("channel_post")
    if not message:
        return {"ok": True}

    chat_id = message["chat"]["id"]
    text = message.get("text", "")

    if text.startswith("/start"):
        send_message(
            chat_id,
            "Merhaba! 👋\n"
            "Kullanılabilir komutlar:\n"
            "/start — bu mesaj\n"
            "/sinyal — BTC/USD anlık fiyat",
        )

    elif text.startswith("/sinyal"):
        try:
            msg = get_btc_price()
        except Exception as exc:
            msg = f"Fiyat alınamadı: {exc}"
        send_message(chat_id, msg)

    return {"ok": True}
