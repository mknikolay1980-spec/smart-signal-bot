const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.WEBHOOK_SECRET || 'smart_signal_2026';
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHANNEL = process.env.TELEGRAM_CHANNEL;
const ACCOUNT_BALANCE = parseFloat(process.env.ACCOUNT_BALANCE) || 2000;
const RISK_PCT = parseFloat(process.env.RISK_PCT) || 1.5;
const TP1_RR = parseFloat(process.env.TP1_RR) || 1.5;
const TP2_RR = parseFloat(process.env.TP2_RR) || 2.5;
const TP3_RR = parseFloat(process.env.TP3_RR) || 4.0;
const DOMAIN = 'https://web-production-6acc4.up.railway.app';

const bot = new TelegramBot(TELEGRAM_TOKEN);
bot.setWebHook(`${DOMAIN}/telegram`);

app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

app.post('/telegram', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

function calcLot(entry, sl) {
  const riskUsd = ACCOUNT_BALANCE * (RISK_PCT / 100);
  const slDiff = Math.abs(entry - sl);
  const lot = riskUsd / (slDiff * 100);
  return lot.toFixed(2);
}

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `Smart Signal Komutan aktif.\nBakiye: $${ACCOUNT_BALANCE}\nRisk: %${RISK_PCT}\n\n/sinyal ile test et.`);
});

bot.onText(/\/sinyal/, async (msg) => {
  const entry = 2650.00;
  const sl = 2640.00;
  const lot = calcLot(entry, sl);
  const tp1 = entry + (entry - sl) * TP1_RR;
  const tp2 = entry + (entry - sl) * TP2_RR;
  const tp3 = entry + (entry - sl) * TP3_RR;

  const sinyal = `🚨 XAUUSD AL SİNYALİ 🚨\n\nGiriş: ${entry}\nSL: ${sl}\nTP1: ${tp1.toFixed(2)}\nTP2: ${tp2.toFixed(2)}\nTP3: ${tp3.toFixed(2)}\n\nLot: ${lot} | Risk: %${RISK_PCT}\nBakiye: $${ACCOUNT_BALANCE}\n\nSmart Signal Komutan`;

  try {
    await bot.sendMessage(TELEGRAM_CHANNEL, sinyal);
    bot.sendMessage(msg.chat.id, 'Sinyal kanala gönderildi ✅');
  } catch (err) {
    bot.sendMessage(msg.chat.id, 'HATA: Botu kanala admin yapmadın komutan.');
  }
});

app.listen(PORT, () => console.log(`Bot ${PORT} portunda çalışıyor`));
