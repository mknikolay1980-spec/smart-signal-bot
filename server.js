const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.text({ type: '*/*' }));

const PORT = process.env.PORT || 3000;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const SECRET = process.env.SECRET;

app.post('/telegram', async (req, res) => {
  const hamBody = req.body || "";
  console.log('1. HAM BODY:', hamBody);

  let data;
  try {
    data = JSON.parse(hamBody);
  } catch (e) {
    console.log('3. JSON PATLADI:', e.message);
    return res.status(400).send('Bad JSON');
  }

  if (data.secret !== SECRET) {
    console.log('5. SECRET UYUŞMUYOR. Gelen:', data.secret, 'Env:', SECRET);
    return res.status(403).send('Forbidden');
  }

  const actionEmoji = data.action === 'BUY' ? '🟢' : '🔴';
  const typeText = data.type ? ` (${data.type})` : '';
  const chochText = data.is_choch === 'true' ? '\n<b>UYARI:</b> CHoCH - Trend dönüşü olabilir' : '';

  const mesaj = `
${actionEmoji} <b>${data.action} SİNYAL${typeText}</b>
<b>Parite:</b> ${data.ticker}
<b>Entry:</b> ${parseFloat(data.price).toFixed(2)}
<b>SL:</b> ${parseFloat(data.sl).toFixed(2)}
<b>TP1:</b> ${parseFloat(data.tp1).toFixed(2)}
<b>TP2:</b> ${parseFloat(data.tp2).toFixed(2)}
<b>TP3:</b> ${parseFloat(data.tp3).toFixed(2)}${chochText}
<b>Zaman:</b> ${new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}
`;

  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: CHANNEL_ID,
      text: mesaj,
      parse_mode: 'HTML'
    });
    console.log('6. TELEGRAM GÖNDERİLDİ');
    res.status(200).send('OK');
  } catch (err) {
    console.log('7. TELEGRAM HATA:', err.message);
    res.status(500).send('Telegram Error');
  }
});

app.get('/', (req, res) => {
  res.send('SMC Bot Webhook Calisiyor');
});

app.listen(PORT, () => console.log(`Server ${PORT} portunda`));
