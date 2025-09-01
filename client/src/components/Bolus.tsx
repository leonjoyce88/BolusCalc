import React from "react";

interface BolusProps {
    bolus: number | null;
}

const Bolus: React.FC<BolusProps> = ({ bolus }) => {
    return (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center">
            <span className="text-gray-400 text-sm mb-2">Recommended bolus</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 text-center">
                {bolus != null ? `${bolus} ${bolus === 1 ? "unit" : "units"}` : "Invalid input"}
            </h1>
        </div>
    );
}

export default Bolus
