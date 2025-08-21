import { DexcomClient } from 'dexcom-share-api'
import dotenv from 'dotenv'
import { GlucoseEntry } from './types/glucoseEntry'
import EventEmitter from 'events'

dotenv.config({ override: true })
const SECONDSINMS = 1000
const MINUTESINMS = 60 * SECONDSINMS
const DEXCOMINTERVAL = 5 * MINUTESINMS
const DELAYTOLERANCE = 10 * SECONDSINMS

class DexcomFetcher extends EventEmitter {
    client: DexcomClient;
    cachedReading!: GlucoseEntry | null;
    loopTimer: NodeJS.Timeout | null;

    constructor() {
        super()
        const { USERNAME, PASSWORD } = process.env;
        if (!USERNAME || !PASSWORD) {
            console.error("must provide username and password in environment variables")
            process.exit(1)
        }
        this.client = new DexcomClient({
            username: USERNAME,
            password: PASSWORD,
            server: 'eu',
        });

        this.fetchData()

        this.loopTimer = null;
    }
    getLatest() {
        return this.cachedReading
    }

    fetchData = async () => {
        try {
            const readings: GlucoseEntry[] = await this.client.getEstimatedGlucoseValues()

            if (Array.isArray(readings) && readings.length > 0) {
                const latest = readings[0]

                if (!this.cachedReading || latest.timestamp !== this.cachedReading.timestamp) {
                    this.cachedReading = readings[0]
                    this.emit("update", this.cachedReading)
                    console.log(`[DexcomFetcher] cached reading age: ${(Date.now() - this.cachedReading.timestamp) / 1000}s`)
                }
                else {
                    console.log(`[DexcomFetcher] no new readings yet`)
                }
            }

        } catch (error: any) {
            console.error("Failed to fetch from dexcom", error)
        }
    }

    isStale() {
        return !this.cachedReading || Date.now() - this.cachedReading.timestamp > DEXCOMINTERVAL + DELAYTOLERANCE
    }

    nextReadingDelay() {
        let targetTime = this.cachedReading ? this.cachedReading.timestamp + DEXCOMINTERVAL : Date.now();
        let delay = targetTime - Date.now() + DELAYTOLERANCE
        return delay
    }

    startLoop() {
        if (this.loopTimer) return // already running
        console.log("[DexomFetcher] loop started")

        const run = async () => {
            if (this.isStale()) { await this.fetchData() }

            this.loopTimer = setTimeout(run, this.nextReadingDelay())
        }

        run()
    }

    stopLoop() {
        if (this.loopTimer) {
            clearTimeout(this.loopTimer)
            this.loopTimer = null
            console.log("[DexomFetcher loop stopped]")
        }
    }
}


export default DexcomFetcher;
