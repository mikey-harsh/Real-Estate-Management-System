import { useState, useCallback } from 'react';

const STORAGE_KEY = 'be_recently_viewed';
const MAX_ITEMS = 6;

export interface RecentlyViewedProperty {
  id: string;
  title: string;
  location: string;
  price: string;
  image: string;
  beds: number;
  baths: number;
  sqft: number;
}

function readFromStorage(): RecentlyViewedProperty[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedProperty[]>(readFromStorage);

  const addItem = useCallback((item: RecentlyViewedProperty) => {
    setItems(prev => {
      const deduped = prev.filter(i => i.id !== item.id);
      const next = [item, ...deduped].slice(0, MAX_ITEMS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch { /* ignore quota errors */ }
      return next;
    });
  }, []);

  const clearItems = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setItems([]);
  }, []);

  return { items, addItem, clearItems };
}
