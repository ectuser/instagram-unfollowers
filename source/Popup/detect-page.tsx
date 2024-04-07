import * as React from 'react';
import { browser } from 'webextension-polyfill-ts';
import { isValueDefined } from '../util';

export const InstagramPageContext = React.createContext(false);

export function InstagramPageProvider(props: {children: React.ReactNode}) {
  const [isInstagramPage, setIsInstagramPage] = React.useState(false);

  React.useEffect(() => {
    browser.tabs.query({currentWindow: true, active: true}).then(tabs => {
      const tab = tabs.at(0);

      if (!isValueDefined(tab)) {
        return;
      }


      const url = tab!.url;

      const isInstagramPage = url!.includes('instagram.com');

      setIsInstagramPage(isInstagramPage);
    });
  }, [])

  return <InstagramPageContext.Provider value={isInstagramPage}>
    {props.children}
  </InstagramPageContext.Provider>
}
