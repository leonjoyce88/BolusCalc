import React from "react";
import styles from '../styles/Bolus.module.css'

interface BolusProps {
    bolus: number | null;
}

const Bolus: React.FC<BolusProps> = ({ bolus }) => {
    return (
        <div className={styles.bolusResult}>
            <h1>{bolus != null ? bolus + " units" : "Invalid input"}</h1>
        </div>
    )
}

export default Bolus
