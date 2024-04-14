import * as React from 'react';
import { browser } from 'webextension-polyfill-ts';
import { isValueDefined } from '../util';

export function useInstagramPage() {
  const [isInstagramPage, setIsInstagramPage] = React.useState(false);

  React.useEffect(() => {
    browser.tabs.query({currentWindow: true, active: true}).then(tabs => {
      const tab = tabs.at(0);

      if (!isValueDefined(tab)) {
        return;
      }


      const url = tab!.url;

      const isInstagramPage = url!.includes('instagram.com');

      console.log({url, isInstagramPage});
      
      setIsInstagramPage(isInstagramPage);
    });
  }, []);

  return {isInstagramPage};
}

export const InstagramPageContext = React.createContext(false);

export function InstagramPageProvider(props: {children: React.ReactNode}) {
  const [isInstagramPage, setIsInstagramPage] = React.useState(false);
  const mounted = React.useRef(false);

  React.useEffect(() => {
    if (!mounted.current) {
      browser.tabs.query({currentWindow: true, active: true}).then(tabs => {
        const tab = tabs.at(0);
  
        if (!isValueDefined(tab)) {
          return;
        }
  
  
        const url = tab!.url;
  
        const isInstagramPage = url!.includes('instagram.com');
  
        console.log({url, isInstagramPage});
        
  
        setIsInstagramPage(isInstagramPage);
      });

      mounted.current = true;
    }
  }, [])

  return <InstagramPageContext.Provider value={isInstagramPage}>
    {props.children}
  </InstagramPageContext.Provider>
}
