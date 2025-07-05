const { DexcomClient } = require('dexcom-share-api');
const express = require('express')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())

const { USERNAME, PASSWORD } = process.env;
if (!USERNAME || !PASSWORD) {
    console.error("must provide username and password in enviroment variables")
}

let client = new DexcomClient({
    username: process.env.USERNAME!,
    password: process.env.PASSWORD!,
    server: 'eu',
});

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
const MinInMs = 60000

const sleep = (ms: number): Promise<void> => new Promise(r => setTimeout(r, ms))

async function retry<T>(fn: () => Promise<T>, retries: number = 3, delayMs: number = 1000): Promise<T> {
    let lastError: unknown;

    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < retries - 1)
                await sleep(delayMs)

        }
    }
    throw lastError;

}

const fetchData = async (previousData: GlucoseEntry[] | null, retries = 3, delayMs = 5000): Promise<GlucoseEntry[] | null> => {
    return retry(async () => {
        const data = await client.getEstimatedGlucoseValues()
        if (!data || !data.length) {
            throw new Error("No data recieved")
        }

        if (previousData && previousData[0].timestamp == data[0].timestamp) {
            throw new Error("Data unchanged Retrying...")
        }

        console.log("[fetchData] fetched data ", (Date.now() - data[0].timestamp) / 1000, "s from reading")
        return data?.length ? data : null;

    }, retries, delayMs).catch((err) => {
        console.error("[fetchData] error fetching data:", err)
        return null
    })
}



let currentData: GlucoseEntry[] | null = null

fetchData(currentData, 1, 0).then(data => { currentData = data ? data : currentData; })

app.get("/new", async (_req: any, res: any) => {
    console.log("[/new] request recieved")

    const dataStale = !currentData || Date.now() - currentData[0].timestamp > 5 * MinInMs

    if (dataStale) {
        try {
            const newData = await fetchData(currentData, 3, 5000)
            if (newData) {
                currentData = newData
            }
        } catch (error: any) {
            console.error("[/new] Dexcom fetch error:", error)
        }
    }

    if (!currentData) {
        return res.status(500).json({ error: "No glucose data avaliable" })
    }

    console.log("[/newTest] response sent")
    res.status(200).json(currentData)
})

app.get("/error", async (_req: any, res: any) => {
    console.log("[/error] request recieved")


    console.log("[/error] response sent")
    res.status(503).json({ error: "Unable to retrieve glucose data" })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log("server listening on PORT:", PORT)
})
