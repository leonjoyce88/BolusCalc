import { useState, useEffect, useMemo } from 'react'
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

    useEffect(() => {
        const controller = new AbortController()

        const longFetch = async () => {
            try {
                console.log("started long polling fetch")
                const res = await fetch('https://boluscalc-production.up.railway.app/update')
                const result = await res.json()
                console.log("recieved long polling response")
                if (!controller.signal.aborted) {
                    setReading(result[0] as Reading)
                    longFetch()
                }
            } catch (error: any) {
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
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error("fetch failed")
                }
            }
        };

        fetchNewData();

        return () => {
            controller.abort();
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
