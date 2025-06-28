export interface FormData {
    ratio: number | "";
    factor: number | "";
    target: number | "";
    carbs: number | "";
}

export type FormField = keyof FormData;
