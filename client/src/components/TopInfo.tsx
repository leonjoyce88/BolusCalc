import React, { useEffect, useRef, useState } from "react";
import { Reading } from "../types/reading";

import { Pencil, X } from "lucide-react"; // edit and close icons

const MinutesInMs = 60000
interface TopInfoProps {
    reading: Reading | null;
    handleMmolChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    manualEntry: boolean
    setManualEntry: React.Dispatch<React.SetStateAction<boolean>>
    manualMmol: string
}
const TopInfo: React.FC<TopInfoProps> = ({ reading, handleMmolChange, manualEntry, setManualEntry, manualMmol }) => {
    const [minAgo, setMinAgo] = useState<Number | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

    useEffect(() => {
        if (reading == null) return;
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
                <div className="input-icon-wrapper">
                    <input id="blood-glucose" type="number" value={manualEntry ? manualMmol : (reading?.mmol ?? 6)} onChange={handleMmolChange} readOnly={!manualEntry} className={manualEntry ? "editable" : "readonly"} />
                    <button onClick={() => setManualEntry(!manualEntry)}>
                        {manualEntry ? <X /> : <Pencil />}
                    </button>

                </div>
            </div>

            <div className="trend-time-row">
                <span className="trend-label">Trend:</span>
                <span>{reading?.trend ?? "Waiting for Data"}</span>
                <span>{minAgo != null ? `${minAgo} minute${minAgo === 1 ? "" : "s"} ago` : 'Waiting for Data'}</span>
            </div>
        </div>)
};
export default TopInfo;
