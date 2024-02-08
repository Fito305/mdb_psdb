const express = require('express')
const { mongoClient } = require('mongodb')

const connectionString = 'mongodb://localhost:27017'; // Default server for moongodb

async function init() {
    
    const client = new mongoClient(
        connectionString, {
            useUnifiedTopology: true
        });

    await client.connect();

    const app = express()

    app.get('/get', async (req, res) => {
        const db = await client.db("adoption") //Name of database

        const collection = db.collection("pet") // Database collection

        const pets = await collection.fin({
            $text: { $search: req.query.search }
        },
            { _id: 0 }
        )
        .sort( { score: {$meta: "textScore" } })
        .limit(10)
        .toArray()

        res.json( {status: "ok", pets: pets }).end()
    
    })

    const PORT = 3000
    app.use(express.static('./static'))
    app.listen(PORT)
    console.log(`running on http://localhost${PORT}`)

}

init()
