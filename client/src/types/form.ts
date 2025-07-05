export interface FormData {
    ratio: string;
    factor: string;
    target: string;
    carbs: string;
}

export type FormField = keyof FormData;
