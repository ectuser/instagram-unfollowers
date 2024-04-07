import * as React from 'react';

import { browser } from 'webextension-polyfill-ts';

import './styles.scss';
import { TabBody, TabsContent } from './Tabs';
import { InstagramPageContext } from './detect-page';

export type AvailableTabs = 'unfollowers' | 'followers';

const Popup: React.FC = () => {
  const isInstagramPage = React.useContext(InstagramPageContext);
  const [tab, setTab] = React.useState<AvailableTabs>('unfollowers');

  return <section id="popup">
    {isInstagramPage 
    ? <>
      <TabsContent tab={tab} tabClicked={(selectedTab) => setTab(selectedTab)} />
      <br />
      <br />
      <TabBody tab={tab} />
    </>
    : <>
      <h3 style={{textAlign: 'center'}}>To fully enjoy the features of this Chrome extension, please navigate to the Instagram webpage. The extension is designed to operate exclusively within the Instagram environment, ensuring a tailored and seamless experience. Functionality will become available once you are on Instagram's site</h3>
      <button style={{width: '100%'}} onClick={() => browser.tabs.create({url: 'https://www.instagram.com/'})}>Go to Instagram</button>
    </> }
  </section>;
};

export default Popup;
