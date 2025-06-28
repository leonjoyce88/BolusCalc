import { useState, useEffect, useRef } from 'react'
import './App.css'
import TopInfo from './components/TopInfo.jsx';
import Inputs from './components/Inputs.jsx';
import Bolus from './components/Bolus.jsx';

const RetryFetchDelay = 5000
const RetryWindow = 15000
const MinutesInMs = 60000
const DexcomReadingInterval = 5 * MinutesInMs

function App() {
    const [reading, setReading] = useState({ mmol: 6 })
    const [formData, setFormData] = useState({ ratio: 30, factor: 6, target: 6, carbs: 0 })

    const handleFormChange = (field) => (e) => {
        const value = e.target.value;
        setFormData((prev) => ({
            ...prev,
            [field]: value === "" ? "" : Number(value) || 0,
        }))
    }

    const bolus = () => {
        const { mmol } = reading
        const { target, factor, carbs, ratio } = formData

        let correction = (mmol - target) / factor
        let meal = carbs / ratio
        let total = Math.trunc(2 * (correction + meal)) / 2;

        if (total < 0.5 || isNaN(total)) {
            return (0)
        } else {
            return (total)
        }
    }

    const timeoutRef = useRef(null)
    const retryStartTimeRef = useRef(null)

    const fetchData = async () => {
        try {
            const res = await fetch('https://boluscalc-production.up.railway.app')
            const result = await res.json()
            const newReading = result[0]

            const isNewData = newReading.timestamp !== reading.timestamp

            clearTimeout(timeoutRef.current)
            const nextExpectedReading = (newReading.timestamp + (DexcomReadingInterval))
            const delay = nextExpectedReading - Date.now()
            while (delay < 0) {
                delay += 5 * MinutesInMs
            }

            if (isNewData) {
                setReading(newReading)
                retryStartTimeRef.current = null

                console.log(" New Reading Scheduling next fetch in ", delay / 1000, " seconds")
                timeoutRef.current = setTimeout(fetchData, delay)

            } else {
                const now = Date.now()

                if (!retryStartTimeRef.current) {
                    retryStartTimeRef.current = now
                }

                const elapsedRetryTime = now - retryStartTimeRef.current

                if (elapsedRetryTime < RetryWindow) {
                    console.log("Reading unchanged retrying in ", RetryFetchDelay / 1000, "s")
                    timeoutRef.current = setTimeout(fetchData, RetryFetchDelay)
                } else {
                    console.warn("No new data after 15s. Waiting until next 5 minute interval in", delay / 1000, "s")
                    timeoutRef.current = setTimeout(fetchData, delay)
                }
            }

        } catch (error) {
            console.error("fetch failed trying again in ", RetryFetchDelay, "s")
            timeoutRef.current = setTimeout(fetchData, RetryFetchDelay)
        }
    };


    useEffect(() => {
        fetchData();
        return () => {
            clearTimeout(timeoutRef.current);
        }
    }, []);


    return (
        <>
            <TopInfo reading={reading} setReading={setReading} />
            <Inputs formData={formData} handleFormChange={handleFormChange} />
            <Bolus bolus={bolus} />
        </>
    );


}
export default App
