import { useState, useEffect, useMemo, useRef } from 'react'
import './styles/globals.css'
import TopInfo from './components/TopInfo.jsx';
import Inputs from './components/Inputs.jsx';
import Bolus from './components/Bolus.jsx';

import { FormData, FormField } from './types/form';
import { Reading } from './types/reading';

const MinInMs = 60000


function App() {
    const [reading, setReading] = useState<Reading | null>(null)
    const [formData, setFormData] = useState<FormData>({ ratio: "30", factor: "6", target: "6", carbs: "0" })

    const [manualEntry, setManualEntry] = useState<boolean>(false)
    const [manualMmol, setManualMmol] = useState<string>(formData.target)

    useEffect(() => { console.log(manualEntry) }, [manualEntry])

    const handleFormChange = (field: FormField) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }
    const handleMmolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setManualMmol(value)
    }

    const bolusValue = useMemo(() => {
        const { target, factor, carbs, ratio } = formData
        let mmol = reading?.mmol
        if (manualEntry) {
            mmol = parseFloat(manualMmol)
        }
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
    }, [reading, formData, manualEntry, manualMmol])

    const timeoutRef = useRef<number | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('http://localhost:3000/new')
                if (!res.ok) {
                    if (res.status === 500) {
                        throw new Error("Server error: No glucose data available")
                    } else {
                        throw new Error("unexpected error" + res.status)
                    }
                }
                const result: Reading = await res.json()

                if (result && result.timestamp) {
                    setReading(result)
                    let timeoutMs = result.timestamp - Date.now() + (5 * 60 * 1000)
                    if (timeoutMs < 0) {
                        throw new Error("Data stale")
                    }
                    console.log("fetching next reading in", timeoutMs / 1000, "s")
                    timeoutRef.current = setTimeout(() => fetchData(), timeoutMs)
                }

            } catch (error: any) {
                console.error("Error fetching data retry in ", MinInMs / 1000, " seconds", error)
                timeoutRef.current = setTimeout(() => fetchData(), MinInMs)
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
            <TopInfo reading={reading} handleMmolChange={handleMmolChange} manualEntry={manualEntry} setManualEntry={setManualEntry} manualMmol={manualMmol} />
            <Inputs formData={formData} handleFormChange={handleFormChange} />
            <Bolus bolus={bolusValue} />
        </div>
    );
}
export default App
