import { useState, useEffect, useMemo, useRef } from 'react'
import './App.css'
import TopInfo from './components/TopInfo.jsx';
import Inputs from './components/Inputs.jsx';
import Bolus from './components/Bolus.jsx';

import { FormData, FormField } from './types/form';
import { Reading } from './types/reading';


function App() {
    const [reading, setReading] = useState<Reading | null>(null)
    const [formData, setFormData] = useState<FormData>({ ratio: "30", factor: "6", target: "6", carbs: "0" })

    const handleFormChange = (field: FormField) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }
    const handleMmolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const value = raw === "" ? "" : Number(raw);
        setReading({
            mmol: isNaN(value as number) ? "" : value,
            timestamp: undefined,
            trend: undefined
        })
    }

    const bolusValue = useMemo(() => {
        const { target, factor, carbs, ratio } = formData
        let mmol = reading?.mmol
        if (!mmol) {
            mmol = parseFloat(target)
        }
        if (typeof mmol !== "number"
        ) { return null }

        let correction = (mmol - parseFloat(target)) / parseFloat(factor)
        let meal = parseFloat(carbs) / parseFloat(ratio)
        let total = Math.trunc(2 * (correction + meal)) / 2;

        if (total < 0.5 || isNaN(total)) {
            return 0
        }
        return total
    }, [reading, formData])

    const timeoutRef = useRef<number | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('https://boluscalc-production.up.railway.app/new')
                if (!res.ok) {
                    if (res.status === 500) {
                        console.error("Server error: No glucose data available")
                    } else {
                        console.error("unexpected error", res.status)
                    }
                    return
                }
                const result: Reading = await res.json()

                if (result && result.timestamp) {
                    setReading(result)
                    const timeoutMs = result.timestamp - Date.now() + (5 * 60 * 1000)
                    console.log("fetching next reading in", timeoutMs / 1000, "s")
                    timeoutRef.current = setTimeout(() => fetchData(), timeoutMs)
                }

            } catch (error: any) {
                console.error("Error fetching data", error)
                timeoutRef.current = setTimeout(() => fetchData(), 5000)
            }
        };
        fetchData();
        return () => {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, []);

    return (
        <div className='app-wrapper'>
            <TopInfo reading={reading} handleMmolChange={handleMmolChange} />
            <Inputs formData={formData} handleFormChange={handleFormChange} />
            <Bolus bolus={bolusValue} />
        </div>
    );
}
export default App
