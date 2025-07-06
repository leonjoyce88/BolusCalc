import { FormData } from "../types/form";
import styles from "../styles/Inputs.module.css"

interface InputsProps {
    formData: FormData;
    handleFormChange: (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Inputs: React.FC<InputsProps> = ({ formData, handleFormChange }) => {
    return (
        <div className={styles.container}>
            <div className={styles.formRow}>
                <label htmlFor="carb-ratio">Carb ratio (grams/unit):</label>
                <input id="carb-ratio" type="number" value={formData.ratio} onChange={handleFormChange("ratio")} />
            </div>

            <div className={styles.formRow}>
                <label htmlFor="correction-factor">Correction Factor (mmol/unit):</label>
                <input id="correction-factor" type="number" value={formData.factor} onChange={handleFormChange("factor")} />
            </div>

            <div className={styles.formRow}>
                <label htmlFor="target">Target mmol:</label>
                <input id="target" type="number" value={formData.target} onChange={handleFormChange("target")} placeholder="Enter target mmol" />
            </div>

            <div className={styles.formRow}>
                <label htmlFor="meal-carbs">Meal Carbs (grams):</label>
                <input id="meal-carbs" type="number" value={formData.carbs} onChange={handleFormChange("carbs")} />
            </div>
        </div>

    )
}

export default Inputs
