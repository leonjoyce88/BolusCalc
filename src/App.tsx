import { useState, useEffect, useMemo, useRef } from 'react'
import './App.css'
import TopInfo from './components/TopInfo.jsx';
import Inputs from './components/Inputs.jsx';
import Bolus from './components/Bolus.jsx';

import { FormData, FormField } from './types/form';
import { Reading } from './types/reading';


function App() {
    const [reading, setReading] = useState<Reading>({ mmol: 6 })
    const [formData, setFormData] = useState<FormData>({ ratio: 30, factor: 6, target: 6, carbs: 0 })

    const handleFormChange = (field: FormField) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const value = raw === "" ? "" : Number(raw);
        setFormData((prev) => ({
            ...prev,
            [field]: isNaN(value as number) ? "" : value,
        }))
    }

    const bolusValue = useMemo(() => {
        const { mmol } = reading
        const { target, factor, carbs, ratio } = formData
        if (typeof target !== "number" || typeof factor !== "number" ||
            typeof carbs !== "number" || typeof ratio !== "number"
        ) { return 0 }

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
                const res = await fetch('http://localhost:3000/')
                const result = await res.json()
                const newReading: Reading = result[0]

                setReading(newReading)

                if (!newReading.timestamp) {
                    throw new Error("no timestamp")
                }

                const nextReading = newReading.timestamp - Date.now() + (5 * 60 * 1000)
                console.log("fetch next reading in", nextReading / 1000, "s")
                timeoutRef.current = setTimeout(() => fetchData(), nextReading)
            } catch (error: any) {
                console.error("fetch failed")
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
            <TopInfo reading={reading} setReading={setReading} />
            <Inputs formData={formData} handleFormChange={handleFormChange} />
            <Bolus bolus={bolusValue} />
        </>
    );
}
export default App
