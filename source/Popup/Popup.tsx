import * as React from 'react';

import './styles.scss';
import { TabBody, TabsContent } from './Tabs';

export type AvailableTabs = 'unfollowers' | 'followers';

const Popup: React.FC = () => {
  const [tab, setTab] = React.useState<AvailableTabs>('unfollowers');

  return <section id="popup">
    <TabsContent tab={tab} tabClicked={(selectedTab) => setTab(selectedTab)} />
    <br />
    <br />
    <TabBody tab={tab} />
  </section>;
};

export default Popup;
