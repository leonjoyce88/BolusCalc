
export interface Reading {
    mmol: number | "";
    timestamp?: number;
    trend?: string;
}
export type ReadingField = keyof Reading;
