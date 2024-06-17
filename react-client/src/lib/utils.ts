import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pluralize(count: number, singular: string, plural?: string) {
  const pluralForm = plural || `${singular}s`;
  return count === 0 || count > 1 ? pluralForm : singular;
}
