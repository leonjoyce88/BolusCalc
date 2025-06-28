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

const sleep = ms => new Promise(r => setTimeout(r, ms))

const fetchData = async () => {
    try {
        const data = await client.getEstimatedGlucoseValues()
        console.log("[fetchData] fetched data ", (Date.now() - data[0].timestamp) / 1000, "s from reading")
        return (data)
    } catch (error) {
        console.error("[fetchData] error fetching data:", error)
        return null
    }
}

let currentData = null

fetchData().then(data => currentData = data)


let pendingUpdatePromise = null

const waitForNewData = async () => {
    if (pendingUpdatePromise) {
        console.log("[waitForNewData] returning promise")
        return pendingUpdatePromise
    }
    console.log("[waitForNewData] making new promise")

    pendingUpdatePromise = new Promise(async (resolve) => {
        if (!currentData) {
            const data = await fetchData()
            currentData = data
            return resolve(data)
        }

        const lastTimestamp = currentData[0].timestamp
        const now = Date.now()
        const nextExpectedReadingTime = lastTimestamp + MinInMs * 5
        let waitTime = nextExpectedReadingTime + 2000 - now

        while (waitTime < 0) {
            waitTime += 5 * MinInMs
        }

        console.log("[waitForNewData] Waiting for data in", waitTime / 1000, "s")
        await sleep(waitTime)

        let newData = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
            console.log("[waitForNewData] fetch attempt :", attempt)
            newData = await fetchData();

            if (newData && newData[0].timestamp !== lastTimestamp) {
                console.log("[waitForNewData] New data received!");
                currentData = newData;
                pendingUpdatePromise = null
                return resolve(newData)
            }

            if (attempt < 3) {
                console.log("[waitForNewData] fetch failed trying again in 5s");
                sleep(5000);
            }
        }

        console.log("[waitForNewData] No new data. returning cached data");
        pendingUpdatePromise = null
        resolve(currentData);
    })

    return pendingUpdatePromise

}

app.get("/new", (_req, res) => {
    if (!currentData) {
        return res.status(404).send({ error: "no cached data yet" })
    }
    res.send(currentData)
})

app.get("/update", async (_req, res) => {
    console.log("update recieved")
    try {
        const data = await waitForNewData()
        res.send(data)
    } catch (error) {
        console.error("Error in /update", error)
        res.status(500).send({ error: "failed to fetch data" })
    }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log("server listening on PORT:", PORT)
})
