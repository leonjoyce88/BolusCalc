import { useState, useEffect, useRef, useMemo } from 'react'
import './App.css'
import TopInfo from './components/TopInfo.jsx';
import Inputs from './components/Inputs.jsx';
import Bolus from './components/Bolus.jsx';

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

    const bolusValue = useMemo(() => {
        const { mmol } = reading
        const { target, factor, carbs, ratio } = formData

        let correction = (mmol - target) / factor
        let meal = carbs / ratio
        let total = Math.trunc(2 * (correction + meal)) / 2;

        if (total < 0.5 || isNaN(total)) {
            return 0
        }
        return total
    }, [reading, formData])

    useEffect(() => {
        const controller = new AbortController()

        const longFetch = async () => {
            try {
                console.log("started long polling fetch")
                const res = await fetch('https://boluscalc-production.up.railway.app/update')
                const result = await res.json()
                console.log("recieved long polling response")
                if (!controller.signal.aborted) {
                    setReading(result[0])
                    longFetch()
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.log("Long polling error", error)
                }
            }
        }

        const fetchNewData = async () => {
            try {
                const res = await fetch('https://boluscalc-production.up.railway.app/new')
                const result = await res.json()
                console.log(result)
                const newReading = result[0]
                setReading(newReading)
                longFetch()
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error("fetch failed")
                }
            }
        };

        fetchNewData();

        return () => {
            controller.abort;
        }
    }, []);

    return (
        <>
            <TopInfo reading={reading} setReading={setReading} />
            <Inputs formData={formData} handleFormChange={handleFormChange} />
            <Bolus bolus={bolusValue} />
        </>
    );
}
export default App
