const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.WEBHOOK_SECRET || 'smart_signal_2026';
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHANNEL = process.env.TELEGRAM_CHANNEL;

// TradingView webhook endpoint
app.post('/telegram', async (req, res) => {
    const data = req.body;
    
    // Security check
    if (data.secret !== VERIFY_TOKEN) {
        console.log('Invalid secret:', data.secret);
        return res.status(403).send('Forbidden');
    }
    
    console.log('Signal Received:', data);
    
    // Format message for Telegram
    const message = `🔔 NEW SIGNAL 🔔\n\nSymbol: ${data.symbol}\nDirection: ${data.action}\nEntry: ${data.entry}\nSL: ${data.sl}\nTP1: ${data.tp1}\nTP2: ${data.tp2}\nTP3: ${data.tp3}`;
    
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
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

// Health check endpoint
app.get('/', (req, res) => {
    res.send('Bot is Running. Webhook: /telegram');
});

app.listen(PORT, () => console.log(`Bot running on port ${PORT}`));