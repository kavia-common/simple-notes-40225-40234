import { useEffect, useState } from 'react';
import { storage } from '../utils/storage';

/**
 * PUBLIC_INTERFACE
 * useLocalStorage persists a piece of state to localStorage.
 */
function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    const fromStore = storage.get(key);
    return fromStore !== null && fromStore !== undefined ? fromStore : defaultValue;
  });

  useEffect(() => {
    storage.set(key, value);
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;
