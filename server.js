require('dotenv').config()
const express = require('express')
const multer = require('multer')
const path = require('path')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')


const router = require('./src/routes/index')


const app = express()

app.use(cors())
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false}))


app.use(router)



const PORT = process.env.PORT || 4545
app.listen(PORT, () => {
  console.log(`Server is listenning on port ${PORT}`)
})
