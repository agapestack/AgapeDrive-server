require('dotenv').config()
const mkdirp = require('mkdirp')
const { Users } = require('../config/db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET
const { s3 }= require('../config/s3')

// TODO Sanitize stuff


module.exports = {
  register: async (req, res, next) => {
    // console.log(req.body)
    const { username, email, password } = req.body

    if(!username || !email || !password) {
      return res.status(400).json({ error: true, message: "Field misssing!"})
    }
    console.log("registering")
    bcrypt.hash(password, 12, (err, hashedPassword) => {
      if(err) next(err)
      const newUser = new Users({
        username: username,
        email: email,
        password: hashedPassword,
      })

      newUser.save(function(err) {
        if(err) {
          console.log(err.message)
          return res.status(400).json({ error: true, message: err.message, data: err })
        }

        // CREATE ROOT FOLDER USER --> LOCAL STORAGE
        mkdirp(`./uploads/${username}`, function(err) {
          if(err) {
            Users.deleteOne({ username: username}, function(err) {
              if(err) return res.status(500).json({ error: true, data: err, message: "Failed to delete user in mongoDB"})
            })
          }

          res.status(200).json({ message: "register success"})
        })

        //AWS S3
        // const params = {
        //   Key: `${username}/`,
        //   Bucket: process.env.AWS_BUCKET_NAME,
        //   Body: ''
        // }
        
        // s3.upload(params, function(err, data) {
        //   if(err) {
            // Users.deleteOne({ username: username}, function(err) {
            //   if(err) return res.status(500).json({ error: true, data: err, message: "Failed to delete user in mongoDB"})
            // })
        //     return res.status(500).json({ error: true, data: err, message: "S3 upload failed." })
        //   }
        //   console.log(data)
        //   res.status(200).json({ message: "register success"})
        // })

      })
    })
  },

  login: async (req, res, next) => {
    // console.log(req.body)
    const { email, password } = req.body

    if(!email || !password) {
      return res.status(400).json({ error: true, message: "Invalid form"})
    }

    Users.findOne({ email: email }, (err, user) => {
      if(err) next()
      if(!user) return res.status(400).json({ 
        error: true,
        message: "User not found",
      })

      bcrypt.compare(password, user.password, (err, result) => {
        if(err) next()
        if(!result) return res.status(400).json({ 
          error: true,
          message: "Wrong credentials"
        })

        // console.log(user)

        const payload = {
          _id: user._id,
          username: user.username,
        }
        const token = jwt.sign(payload, JWT_SECRET, {
          expiresIn: '30m'
        })

        // res.cookie('token', token, {
        //   expires: new Date(Date.now() + 1000 * 60 * 60),
        //   secure: false,
        //   httpOnly: true,
        // })
        // console.log(token)

        return res.status(200).json({
          message: "success login",
          token,
          expiresIn: 1000 * 60 * 30,
          data: {
            user: user.username,
          }
        })
      })
    })
  },

  getUserInfo: async (req, res, next) => {
    if(!req.userInfo) return res.status(200).json({error: true, message: "Authentication failed"})
    const { _id, username } = req.userInfo

    Users.findById({ _id }, (err, user) => {
      if(err) return res.status(200).json({ error: true, error: err.message, data: err })
      if(!user) return res.status(200).json({ error: true, message: "User not found"})


      return res.status(200).json({ 
        user: user.username,
      })
    })
  },

}

