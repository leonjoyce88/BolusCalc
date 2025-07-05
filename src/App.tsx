import { useState, useEffect, useMemo, useRef } from 'react'
import './App.css'
import TopInfo from './components/TopInfo.jsx';
import Inputs from './components/Inputs.jsx';
import Bolus from './components/Bolus.jsx';

import { FormData, FormField } from './types/form';
import { Reading } from './types/reading';


function App() {
    const [reading, setReading] = useState<Reading | null>(null)
    const [formData, setFormData] = useState<FormData>({ ratio: 30, factor: 6, target: 6, carbs: 0 })

    const handleFormChange = (field: FormField) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const value = raw === "" ? "" : Number(raw);
        setFormData((prev) => ({
            ...prev,
            [field]: isNaN(value as number) ? "" : value,
        }))
    }
    const handleMmolChange = () => (e: React.ChangeEvent<HTMLInputElement>) => {
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
        if (typeof target !== "number" || typeof factor !== "number" ||
            typeof carbs !== "number" || typeof ratio !== "number"
        ) { return 0 }
        const mmol = reading?.mmol ?? target

        let correction = (mmol - target) / factor
        let meal = carbs / ratio
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
                const res = await fetch('http://localhost:3000/new')
                console.log(res)
                if (!res.ok) {
                    if (res.status === 500) {
                        console.error("Server error: No glucose data available")
                    } else {
                        console.error("unexpected error", res.status)
                    }
                    return
                }
                const result: Reading[] = await res.json()

                if (!Array.isArray(result) || result.length === 0) {
                    throw new Error("Invalid glucose data recieved")
                }

                const newReading = result[0]
                setReading(newReading)


                if (!newReading.timestamp) throw new Error("no timestamp")
                const nextReading = newReading.timestamp - Date.now() + (5 * 60 * 1000)
                console.log("fetch next reading in", nextReading / 1000, "s")
                timeoutRef.current = setTimeout(() => fetchData(), nextReading)
            } catch (error: any) {
                console.error("Error fetching data", error)
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
        <>
            <TopInfo reading={reading} handleMmolChange={handleMmolChange} />
            <Inputs formData={formData} handleFormChange={handleFormChange} />
            <Bolus bolus={bolusValue} />
        </>
    );
}
export default App
