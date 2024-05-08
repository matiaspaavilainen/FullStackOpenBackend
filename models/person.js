const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGO_DB_URI

console.log('Connecting to ', url)
mongoose.connect(url)
    .then(result => {
        console.log('connected to mongo')
    })
    .catch((error) => {
        console.log("error: ", error.message)
    })

function validator (val) {
    const number = val.split('-')
    if (number.length == 2) {
        if ((number[0].length == 2 || number[0].length == 3)) {
            return true
        }
    }
    return false
}

const numberValidator = [validator, 'Number format is incorrect']

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        required: true,
    }, 
    number: {
        type: String,
        minlength: 8,
        validate: numberValidator,
        required: true,
    },
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)