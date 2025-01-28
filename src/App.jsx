import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { DexcomClient } from 'dexcom-share-api';


function App() {
    const [mmol, setMmol] = useState(6)
    const [time, setTime] = useState('')
    const [trend, setTrend] = useState('')
    const [ratio, setRatio] = useState(40)
    const [factor, setFactor] = useState(6)
    const [target, setTarget] = useState(6)
    const [carbs, setCarbs] = useState(0)
    const [bolus, setBolus] = useState('')

    useEffect(() => {
        if (time == '' || (Date.now() - time) >= 300000) {
            fetch('https://boluscalc-production.up.railway.app')
                .then(res => res.json())
                .then(data => {
                    setMmol(data[0].mmol)
                    setTime(data[0].timestamp)
                    setTrend(data[0].trend)
                })
        }
        calculateBolus()
    }, [mmol, ratio, factor, target, carbs, bolus])

    const calculateBolus = () => {
        let correction = (mmol - target) / factor
        let meal = carbs / ratio
        let total = Math.trunc(2 * (correction + meal)) / 2;
        console.log(total)

        if (total < 0.5) {
            setBolus('none')
        } else {
            setBolus(total)
        }
    }
    return (
        <>
            <div className="top-info">
                <div className="form-row">
                    <label htmlFor="blood-glucose">Current Blood Glucose:</label>
                    <input id="blood-glucose" type="number" value={mmol} onChange={e => setMmol(e.target.value)} />
                </div>

                <div className="trend-time-row">
                    <span className="trend-label">Trend:</span>
                    <span>{trend}</span>
                    <span className="time-label">Time:</span>
                    <span>{time ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Default Reading login to get current data'}</span>
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
                <h1>Bolus: {bolus}</h1>
            </div>
        </>
    );


}
export default App
