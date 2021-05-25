require('dotenv').config()
const mkdirp = require('mkdirp')
const { Users } = require('../config/db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET


module.exports = {
  register: async (req, res, next) => {
    const { username, email, password } = req.body

    bcrypt.hash(password, 12, (err, hashedPassword) => {
      if(err) return res.status(500).json({ error: err.message })
      const newUser = new Users({
        username: username,
        email: email,
        password: hashedPassword,
      })

      newUser.save(function(err) {
        if(err) return res.status(500).json({ error: err.message})

        // CREATE ROOT FOLDER USER
        mkdirp(`./uploads/${username}`, function(err) {
          if(err) return res.status(500).json({ error: err.message })
        })

        return res.status(201).json({ message: "Successfully Registered"})
      })
    })
  },

  login: async (req, res, next) => {
    const { email, password } = req.body

    Users.findOne({ email: email }, (err, user) => {
      if(err) return res.status(500).json({ error: err.message})
      if(!user) return res.status(404).json({ message: "User not found"})

      bcrypt.compare(password, user.password, (err, result) => {
        if(err) return res.status(500).json({ error: err.message })
        if(!result) return res.status(400).json({ message: "Wrong credentials"})

        const payload = {
          _id: user._id,
          username: user.username,
        }
        const token = jwt.sign(payload, JWT_SECRET, {
          expiresIn: "1h"
        })
        // console.log(token)

        return res.status(200).send(token)
      })
    })
  },

  getUser: async (req, res, next) => {
    const username = req.params.username

    Users.find({ username }, (err, user) => {
      if(err) return res.status(500).json({ error: err.message })
      if(!user) return res.status(404).json({ message: "User not found"})

      return res.status(200).json(user)
    })
  },


}

