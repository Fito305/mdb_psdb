const express = require('express')
const neo4j = require('neo4j-driver')

const connectionString = 'bolt://localhost:7687'; // bolt is neo4j's protocol instead of http. :7687 if the default port for neo4j.

const driver = neo4j.driver(connectionString)

async function init() {
    const app = express()

    app.get('/get', async (req, res) => {
        const session = driver.session()
        const results = await session.run(`
        MATCH path = shortestPath(
        (first:Person {name: $person1})-[*]-(Second:Person {name: $person2})
        )
        UNWIND nodes(path) as node
        RETURN coalesce(node.name, node.title) AS text;
        `, {
            person1: req.query.person1,
            person2: req.query.person2
        }) // $person1 and $person2 is a parameterized Query, it prevents Cypher injections which are bad like SQL injections.
           // Person is a label {name: $presonNith} is a property to the label
           // UNWIND is like a for loop

        res.json({
            status: 'ok',
            path: results.records.map(record => record.get('text'))
        }).end()

        await session.close()
    })

    const PORT = 3000
    app.use(express.static('./static'))
    app.listen(PORT)

    console.log("Listening on http://localhost:" + PORT)

}

init()

