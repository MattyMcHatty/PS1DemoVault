import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEY } from '../constants';

export function useCollected() {
  const [collected, setCollected] = useState<Set<number>>(new Set());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) setCollected(new Set(JSON.parse(raw) as number[]));
    });
  }, []);

  const toggle = useCallback((id: number) => {
    setCollected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  return { collected, toggle };
}
