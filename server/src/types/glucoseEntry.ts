
export enum Trend {
    DoubleUp,
    SingleUp,
    FortyFiveUp,
    Flat,
    FortyFiveDown,
    SingleDown,
    DoubleDown,
}

export interface GlucoseEntry {
    mgdl: number;
    mmol: number;
    trend: Trend;
    timestamp: number;
}
