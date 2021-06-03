const mongoose = require('mongoose')
const Schema = mongoose.Schema

const filesSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  access: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    }
  ]
  // thumbnail: {
  //   data: Buffer,
  //   contentType: String,
  // }
})

module.exports = mongoose.model('Files', filesSchema)
