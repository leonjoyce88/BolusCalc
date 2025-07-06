import React, { useEffect, useRef, useState } from "react";
import { Reading } from "../types/reading";

import { Pencil, X } from "lucide-react"; // edit and close icons
import TrendArrow from "./TrendArrow";

import styles from '../styles/TopInfo.module.css';  // import CSS module

const MinutesInMs = 60000;

interface TopInfoProps {
    reading: Reading | null;
    handleMmolChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    manualEntry: boolean;
    setManualEntry: React.Dispatch<React.SetStateAction<boolean>>;
    manualMmol: string;
}

const TopInfo: React.FC<TopInfoProps> = ({ reading, handleMmolChange, manualEntry, setManualEntry, manualMmol }) => {
    const [minAgo, setMinAgo] = useState<number | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        if (reading == null) return;
        const timestamp = reading.timestamp;
        if (!timestamp) return;

        const update = () => {
            const minutesFromReading = Math.trunc((Date.now() - timestamp) / MinutesInMs);
            setMinAgo(minutesFromReading);

            const timeToNextMinute = 61000 + (timestamp - Date.now()) % 60000;

            clearTimeout(timeoutRef.current);

            timeoutRef.current = setTimeout(update, timeToNextMinute);
        };

        update();

        return () => clearTimeout(timeoutRef.current);
    }, [reading]);

    return (
        <div className={styles.topInfo}>
            <div className={styles.formRow}>
                <label htmlFor="blood-glucose">Current Blood Glucose:</label>
                <div className={styles.inputIconWrapper} style={{ alignItems: 'center' }}>
                    {manualEntry ? (
                        <>
                            <div className={styles.valueContainer}>
                                <input
                                    id="blood-glucose"
                                    type="number"
                                    value={manualMmol}
                                    onChange={handleMmolChange}
                                    className={styles.editable}
                                    style={{ flexGrow: 1 }}
                                />
                            </div>
                            <button onClick={() => setManualEntry(false)}>
                                <X />
                            </button>
                        </>
                    ) : (
                        <>
                            <div className={`${styles.valueContainer} ${styles.readingDisplay}`}>
                                <span>{reading?.mmol ?? 6}</span>
                                {reading?.trend ? <TrendArrow trend={reading.trend} /> : null}
                                <span style={{ fontSize: 14, color: '#888' }}>
                                    {minAgo != null ? `${minAgo} minute${minAgo === 1 ? '' : 's'} ago` : 'Waiting for Data'}
                                </span>
                            </div>
                            <button onClick={() => setManualEntry(true)}>
                                <Pencil />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopInfo;
