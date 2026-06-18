require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
app.use(bodyParser.json());

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHANNEL = process.env.TELEGRAM_CHANNEL;
const BALANCE = parseFloat(process.env.ACCOUNT_BALANCE) || 2000;
const RISK = parseFloat(process.env.RISK_PCT) || 1.5;
const TP1_RR = parseFloat(process.env.TP1_RR) || 1.5;
const TP2_RR = parseFloat(process.env.TP2_RR) || 2.5;
const TP3_RR = parseFloat(process.env.TP3_RR) || 4.0;

const TELEGRAM_API = https://api.telegram.org/bot${TOKEN};

async function sendTelegram(text) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHANNEL,
      text: text,
      parse_mode: 'HTML'
    })
  });
}

function calcTargets(entry, sl, side) {
  const risk = Math.abs(entry - sl);
  if (side === 'BUY') {
    return {
      tp1: entry + risk * TP1_RR,
      tp2: entry + risk * TP2_RR,
      tp3: entry + risk * TP3_RR
    };
  } else {
    return {
      tp1: entry - risk * TP1_RR,
      tp2: entry - risk * TP2_RR,
      tp3: entry - risk * TP3_RR
    };
  }
}

function calcLot(entry, sl) {
  const riskAmount = BALANCE * (RISK / 100);
  const stopPips = Math.abs(entry - sl) * 10;
  return (riskAmount / stopPips).toFixed(2);
}

app.post('/webhook', async (req, res) => {
  try {
    const { side, entry, sl, symbol = 'XAUUSD' } = req.body;
    
    if (!side  !entry  !sl) {
      return res.status(400).send('Eksik veri: side, entry, sl gerekli');
    }

    const { tp1, tp2, tp3 } = calcTargets(parseFloat(entry), parseFloat(sl), side.toUpperCase());
    const lot = calcLot(parseFloat(entry), parseFloat(sl));

    const msg = `
🚨 <b>YENİ SİNYAL</b> 🚨

<b>Parite:</b> ${symbol}
<b>Yön:</b> ${side.toUpperCase()}
<b>Giriş:</b> ${entry}
<b>SL:</b> ${sl}

<b>TP1:</b> ${tp1.toFixed(2)}  |  <b>Lot:</b> ${lot}
<b>TP2:</b> ${tp2.toFixed(2)}
<b>TP3:</b> ${tp3.toFixed(2)}

<b>Risk:</b> %${RISK}  |  <b>Bakiye:</b> $${BALANCE}
    `;

    await sendTelegram(msg);
    res.status(200).send('Sinyal gönderildi');
  } catch (err) {
    console.error(err);
    res.status(500).send('Hata oluştu');
  }
});

app.get('/', (req, res) => {
  res.send('Smart Signal Bot Aktif ✅');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot ${PORT} portunda çalışıyor`);
});