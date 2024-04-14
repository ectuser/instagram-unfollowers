import { useEffect, useRef, useState } from 'react';
import { browser } from 'webextension-polyfill-ts';

import { StorageKeys } from '../storage/storage';

export function useStorage<T>(key: StorageKeys) {
  const [val, setVal] = useState<T | undefined>(undefined);
  const mounted = useRef(false);

  useEffect(() => console.log, [val])

  useEffect(() => {
    let handler: any;

    if (!mounted.current) {

      browser.storage.local.get(key).then((data) => {
        const result = data[key];

        if (!result) return;

        setVal(result);
      });

      handler = (data: any, areaName: any) => {
        if (areaName !== 'local') return;

        const value = data[key] as {oldValue: T | undefined, newValue: T | undefined};

        if (!value) return;

        setVal(value.newValue);
      }

      browser.storage.onChanged.addListener(handler);

      mounted.current = true;
    }

    return () => {
      console.log('clearing');
      

      if (handler && browser.storage.onChanged.hasListener(handler)) {
        console.log('clear listener');
        
        browser.storage.onChanged.addListener(handler);
      }
    };
  }, []);

  return [val];
}