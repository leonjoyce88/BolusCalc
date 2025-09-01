import React, { useEffect, useRef, useState } from "react";
import { Reading } from "../types/reading";
import { Pencil, X } from "lucide-react"; // edit and close icons
import TrendArrow from "./TrendArrow";

const MinutesInMs = 60000;

interface TopInfoProps {
    reading: Reading | null;
    handleMmolChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    manualEntry: boolean;
    setManualEntry: React.Dispatch<React.SetStateAction<boolean>>;
    manualMmol: string;
}

const TopInfo: React.FC<TopInfoProps> = ({
    reading,
    handleMmolChange,
    manualEntry,
    setManualEntry,
    manualMmol
}) => {
    const [minAgo, setMinAgo] = useState<number | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!reading?.timestamp) return;

        const update = () => {
            const minutesFromReading = Math.trunc((Date.now() - reading.timestamp) / MinutesInMs);
            setMinAgo(minutesFromReading);

            const timeToNextMinute = 61000 + (reading.timestamp - Date.now()) % 60000;

            clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(update, timeToNextMinute);
        };

        update();

        return () => clearTimeout(timeoutRef.current);
    }, [reading]);

    useEffect(() => {
        if (manualEntry && inputRef.current) {
            inputRef.current.select();
            inputRef.current.focus();
        }
    }, [manualEntry]);

    const displayValue = reading?.mmol ?? 6;

    // Determine colors based on glucose value
    const getCircleColor = (value: number | "") => {
        if (value == "") return "bg-white";
        if (value < 4) return "bg-red-400"; // Low
        if (value > 7.8) return "bg-orange-400"; // High
        return "bg-white"; // Normal
    };


    // Use manualMmol when editing, otherwise reading value
    const currentValue = manualEntry ? parseFloat(manualMmol) || 0 : displayValue;

    return (
        <div className="w-full max-w-xs flex flex-col items-center pt-12 bg-gray-200 ">
            <div className="relative flex flex-col items-center">
                <div className="w-44 h-44 flex items-center justify-center rounded-full bg-gray-100 shadow-lg">
                    <div
                        className={`w-40 h-40 flex flex-col items-center justify-center rounded-full shadow-lg relative overflow-hidden ${getCircleColor(currentValue)}`}
                    >
                        {/* Trend arrow below the value */}
                        {reading?.trend && !manualEntry && (
                            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                                <TrendArrow trend={reading.trend} />
                            </div>
                        )}

                        {/* Glucose value always centered */}
                        {manualEntry ? (
                            <input
                                ref={inputRef}
                                type="number"
                                step="0.1"
                                value={manualMmol}
                                onChange={handleMmolChange}
                                onBlur={() => {
                                    const val = parseFloat(manualMmol);
                                    handleMmolChange({
                                        target: { value: isNaN(val) ? "" : val.toFixed(1) },
                                    } as React.ChangeEvent<HTMLInputElement>);
                                }}
                                className={`text-5xl font-bold border-none text-center leading-tight appearance-none focus:outline-none text-gray-900 bg-transparent`}
                                style={{ textOverflow: "clip" }}
                            />
                        ) : (
                            <span
                                className={`text-5xl font-bold leading-tight text-gray-900`}
                            >
                                {Number(currentValue).toFixed(1)}
                            </span>
                        )}

                        <span
                            className={`absolute bottom-3 text-sm font-medium tracking-wide ${currentValue < 4 || currentValue > 7.8 ? "text-white" : "text-gray-500"
                                }`}
                        >
                            mmol/L
                        </span>
                    </div>

                    {/* Edit button */}
                    <button
                        onClick={() => setManualEntry(!manualEntry)}
                        className="absolute top-5 right-5 transform translate-x-1/4 -translate-y-1/4 p-2 rounded-full bg-white hover:bg-gray-300 shadow flex items-center justify-center transition-all duration-200"
                        title={manualEntry ? "Cancel manual entry" : "Edit glucose value"}
                    >
                        {manualEntry ? (
                            <X className="w-5 h-5 text-gray-700" />
                        ) : (
                            <Pencil className="w-5 h-5 text-gray-700" />
                        )}
                    </button>
                </div>
            </div>

            <span className="text-xs text-gray-600 mt-3 font-medium">
                {minAgo != null
                    ? `${minAgo} minute${minAgo === 1 ? "" : "s"} ago`
                    : "Waiting for data"}
            </span>
        </div >
    );
};

export default TopInfo;
