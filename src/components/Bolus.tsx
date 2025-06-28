import React from "react";

interface BolusProps {
    bolus: number;
}

const Bolus: React.FC<BolusProps> = ({ bolus }) => {
    return (
        <div className="bolus-result">
            <h1>{bolus} units</h1>
        </div>
    )
}

export default Bolus
