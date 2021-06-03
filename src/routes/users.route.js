const router = require('express').Router()
const auth = require('../middlewares/auth')
const userController = require('../controllers/users.controller')

router.post('/register', userController.register)
router.post('/login', userController.login)

router.get('/user-info', auth.verifyToken, userController.getUserInfo)

router.get('/protected', auth.verifyToken, (req, res) => {
  res.status(200).json({
    message: "🚀 access granted to protected ressource"
  })
})
// router.get('/:username/profile', auth.verifyToken, userController.getUser)

module.exports = router
