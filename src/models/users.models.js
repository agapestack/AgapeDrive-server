const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UsersModel = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    unique: true,
    required: true,
  },

})

module.exports = mongoose.model('Users', UsersModel)
