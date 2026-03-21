const express = require('express')
const router = express.Router()
const { extractFromLinkedIn } = require('../controllers/linkedinController')

router.post('/extract', extractFromLinkedIn)

module.exports = router
