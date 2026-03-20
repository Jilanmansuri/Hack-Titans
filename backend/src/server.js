require('dotenv').config()

const express = require('express')
const cors = require('cors')
const apiRoutes = require('../routes/api')

const app = express()

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
)
app.use(express.json({ limit: '2mb' }))

app.get('/health', (_req, res) => res.json({ ok: true }))

app.use('/api', apiRoutes)

const port = Number(process.env.PORT || 5000)
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[backend] listening on http://localhost:${port}`)
})

