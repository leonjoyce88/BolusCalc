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

const fetchData = async () => {
    try {
        for (let attempt = 1; attempt <= 3; attempt++) {
            const data = await client.getEstimatedGlucoseValues() as GlucoseEntry[]

            if (currentData == null || (data && data.length > 0 && data[0].timestamp !== currentData[0].timestamp)) {
                currentData = data;
                console.log("[fetchData] fetched data ", (Date.now() - data[0].timestamp) / 1000, "s from reading")
                return data;
            }

            if (attempt < 3) {
                console.log("[waitForNewData] fetch failed trying again in 5s");
                await sleep(5000);
            }
        }
        throw new Error("no data after 3 attempts")
    } catch (error) {
        console.error("[fetchData] error fetching data:", error)
        return null
    }
}



let currentData: GlucoseEntry[] | null = null

fetchData().then(data => currentData = data)

app.get("/", async (_req: any, res: any) => {
    console.log("[/newTest] request recieved")

    if (!currentData || Date.now() - currentData[0].timestamp > 5 * MinInMs) {
        await fetchData()
    }
    console.log("[/newTest] response sent")
    res.send(currentData)
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log("server listening on PORT:", PORT)
})
