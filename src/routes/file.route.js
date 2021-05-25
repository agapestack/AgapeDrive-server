const router = require('express').Router()
const auth = require('../middlewares/auth')
const fileController = require('../controllers/file.controller')

router.use('', auth.verifyToken)

router.post('/upload', fileController.uploadFile)

module.exports = router
