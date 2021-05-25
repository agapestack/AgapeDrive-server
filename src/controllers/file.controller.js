const multer = require('multer')
const util = require("util")
const fs = require('fs')
const path = require('path')
const { readdir } = require('fs/promises')
const slugify = require('slugify')


module.exports = {
  uploadFile: async (req, res, next) => {
    const DIR = `${__dirname}/../../uploads/${req.username}`

    const storage = multer.diskStorage(
      {
        destination: DIR,
        filename: function (req, file, cb) {
          cb( null, slugify(file.originalname, '-') )
        }
      }
    )

    const upload = multer({ storage: storage}).single( 'file' )

    const uploadPromise = util.promisify(upload)

    try {
      await uploadPromise(req, res)

      if (req.file == undefined) {
        return res.status(400).send({ message: "Please upload a file!" });
      }

      res.status(200).send({ message: "Uploaded the file successfully: " + req.file.originalname })

    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  getFiles: async (req, res, next) => {
    const DIR = `${__dirname}/../../uploads/${req.username}`

    try {
      const fileList = []
      const files = await readdir(DIR);
      for(const file of files) {
        // console.log(file)
        fileList.push(file)
      }
      return res.status(200).json({ files: fileList })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
    return res.sendStatus(500)
  },

  getFile: async (req, res, next) => {
    const DIR = `${__dirname}/../../uploads/${req.username}`
    const filename = req.params.filename

    const filePath = DIR + "/" + filename
    // console.log(filePath)
    const file = fs.readFileSync(filePath, 'binary')

    res.setHeader('Content-Length', file.length);
    res.write(file, 'binary');
    res.end()
  },

  streamFile: async (req, res, next) => {
    const DIR = `${__dirname}/../../uploads/${req.username}`
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