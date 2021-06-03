const multer = require('multer')
const util = require("util")
const fs = require('fs')
const path = require('path')
const { readdir } = require('fs/promises')
const slugify = require('slugify')
const { Files } = require('../config/db')


module.exports = {
  uploadFile: async (req, res, next) => {
    const DIR = `${__dirname}/../../uploads/${req.userInfo.username}`

    const storage = multer.diskStorage(
      {
        destination: DIR,
        filename: function (req, file, cb) {
          cb( null, slugify(file.originalname, '-') )
        }
      }
    )
    req.userInfo._id

    const upload = multer({ storage: storage}).single( 'file' )

    console.log('uploading...')

    const uploadPromise = util.promisify(upload)

    try {
      await uploadPromise(req, res)

      if (req.file == undefined) {
        return res.status(400).send({ error: true, message: "Please upload a file!" });
      }

      const newFile = new Files({
        name: slugify(req.file.originalname, '-'),
        size: req.file.size,
        mimetype: req.file.mimetype,
        owner: req.userInfo._id,
      })

      newFile.save(function(err) {
        if(err) return res.status(500).json({ error: true, data: err})
        return res.status(200).send({ message: "Uploaded the file successfully: " + req.file.originalname })
      })

    } catch (err) {
      return res.status(200).json({ error: true, message: err.message, data: err })
    }
  },

  getFiles: async (req, res, next) => {
    Files.find({ owner: req.userInfo._id }, (err, userFiles) => {
      if(err) return res.status(500).json({ error: true, data: err })

      return res.status(200).json({ data: userFiles, message: "success" })
    })
  },

  getFile: async (req, res, next) => {
    const DIR = `${__dirname}/../../uploads/${req.userInfo.username}`
    const filename = req.params.filename

    const filePath = DIR + "/" + filename
    // console.log(filePath)
    const file = fs.readFileSync(filePath, 'binary')

    res.setHeader('Content-Length', file.length);
    res.write(file, 'binary');
    res.end()
  },

  streamFile: async (req, res, next) => {
    const DIR = `${__dirname}/../../uploads/${req.userInfo.username}`
    const videoName = req.params.filename

    const videoPath = DIR + "/" + videoName
    console.log(videoPath)
    
    fs.stat(videoPath, (err, stat) => {

      // Handle file not found
      if (err !== null && err.code === 'ENOENT') {
          res.sendStatus(404);
      }
  
      const fileSize = stat.size
      const range = req.headers.range
  
      if (range) {
  
          const parts = range.replace(/bytes=/, "").split("-");
  
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
          
          const chunksize = (end-start)+1;
          const file = fs.createReadStream(videoPath, {start, end});
          const head = {
              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunksize,
              'Content-Type': 'video/mp4',
          }
          
          res.writeHead(206, head);
          file.pipe(res);
      } else {
          const head = {
              'Content-Length': fileSize,
              'Content-Type': 'video/mp4',
          }
  
          res.writeHead(200, head);
          fs.createReadStream(videoPath).pipe(res);
      }
    })

  },


}