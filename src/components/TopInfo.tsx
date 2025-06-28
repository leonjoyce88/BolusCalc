import React, { useEffect, useRef, useState } from "react";
import { Reading, ReadingField } from "../types/reading";

const MinutesInMs = 60000
interface TopInfoProps {
    reading: Reading;
    setReading: React.Dispatch<React.SetStateAction<Reading>>;
}
const TopInfo: React.FC<TopInfoProps> = ({ reading, setReading }) => {
    const [minAgo, setMinAgo] = useState<Number | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

    useEffect(() => {
        const timestamp = reading.timestamp;
        if (!timestamp) return

        const update = () => {
            const minutesFromReading = Math.trunc((Date.now() - timestamp) / MinutesInMs)
            setMinAgo(minutesFromReading)

            const timeToNextMinute = 61000 + (timestamp - Date.now()) % 60000;

            clearTimeout(timeoutRef.current)

            timeoutRef.current = setTimeout(update, timeToNextMinute)
        }

        update()

        return () => clearTimeout(timeoutRef.current)
    }, [reading])

    return (
        <div className="top-info">
            <div className="form-row">
                <label htmlFor="blood-glucose">Current Blood Glucose:</label>
                <input id="blood-glucose" type="number" value={reading?.mmol ?? 6} onChange={e => setReading({ ...reading, mmol: Number(e.target.value) })} />
            </div>

            <div className="trend-time-row">
                <span className="trend-label">Trend:</span>
                <span>{reading?.trend ?? "Waiting for Data"}</span>
                <span>{minAgo != null ? `${minAgo} minute${minAgo === 1 ? "" : "s"} ago` : 'Waiting for Data'}</span>
            </div>
        </div>)
};
export default TopInfo;
