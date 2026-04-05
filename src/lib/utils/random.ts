export const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
export const randFloat = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 100) / 100;
export const randChoice = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
export const randDigits = (n: number) => Array.from({ length: n }, () => randInt(0, 9)).join('');
