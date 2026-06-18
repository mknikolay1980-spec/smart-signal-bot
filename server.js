const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;
const SECRET = process.env.SECRET || 'smart_signal_2026';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL = process.env.TELEGRAM_CHANNEL;

// TradingView sends Content-Type: text/plain — parse as text, then JSON.parse manually
app.post('/telegram', express.text({ type: '*/*' }), async (req, res) => {
    let data;
    try {
        data = JSON.parse(req.body);
    } catch (e) {
        console.error('Body parse error:', req.body);
        return res.status(400).send('Invalid JSON');
    }

    if (data.secret !== SECRET) {
        console.log('Invalid secret:', data.secret);
        return res.status(403).send('Forbidden');
    }

    console.log('Signal received:', data);

    const message = `🔔 NEW SIGNAL 🔔\n\nSymbol: ${data.symbol}\nDirection: ${data.action}\nEntry: ${data.entry}\nSL: ${data.sl}\nTP1: ${data.tp1}\nTP2: ${data.tp2}\nTP3: ${data.tp3}`;

    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: TELEGRAM_CHANNEL,
            text: message
        });
        console.log('Message sent to Telegram');
        res.status(200).send('OK');
    } catch (error) {
        console.error('Telegram API Error:', error.response?.data);
        res.status(500).send('Telegram Error');
    }
});

app.get('/', (req, res) => {
    res.send('Bot is Running. Webhook: /telegram');
});

app.listen(PORT, () => console.log(`Bot running on port ${PORT}`));
