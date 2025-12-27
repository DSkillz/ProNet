import { useState, useEffect } from 'react';

/**
 * Hook personnalisé pour retarder une valeur
 * Utile pour la recherche en temps réel afin d'éviter trop de requêtes API
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
