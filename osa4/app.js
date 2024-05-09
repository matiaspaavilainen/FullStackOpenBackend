const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')

const blogsRouter = require('./controllers/blogs')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGO_DB_URI)

mongoose.connect(config.MONGO_DB_URI)
    .then(() => {
        logger.info('connected to MONGODB')
    })
    .catch((error) => {
        logger.error('error connecting to MONGODB', error.message)
    })

app.use(cors())
//app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)
app.use('/api/blogs', blogsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app