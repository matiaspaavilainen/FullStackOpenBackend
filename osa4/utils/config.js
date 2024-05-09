require('dotenv').config()

let PORT = process.env.PORT
let MONGO_DB_URI = process.env.MONGO_DB_URI

module.exports = {
    PORT,
    MONGO_DB_URI
}