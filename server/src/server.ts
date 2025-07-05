import { DexcomClient } from 'dexcom-share-api'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

const corsOrigin = process.env.ALLOWED_ORIGIN
if (!corsOrigin) {
    console.error("must provide cors origin")
    process.exit(1)
}

app.use(cors({
    origin: process.env.ALLOWED_ORIGIN,
}));
app.use(express.json())

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

let cachedReading: GlucoseEntry | null = null

const fetchData = async () => {
    try {
        const readings: GlucoseEntry[] = await client.getEstimatedGlucoseValues()

        if (Array.isArray(readings) && readings.length > 0) {
            cachedReading = readings[0]
            console.log("[fetchData] fetched data ", (Date.now() - cachedReading.timestamp) / 1000, "s from reading")
        }
    } catch (error: any) {
        console.error("Failed to fetch from dexcom", error)
    }
}


fetchData()

app.get("/new", async (_req: any, res: any) => {
    console.log("[/new] request recieved")

    const isStale = !cachedReading || Date.now() - cachedReading.timestamp > 5 * MinInMs

    if (isStale) {
        await fetchData()
    }

    if (!cachedReading) {
        return res.status(500).json({ error: "No glucose data avaliable" })
    }

    console.log("[/newTest] response sent")
    res.status(200).json({
        mmol: cachedReading.mmol,
        trend: cachedReading.trend,
        timestamp: cachedReading.timestamp,
    })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log("server listening on PORT:", PORT)
})
