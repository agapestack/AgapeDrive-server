const router = require('express').Router()
const userRouter = require('./users.route')
const fileRouter = require('./file.route')

router.get('/', (req, res) => {
  return res.status(200).json({
    message: "🎉"
  })
})
router.use('/', userRouter)
router.use('/:username', fileRouter)

module.exports = router
