const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.send('API Router')
})

module.exports = router
