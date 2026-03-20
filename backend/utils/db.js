const mongoose = require('mongoose')

let connectPromise = null

async function connectIfEnabled() {
  const uri = process.env.MONGODB_URI
  if (!uri) return { enabled: false }

  if (!connectPromise) {
    connectPromise = mongoose
      .connect(uri)
      .then(() => ({ enabled: true }))
      .catch((err) => {
        // Fail open: keep app running in demo mode.
        // eslint-disable-next-line no-console
        console.warn('[backend] MongoDB connection failed, using in-memory mode:', err?.message || err)
        return { enabled: false }
      })
  }

  return connectPromise
}

module.exports = { connectIfEnabled }

