const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log("Give password")
    process.exit(1)
}

const password = process.argv[2]

const DBurl = `mongodb+srv://fullstackopen:${password}@fso.0rutkmo.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=FSO`

mongoose.set('strictQuery', false)
mongoose.connect(DBurl)

const numberSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', numberSchema)

if (process.argv.length == 3) {
    Person
        .find({})
        .then(result => {
            console.log('Phonebook:')
            result.forEach(person => {
                console.log(person)
            });
        })
    mongoose.connection.close()

} else {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
    })

    person.save().then(result => {
        console.log(`Added ${result.name}'s number ${result.number} to phonebook`)
        mongoose.connection.close()
    })
}

