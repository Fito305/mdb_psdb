const { promisify } = require('util') // WIll turn node callbacks into a promise based API. Redis doesn't have promises. So unless you plan to do node callbacks this is needed.
const express = require('express')
const redis = require('redis')
const client = redis.createClient()

const rInc = promisify(client.incr).bind(client) // incr is the redis increment method

async function init() {
    const app = express()

    app.get('/pageview', async (req, res) => {
        const views = await rInc('pageviews') // pageviews is the name of the key that is going out to Redis. Incremented number comes back via views variable

        res.json({
            status: 'ok',
            views
        })
    })

    const PORT = 3000
    app.use(express.static('./static'))
    app.listen(PORT)
    console.log(`Running on http://localhost:${PORT}`)
}

init()


