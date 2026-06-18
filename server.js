const express = require('express')
const app = express()

app.use(express.text({ type: '*/*' }))

app.post('/telegram', async (req, res) => {
  console.log('1. HAM BODY:', req.body)
  console.log('2. ENV SECRET:', process.env.SECRET)

  let data
  try {
    data = JSON.parse(req.body)
  } catch(e) {
    console.log('3. JSON PATLADI:', e.message)
    return res.status(400).send('Bad JSON')
  }

  console.log('4. PARSE DATA:', data)

  if(data.secret !== process.env.SECRET) {
    console.log('5. SECRET UYUŞMUYOR. Gelen:', data.secret, 'Env:', process.env.SECRET)
    return res.status(403).send('Forbidden')
  }

  const msg = `📊 ${data.symbol} ${data.action}\nEntry: ${data.entry}\nSL: ${data.sl}\nTP1: ${data.tp1}`

  try {
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHANNEL, text: msg })
    })
    console.log('6. TELEGRAM GÖNDERİLDİ')
    res.status(200).send('OK')
  } catch(err) {
    console.log('7. TELEGRAM HATA:', err)
    res.status(500).send('TG Error')
  }
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log(`Bot running on port ${PORT}`))
