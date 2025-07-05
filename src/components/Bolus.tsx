import React from "react";

interface BolusProps {
    bolus: number | null;
}

const Bolus: React.FC<BolusProps> = ({ bolus }) => {
    console.log(bolus)
    return (
        <div className="bolus-result">
            <h1>{bolus != null ? bolus + "units" : "Invalid input"}</h1>
        </div>
    )
}

export default Bolus
