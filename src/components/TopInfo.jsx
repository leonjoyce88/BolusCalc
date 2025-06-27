import { useEffect, useState } from "react";

const MinutesInMs = 60000
const TopInfo = ({ reading, setReading }) => {
    const [minAgo, setMinAgo] = useState(0);

    useEffect(() => {
        if (!reading.timestamp) return

        const update = () => {
            const minutesFromReading = Math.trunc((Date.now() - reading.timestamp) / MinutesInMs)
            setMinAgo(minutesFromReading)
        }

        update();//update on new reading

        const timeToNextMinute = 60000 + (reading.timestamp - Date.now()) % 60000;

        //set initial timeout to sync with readings
        const timeoutId = setTimeout(() => {
            update();

            const intervalId = setInterval(update, 60000); //set future updates every minute from first

            return () => clearInterval(intervalId)
        }, timeToNextMinute)

        return () => clearTimeout(timeoutId)

    }, [reading])

    return (
        <div className="top-info">
            <div className="form-row">
                <label htmlFor="blood-glucose">Current Blood Glucose:</label>
                <input id="blood-glucose" type="number" value={reading ? reading.mmol : "6"} onChange={e => setReading({ ...reading, mmol: e.target.value })} />
            </div>

            <div className="trend-time-row">
                <span className="trend-label">Trend:</span>
                <span>{reading.trend ? reading.trend : "Waiting for Data"}</span>
                <span>{reading.timestamp ? minAgo + (" minute" + (minAgo == 1 ? "" : "s") + " ago") : 'Waiting for Data'}</span>
            </div>
        </div>)
};
export default TopInfo;
