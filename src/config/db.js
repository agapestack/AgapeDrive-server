require('dotenv').config()
const mongoose = require('mongoose')
const connectionOption = {
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  useCreateIndex: true,
}

mongoose.connect(process.env.MONGO_URI, connectionOption)

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log(`connected to db`)
});

// import models
const Users = require('../models/users.models')
const Files = require('../models/files.models')

module.exports = {
  db,
  Users,
  Files,
}

