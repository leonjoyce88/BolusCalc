import { useState, useEffect, useMemo } from 'react'
import './styles/globals.css'
import TopInfo from './components/TopInfo.jsx';
import Inputs from './components/Inputs.jsx';
import Bolus from './components/Bolus.jsx';

import { FormData, FormField } from './types/form';
import { Reading } from './types/reading';

//@ts-ignore
const API_URL = import.meta.env.VITE_API_BASE_URL
const DEFAULT_FORM_DATA = { ratio: "30", factor: "6", target: "6", carbs: "0" }

function App() {
    //Fetch Readings
    const [reading, setReading] = useState<Reading | null>(null)

    useEffect(() => {
        const eventSource = new EventSource(`${API_URL}/sse`)
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setReading({ ...data });
        }

        return () => eventSource.close();
    }, [])

    //Form handling
    const [formData, setFormData] = useState<FormData>(() => {
        const saved = localStorage.getItem('userSettings')
        return saved ? JSON.parse(saved) : DEFAULT_FORM_DATA
    })
    useEffect(() => {
        localStorage.setItem('userSettings', JSON.stringify(formData))
    }, [formData])

    const handleFormChange = (field: FormField) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    //Manual Glucose entry
    const [manualEntry, setManualEntry] = useState<boolean>(false)
    const [manualMmol, setManualMmol] = useState<string>(formData.target)

    const handleMmolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setManualMmol(value)
    }

    //Bolus Calculation
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
        let total = Math.round(2 * (correction + meal)) / 2;

        if (total < 0.5 || isNaN(total)) {
            return 0
        }
        return total
    }, [reading, formData, manualEntry, manualMmol])

    return (
        <div className='app-wrapper'>
            <TopInfo reading={reading} handleMmolChange={handleMmolChange} manualEntry={manualEntry} setManualEntry={setManualEntry} manualMmol={manualMmol} />
            <Inputs formData={formData} handleFormChange={handleFormChange} />
            <Bolus bolus={bolusValue} />
        </div>
    );
}
export default App
