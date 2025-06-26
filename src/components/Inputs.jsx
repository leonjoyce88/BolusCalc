
const Inputs = ({ ratio, factor, target, carbs, setRatio, setFactor, setTarget, setCarbs }) => {
    return (
        <div className="container">
            <div className="form-row">
                <label htmlFor="carb-ratio">Carb ratio (grams/unit):</label>
                <input id="carb-ratio" type="number" value={ratio} onChange={e => setRatio(e.target.value)} />
            </div>

            <div className="form-row">
                <label htmlFor="correction-factor">Correction Factor (mmol/unit):</label>
                <input id="correction-factor" type="number" value={factor} onChange={e => setFactor(e.target.value)} />
            </div>

            <div className="form-row">
                <label htmlFor="target">Target mmol:</label>
                <input id="target" type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="Enter target mmol" />
            </div>

            <div className="form-row">
                <label htmlFor="meal-carbs">Meal Carbs (grams):</label>
                <input id="meal-carbs" type="number" value={carbs} onChange={e => setCarbs(e.target.value)} />
            </div>
        </div>

    )
}

export default Inputs
