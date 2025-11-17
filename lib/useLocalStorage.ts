import { useState, useEffect } from "react";

export function useLocalStorage(key: string, initialValue: any) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) {
      setValue(JSON.parse(stored));
    }
  }, [key]);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
