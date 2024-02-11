const { promisify } = require('util') // Will turn node callbacks into a promise based API.
//Redis doesn't have promises. So unless you plan to do node callbacks this is needed.
const express = require('express')
const redis = require('redis')
const client = redis.createClient()

const rInc = promisify(client.incr).bind(client) // incr, get and setex are redis methods
const rGet = promisify(client.get).bind(client)
const rSetex = promisify(client.setex).bind(client)

// CACHE STRATEGY - ONLY USE WHEN NEEDED CAN BE HARD TO DEBUG
function cache(key, ttl, slowFn) {
    return async function cachedFn(...props) {
        const cachedResponse = await rGet(key)
        if (cachedResponse) {
            console.log("Hooray it's cached")
            return cachedResponse
        }

        const result = await slowFn(...props)
        await rSetex(key, ttl, result)
        return result
    }
}

// Intentional slow function
async function verySlowAndExpensivePostgreSQLQuery() {
    // here you would do a big query for PostgreSQL
    // code below is to mimic a slow function
    console.log("oh no, a very expensive query")
    const promise = new Promise(resolve => {
        setTimeout(() => {
            resolve(new Date().toUTCString())
        }, 5000)
    })
    return promise
}

// This will cache slowFn and every 5 seconds it will give you a fresh copy.
const cachedFn = cache('expensive_call', 10, verySlowAndExpensivePostgreSQLQuery)

async function init() {
    const app = express()

    app.get('/pageview', async function(req, res) {
        const views = await rInc('pageviews') // pageviews is the name of the key that is going out to Redis. 
        //Incremented number comes back via views variable
        res.json({
            status: 'ok',
            views
        })
    })

    app.get('/get', async function(req, res) {
        const data = await cachedFn()

        res.json({
            data,
            status: 'ok'
        }).end()
    })

    const PORT = 3000
    app.use(express.static('./static'))
    app.listen(PORT)
    console.log(`Running on http://localhost:${PORT}`)
}

init()


