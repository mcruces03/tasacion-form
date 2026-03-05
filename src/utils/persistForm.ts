import type { ValoracionForm } from '../types';
import { defaultFormValues } from '../types';

const STORAGE_KEY = 'valoracion-form-data';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function loadFormFromStorage(): ValoracionForm {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultFormValues;

    const parsed = JSON.parse(raw) as unknown;
    if (!isPlainObject(parsed)) return defaultFormValues;

    const merged: ValoracionForm = { ...defaultFormValues };

    const m = merged as unknown as Record<string, unknown>;
    for (const key of Object.keys(defaultFormValues) as (keyof ValoracionForm)[]) {
      const defaultValue = defaultFormValues[key];
      const storedValue = parsed[key];

      if (storedValue === undefined) continue;

      if (Array.isArray(defaultValue)) {
        m[key] = Array.isArray(storedValue)
          ? (storedValue as string[]).slice(0, 20).map((v) => (typeof v === 'string' ? v : ''))
          : defaultValue;
      } else if (typeof defaultValue === 'boolean') {
        m[key] = Boolean(storedValue);
      } else if (typeof defaultValue === 'string') {
        m[key] = typeof storedValue === 'string' ? storedValue : '';
      }
    }

    return merged;
  } catch {
    return defaultFormValues;
  }
}

export function saveFormToStorage(form: ValoracionForm): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  } catch {
    // ignore quota or other storage errors
  }
}
