const { DexcomClient } = require('dexcom-share-api');
const express = require('express')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())

let client = new DexcomClient({
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    server: 'eu',
});

const MinInMs = 60000

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const fetchData = async () => {
    try {
        const data = await client.getEstimatedGlucoseValues()
        console.log("fetched data ", (Date.now() - data[0].timestamp) / 1000, "s from reading")
        return (data)
    } catch (error) {
        console.error("error fetching data:", error)
        return null
    }
}

let currentData = null

fetchData().then(data => currentData = data)

app.get("/", async (req, res) => {
    const lastTimestamp = currentData?.[0]?.timestamp
    if (!lastTimestamp) {
        const data = await fetchData()
        currentData = data
        return res.send(data)
    }

    const now = Date.now()
    const nextExpectedReadingTime = lastTimestamp + 5 * MinInMs;
    const bufferMs = 3000
    const waitTime = Math.max(0, nextExpectedReadingTime - now + bufferMs)

    if (waitTime > 0) {
        console.log(`waiting${waitTime / 1000}s for next Dexcom reading`)
        await sleep(waitTime)
    }
    let newData = null

    for (let attempt = 1; attempt <= 3; attempt++) {
        newData = await fetchData();

        if (newData && newData[0].timestamp !== currentData[0].timestamp) {
            console.log("new data")
            currentData = newData
            return res.send(newData)
        }

        console.log("no new data waiting to retry")
        await sleep(5000)
    }

    console.log("new data not available. returning cached data")
    return res.send(currentData)


})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log("server listening on PORT:", PORT)
})
