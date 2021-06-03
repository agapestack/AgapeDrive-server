const router = require('express').Router()
const auth = require('../middlewares/auth')
const fileController = require('../controllers/file.controller')

router.get('/', fileController.getFiles)
router.get('/:filename', fileController.getFile)
router.get('/streaming/:filename', fileController.streamFile)
router.post('/upload', fileController.uploadFile)




module.exports = router
