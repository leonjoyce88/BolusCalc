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
            <p>Current Blood Glucose</p>
            <input type='number' value={mmol} onChange={e => setMmol(e.target.value)}></input>
            <p>{trend}</p>
            <p>{time ? new Date(time).toTimeString() : 'Default Reading login to get current data'}</p>
            <p> Insulin ratio:</p>
            <input type='number' value={ratio} onChange={e => setRatio(e.target.value)}></input>
            <p>Correction Factor:</p>
            <input type='number' value={factor} onChange={e => setFactor(e.target.value)}></input>
            <p>Target:</p>
            <input type='number' value={target} onChange={e => setTarget(e.target.value)}></input>
            <p>Carbs:</p>
            <input type='number' value={carbs} onChange={e => setCarbs(e.target.value)}></input>

            <h1>Bolus: {bolus}</h1>
        </>
    );
}
export default App
