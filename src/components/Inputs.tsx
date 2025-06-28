import { FormData } from "../types/form";

interface InputsProps {
    formData: FormData;
    handleFormChange: (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Inputs: React.FC<InputsProps> = ({ formData, handleFormChange }) => {
    return (
        <div className="container">
            <div className="form-row">
                <label htmlFor="carb-ratio">Carb ratio (grams/unit):</label>
                <input id="carb-ratio" type="number" value={formData.ratio} onChange={handleFormChange("ratio")} />
            </div>

            <div className="form-row">
                <label htmlFor="correction-factor">Correction Factor (mmol/unit):</label>
                <input id="correction-factor" type="number" value={formData.factor} onChange={handleFormChange("factor")} />
            </div>

            <div className="form-row">
                <label htmlFor="target">Target mmol:</label>
                <input id="target" type="number" value={formData.target} onChange={handleFormChange("target")} placeholder="Enter target mmol" />
            </div>

            <div className="form-row">
                <label htmlFor="meal-carbs">Meal Carbs (grams):</label>
                <input id="meal-carbs" type="number" value={formData.carbs} onChange={handleFormChange("carbs")} />
            </div>
        </div>

    )
}

export default Inputs
