import { DexcomClient } from 'dexcom-share-api'
import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import { GlucoseEntry } from './types/glucoseEntry'
import { read } from 'fs'

dotenv.config()

const app = express()

const corsOrigin = process.env.ALLOWED_ORIGIN
if (!corsOrigin) {
    console.error("must provide cors origin")
    process.exit(1)
}

app.use(cors({
    origin: corsOrigin,
}));

app.use(express.json())

const { USERNAME, PASSWORD } = process.env;

if (!USERNAME || !PASSWORD) {
    console.error("must provide username and password in environment variables")
    process.exit(1)
}

const client = new DexcomClient({
    username: USERNAME,
    password: PASSWORD,
    server: 'eu',
});

const MinInMs = 60000
const DexcomInterval = 5 * MinInMs

let cachedReading: GlucoseEntry | null = null
let readingDelay: number = 0;

const fetchData = async () => {
    try {
        const readings: GlucoseEntry[] = await client.getEstimatedGlucoseValues()

        if (Array.isArray(readings) && readings.length > 0) {
            cachedReading = readings[0]
            console.log(`[fetchData] cached reading age: ${(Date.now() - cachedReading.timestamp) / 1000}s`)
        }
    } catch (error: any) {
        console.error("Failed to fetch from dexcom", error)
    }
}

fetchData()

app.get("/new", async (_req: Request, res: Response) => {
    const isStale = !cachedReading || Date.now() - cachedReading.timestamp > DexcomInterval

    if (isStale) {
        await fetchData()
    }
    if (!cachedReading) {
        return res.status(500).json({ error: "No glucose data available" })
    }
    res.status(200).json({
        mmol: cachedReading.mmol,
        trend: cachedReading.trend,
        timestamp: cachedReading.timestamp,
    })
})

app.get("/sse", async (_req, res, _next) => {
    console.log("sse hit")
    res.set({
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
        Connection: "keep-alive", // allowing TCP connection to remain open for multiple HTTP requests/responses
        "Content-Type": "text/event-stream", // media type for Server Sent Events (SSE)
    });
    res.flushHeaders();

    const sendReading = () => {
        if (cachedReading) {
            res.write(`data: ${JSON.stringify(cachedReading)}\n\n`);
        }
    }

    const isStale = !cachedReading || Date.now() - cachedReading.timestamp > DexcomInterval
    if (isStale) {
        await fetchData()
    }
    sendReading()

    let timeout: any

    const scheduleNextUpdate = async () => {
        if (!cachedReading) return
        let targetTime = cachedReading.timestamp + DexcomInterval
        let delay = targetTime - Date.now()

        console.log("Next reading scheduled in ", delay / 1000, "s")

        timeout = setTimeout(async () => {
            console.log("fetching data")
            await fetchData()
            sendReading()
            scheduleNextUpdate()
        }, delay + 10000)
    }

    scheduleNextUpdate()

    res.on("close", () => {
        console.log("connection closed")
        clearTimeout(timeout);
        res.end();
    });
});

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log("server listening on PORT:", PORT)
})
