const router = require('express').Router()
const auth = require('../middlewares/auth')
const userController = require('../controllers/users.controller')

router.post('/register', userController.register)
router.post('/login', userController.login)

router.get('/:username/profile', auth.verifyToken, userController.getUser)

module.exports = router
