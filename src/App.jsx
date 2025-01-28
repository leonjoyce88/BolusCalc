import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { DexcomClient } from 'dexcom-share-api';


function App() {
    const [reading, setReading] = useState({ mmol: 6 })
    const [ratio, setRatio] = useState(40)
    const [factor, setFactor] = useState(6)
    const [target, setTarget] = useState(6)
    const [carbs, setCarbs] = useState(0)
    const bolus = () => {
        let correction = (reading.mmol - target) / factor
        let meal = carbs / ratio
        let total = Math.trunc(2 * (correction + meal)) / 2;

        if (total < 0.5 || isNaN(total)) {
            return (0)
        } else {
            return (total)
        }

    }
    useEffect(() => {
        if (!reading.time || (reading && (Date.now() - reading.timestamp) >= 300000)) {
            fetch('https://boluscalc-production.up.railway.app')
                .then(res => res.json())
                .then(data => {
                    setReading(data[0])
                })
        }
    }, [ratio, factor, target, carbs])


    return (
        <>
            <div className="top-info">
                <div className="form-row">
                    <label htmlFor="blood-glucose">Current Blood Glucose:</label>
                    <input id="blood-glucose" type="number" value={reading ? reading.mmol : "6"} onChange={e => setReading({ ...reading, mmol: e.target.value })} />
                </div>

                <div className="trend-time-row">
                    <span className="trend-label">Trend:</span>
                    <span>{reading.trend ? reading.trend : "Waiting for Data"}</span>
                    <span className="time-label">Time:</span>
                    <span>{reading.timestamp ? new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " " + Math.trunc((Date.now() - reading.timestamp) / 60000) + " minutes ago" : 'Waiting for Data'}</span>
                </div>
            </div>

            <div className="container">
                <div className="form-row">
                    <label htmlFor="carb-ratio">Carb ratio (grams/unit):</label>
                    <input id="carb-ratio" type="number" value={ratio} onChange={e => setRatio(e.target.value)} />
                </div>

                <div className="form-row">
                    <label htmlFor="correction-factor">Correction Factor (mmol/unit):</label>
                    <input id="correction-factor" type="number" value={factor} onChange={e => setFactor(e.target.value)} />
                </div>

                <div className="form-row">
                    <label htmlFor="target">Target mmol:</label>
                    <input id="target" type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="Enter target mmol" />
                </div>

                <div className="form-row">
                    <label htmlFor="meal-carbs">Meal Carbs (grams):</label>
                    <input id="meal-carbs" type="number" value={carbs} onChange={e => setCarbs(e.target.value)} />
                </div>
            </div>

            <div className="bolus-result">
                {/*<h1>{bolus ? (bolus + " units") : "None"}</h1>*/}
                <h1>{bolus() + " units"}</h1>
            </div>
        </>
    );


}
export default App
