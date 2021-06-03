const router = require('express').Router()
const userRouter = require('./users.route')
const fileRouter = require('./file.route')

const auth = require('../middlewares/auth')

// router.get('/', (req, res) => {
//   return res.status(200).json({
//     message: "🎉"
//   })
// })
router.use('/', userRouter)
router.use('/:username', auth.verifyToken, fileRouter)


router.use((err, req, res, next) => {
  if(err){
    console.log(err.message)
    return res.status(500).json({ error: true, message: err.message })
  }
})

module.exports = router
