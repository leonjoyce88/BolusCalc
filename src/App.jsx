import { useState, useEffect, useRef } from 'react'
import './App.css'
import TopInfo from './components/TopInfo.jsx';
import Inputs from './components/Inputs.jsx';
import Bolus from './components/Bolus.jsx';

const RetryFetchDelay = 2000
const MinutesInMs = 60000
const DexcomReadingInterval = 5 * MinutesInMs

function App() {
    const [reading, setReading] = useState({ mmol: 6, timestamp: new Date() })
    const [formData, setFormData] = useState({ ratio: 30, factor: 6, target: 6, carbs: 0 })

    const handleFormChange = (field) => (e) => {
        const value = e.target.value;
        setFormData((prev) => ({
            ...prev,
            [field]: value === "" ? "" : parseFloat(value),
        }))
    }
    const bolus = () => {
        let correction = (reading.mmol - formData.target) / formData.factor
        let meal = formData.carbs / formData.ratio
        let total = Math.trunc(2 * (correction + meal)) / 2;

        if (total < 0.5 || isNaN(total)) {
            return (0)
        } else {
            return (total)
        }

    }
    const timeoutRef = useRef(null)
    const intervalRef = useRef(null)

    const fetchData = async () => {
        try {
            const res = await fetch('https://boluscalc-production.up.railway.app')
            const result = await res.json()
            const currentReading = result[0]
            setReading(currentReading)

            console.log("Fetched data at", new Date(currentReading.timestamp).toLocaleString())

            const nextReadingTimestamp = (currentReading.timestamp + (DexcomReadingInterval) + 2000)
            const msToNextReading = nextReadingTimestamp - new Date()

            clearTimeout(timeoutRef.current)

            if (msToNextReading > 0) {
                console.log("Scheduling next fetch in ", msToNextReading / 1000, " seconds")

                timeoutRef.current = setTimeout(() => {
                    fetchData();
                }, msToNextReading)

            } else {
                console.log("Failed to fetch new data trying again in ", RetryFetchDelay / 1000, " seconds")
                timeoutRef.current = setTimeout(() => {
                    fetchData();
                }, RetryFetchDelay)
            }

        } catch (error) {
            console.error("fetch failed")
        }
    };


    useEffect(() => {
        fetchData();
        return () => {
            clearTimeout(timeoutRef.current);
            clearInterval(intervalRef.current);
        }
    }, []);


    return (
        <>
            <TopInfo reading={reading} setReading={setReading} />
            <Inputs
                formData={formData} handleFormChange={handleFormChange}
            />
            <Bolus bolus={bolus} />
        </>
    );


}
export default App
