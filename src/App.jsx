import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { DexcomClient } from 'dexcom-share-api';

const client = new DexcomClient({
    username: import.meta.env.VITE_USERNAME,
    password: import.meta.env.VITE_PASSWORD,
    server: 'eu',
});

function App() {
    const [mmol, setMmol] = useState('')
    const [time, setTime] = useState('')
    const [trend, setTrend] = useState('')
    const [ratio, setRatio] = useState(40)
    const [factor, setFactor] = useState(4)
    const [target, setTarget] = useState(6)
    const [carbs, setCarbs] = useState(0)
    const [bolus, setBolus] = useState('')
    useEffect(() => {
        getMmol()
        console.log('fetch')
    }, [])

    useEffect(() => {
        if ((Date.now() - time) >= 300000) {
            getMmol()
        }
        calculateBolus()
    }, [mmol, ratio, factor, target, carbs, bolus])

    function getMmol() {
        client.getEstimatedGlucoseValues().then((res) => {
            console.log(res[0])
            setMmol(res[0]['mmol'])
            setTime(res[0]['timestamp'])
            setTrend(res[0]['trend'])
        })
    }

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
            <p>{mmol}</p>
            <p>{trend}</p>
            <p>{new Date(time).toTimeString()}</p>
            <p>Insulin ratio:</p>
            <input value={ratio} onChange={e => setRatio(e.target.value)}></input>
            <p>Correction Factor:</p>
            <input value={factor} onChange={e => setFactor(e.target.value)}></input>
            <p>Target:</p>
            <input value={target} onChange={e => setTarget(e.target.value)}></input>
            <p>Carbs:</p>
            <input value={carbs} onChange={e => setCarbs(e.target.value)}></input>

            <h1>Bolus: {bolus}</h1>
        </>
    );
}
export default App
