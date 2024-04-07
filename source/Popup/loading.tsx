import * as React from 'react';
import { browser } from 'webextension-polyfill-ts';
import { StorageKeys } from '../storage/storage';
import { isValueDefined } from '../util';

type Loading = 'loading-followers' | 'loading-unfollowers' | false;

const LoadingContext = React.createContext<Loading>(false);

export function LoadingProvider(props: {children: React.ReactNode}) {
  const [loadingValue, setLoadingValue] = React.useState<Loading>(false);

  React.useEffect(() => {
    browser.storage.local.get(StorageKeys.Loading)
      .then((result) => {
        const loading = result[StorageKeys.Loading];

        if (!isValueDefined(loading)) {
          return;
        }

        setLoadingValue(loading);
      });
  }, []);

  return <LoadingContext.Provider value={loadingValue}>
    {props.children}
  </LoadingContext.Provider>;
}
