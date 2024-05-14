const logger = require('./logger')
const morgan = require('morgan')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

morgan.token('body', function (request) {
    return JSON.stringify(request.body)
})

const requestLogger = morgan(':method :url :status :res[content-length] - :response-time ms :body')

// const requestLogger = (request, response, next) => {
//     console.log('Method:', request.method)
//     console.log('Path:  ', request.path)
//     console.log('Body:  ', request.body)
//     console.log('---')
//     next()
// }

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
    logger.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })

    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })

    } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
        return response.status(400).json({ error: 'expected `username` to be unique' })

    } else if (error.name === 'JsonWebTokenError') {
        return response.status(400).json({ error: 'token invalid or missing' })

    } else if (error.name === 'TokenExpiredError') {
        return response.status(401).json({ error: 'token expired' })

    }

    next(error)
}

const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
        request.token = authorization.replace('Bearer ', '')
        next()
    } else {
        request.token = null
        next()
    }
}

const userExtractor = async (request, response, next) => {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!decodedToken.id) {
        return response.status(401).json({ error: 'invalid token' })
    }
    const user = await User.findById(decodedToken.id)

    if (!user) {
        return response.status(401).json({ error: 'invalid token' })
    }
    request.user = user
    next()
}

module.exports = {
    errorHandler,
    unknownEndpoint,
    requestLogger,
    tokenExtractor,
    userExtractor,
}