const { DexcomClient } = require('dexcom-share-api');
const express = require('express')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())

let client = new DexcomClient({
    username: process.env.USERNAME!,
    password: process.env.PASSWORD!,
    server: 'eu',
});

const MinInMs = 60000

const sleep = (ms: number): Promise<void> => new Promise(r => setTimeout(r, ms))

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

const Trend = {
    DoubleUp: 0,
    SingleUp: 1,
    FortyFiveUp: 2,
    Flat: 3,
    FortyFiveDown: 4,
    SingleDown: 5,
    DoubleDown: 6,
} as const;

type Trend = typeof Trend[keyof typeof Trend];

interface GlucoseEntry {
    mgdl: number;
    mmol: number;
    trend: Trend;
    timestamp: number;
}


let currentData: GlucoseEntry[] | null = null

fetchData().then(data => currentData = data)

let pendingUpdatePromise: Promise<GlucoseEntry[]> | null = null

const waitForNewData = async (): Promise<GlucoseEntry[]> => {
    if (pendingUpdatePromise) {
        console.log("[waitForNewData] returning existing promise")
        return pendingUpdatePromise
    }
    console.log("[waitForNewData] making new promise")

    pendingUpdatePromise = new Promise<GlucoseEntry[]>(async (resolve, reject) => {
        try {
            if (!currentData) {
                const data = await fetchData()
                if (!data) throw new Error("Failed to fetch initial data")
                currentData = data
                pendingUpdatePromise = null
                return resolve(data)
            }

            const lastTimestamp = currentData[0].timestamp
            const now = Date.now()
            const nextExpectedReadingTime = lastTimestamp + MinInMs * 5
            let waitTime = nextExpectedReadingTime + 1000 - now

            while (waitTime < 0) {
                waitTime += 5 * MinInMs
            }

            console.log("[waitForNewData] Waiting for data in", waitTime / 1000, "s")
            await sleep(waitTime)

            let newData: GlucoseEntry[] | null = null;
            for (let attempt = 1; attempt <= 3; attempt++) {
                console.log("[waitForNewData] fetch attempt :", attempt)
                newData = await fetchData();

                if (newData && newData.length > 0 && newData[0].timestamp !== lastTimestamp) {
                    console.log("[waitForNewData] New data received!");
                    currentData = newData;
                    pendingUpdatePromise = null
                    return resolve(newData)
                }

                if (attempt < 3) {
                    console.log("[waitForNewData] fetch failed trying again in 5s");
                    await sleep(5000);
                }
            }

            console.log("[waitForNewData] No new data. returning cached data");
            pendingUpdatePromise = null
            resolve(currentData);

        } catch (error) {
            console.error("[waitForNewData] Error occured:", error)
            pendingUpdatePromise = null
            reject(error)
        }
        console.log("[waitForNewData] returning new promise")
    })
    return pendingUpdatePromise
}

app.get("/new", async (_req, res) => {
    console.log("[/new] request recieved")
    if (!currentData) {
        return res.status(404).send({ error: "no cached data yet" })
    }
    if (Date.now() - currentData[0].timestamp > 5 * MinInMs) {
        currentData = await fetchData()
    }
    console.log("[/new] response sent")
    res.send(currentData)
})

app.get("/update", async (_req, res) => {
    console.log("[/update] update request recieved")
    try {
        const data = await waitForNewData()
        console.log("[/update] update response sent")
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
