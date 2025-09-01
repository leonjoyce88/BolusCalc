import React, { useState } from "react";
import { FormData } from "../types/form";
import { Settings, X } from "lucide-react"
interface InputsProps {
    formData: FormData;
    handleFormChange: (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => void;
    settingsPanel: boolean
    setSettingsPanel: React.Dispatch<React.SetStateAction<boolean>>;
}

interface InputWithUnitProps {
    id: string;
    label: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    unit: string;
}

const InputWithUnit: React.FC<InputWithUnitProps> = ({ id, label, value, onChange, placeholder, unit }) => (
    <div className="relative w-full flex flex-col">
        <label htmlFor={id} className="mb-1 text-sm font-medium text-gray-700 cursor-pointer">
            {label}
        </label>
        <div className="relative w-full">
            <input
                id={id}
                type="number"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        (e.target as HTMLInputElement).blur(); // remove focus
                    }
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-400 focus:border-blue-400 transition-colors duration-200"
            />
            <label
                htmlFor={id}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm cursor-text"
            >
                {unit}
            </label>
        </div>
    </div>
);

const Inputs: React.FC<InputsProps> = ({ formData, handleFormChange, settingsPanel, setSettingsPanel }) => {
    return (
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 flex flex-col space-y-4 relative">

            <button
                onClick={() => setSettingsPanel(!settingsPanel)}
                className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 p-2 rounded-full bg-white hover:bg-gray-300 shadow flex items-center justify-center transition-all duration-200"
                title={!settingsPanel ? "Open settings panel" : "Close settings panel"}
            >
                {!settingsPanel ?
                    <Settings className="w-5 h-5 text-gray-700" /> :
                    <X className="w-5 h-5 text-gray-700" />}
            </button>

            <div
                className={`overflow-hidden transition-all duration-200 ${settingsPanel ? "max-h-[500px] opacity-100 mb-0" : "max-h-0 opacity-0 mb-0"
                    }`}
            >
                <InputWithUnit
                    id="carb-ratio"
                    label="Carb ratio"
                    value={formData.ratio}
                    onChange={handleFormChange("ratio")}
                    placeholder="Enter value"
                    unit="grams/unit"
                />

                <InputWithUnit
                    id="correction-factor"
                    label="Correction Factor"
                    value={formData.factor}
                    onChange={handleFormChange("factor")}
                    placeholder="Enter value"
                    unit="mmol/L/unit"
                />

                <InputWithUnit
                    id="target"
                    label="Target"
                    value={formData.target}
                    onChange={handleFormChange("target")}
                    placeholder="Enter target mmol"
                    unit="mmol/L"
                />
            </div>
            <InputWithUnit
                id="meal-carbs"
                label="Meal Carbs"
                value={formData.carbs}
                onChange={handleFormChange("carbs")}
                placeholder="Enter carbs"
                unit="g"
            />
        </div>
    );
};

export default Inputs;
