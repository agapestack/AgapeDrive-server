const multer = require('multer')
const util = require("util");


module.exports = {
  uploadFile: async (req, res, next) => {
    const DIR = `${__dirname}/../../uploads/${req.username}`

    const storage = multer.diskStorage(
      {
        destination: DIR,
        filename: function (req, file, cb) {
          cb( null, file.originalname )
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


}