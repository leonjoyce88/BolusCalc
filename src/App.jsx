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


    useEffect(() => {
        let cancelled = false

        const longFetch = async () => {
            try {
                console.log("started long polling fetch")
                const res = await fetch('https://boluscalc2-dev.up.railway.app/update')
                const result = await res.json()
                const newReading = result[0]
                console.log("recieved long polling response")
                if (!cancelled) {
                    setReading(newReading)
                    longFetch()
                }
            } catch (error) {
                console.log("Long polling error", error)
            }
        }

        const fetchNewData = async () => {
            try {
                const res = await fetch('https://boluscalc2-dev.up.railway.app/new')
                const result = await res.json()
                const newReading = result[0]
                setReading(newReading)
                longFetch()
            } catch (error) {
                console.error("fetch failed")
            }
        };
        fetchNewData();

        return () => {
            cancelled == true
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
