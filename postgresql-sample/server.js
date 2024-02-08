const express = require('express')
const { Pool } = require('pg')

const pool = new Pool({
    connectionString:
    "postgresql://postgres:mysecretpassword@localhost:/name_of_the_database"
});

async function init() {
    const app = espress()

    app.get('/get', async (req, res) => {
        const client = await pool.connect()
        const [ commentRes, boardRes] = await Promise.all([
            client.query(
                "SELECT  * FROM db_collection NATURAL LEFT JOIN table_or_document WHERE something_id = $1", 
                [req.query.search] // prevents SQL Injection attacks. Via 'Parameterized Query $1'
            ),
            client.query(
                "SELECT * FROM db_collection WHERE something_id = $1",
                [req.query.search] // prevents SQL Injection attacks. Via 'Parameterized Query $1'
            ), 
        ]);

        res.json({
            status: 'ok',
            boards: boardRes.rows[0] || {},
            post: commentRes.rows || []
        });
    });

    const PORT = 3000;
    app.use(express.static("./static"))
    app.listen(PORT)

    console.log(`running on http://localhost:${PORT}`)

}

init()




