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

app.get("/new", (req, res) => {
    if (!currentData) {
        return res.status(404).send({ error: "no cached data yet" })
    }
    res.send(currentData)
})

app.get("/update", async (req, res) => {
    if (!currentData) {
        const data = await fetchData()
        currentData = data
        return res.send(data)
    }

    const lastTimestamp = currentData[0].timestamp
    const now = Date.now()
    const nextExpectedReadingTime = lastTimestamp + MinInMs * 5
    let waitTime = nextExpectedReadingTime + 2000 - now

    while (waitTime < 0) {
        waitTime += 5 * MinInMs
    }

    console.log("Waiting for data in", waitTime / 1000, "s")
    await sleep(waitTime)

    let newData = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
        newData = await fetchData();

        if (newData && newData[0].timestamp !== lastTimestamp) {
            console.log("New data received!");
            currentData = newData;
            return res.send(newData);
        }

        if (attempt < 3) {
            console.log("No new data yet, retrying in 5 seconds");
            await sleep(5000);
        }
    }

    console.log("No new data after retries, returning cached data");
    res.send(currentData);
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log("server listening on PORT:", PORT)
})
