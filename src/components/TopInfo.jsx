const MinutesInMs = 60000
const TopInfo = ({ reading, setReading }) => {
    const minutesFromReading = Math.trunc((Date.now() - reading.timestamp) / MinutesInMs)
    return (
        <div className="top-info">
            <div className="form-row">
                <label htmlFor="blood-glucose">Current Blood Glucose:</label>
                <input id="blood-glucose" type="number" value={reading ? reading.mmol : "6"} onChange={e => setReading({ ...reading, mmol: e.target.value })} />
            </div>

            <div className="trend-time-row">
                <span className="trend-label">Trend:</span>
                <span>{reading.trend ? reading.trend : "Waiting for Data"}</span>
                <span>{reading.timestamp ? minutesFromReading + (minutesFromReading == 1 ? " minute " : " minutes ") + "ago" : 'Waiting for Data'}</span>
            </div>
        </div>)
};
export default TopInfo;
