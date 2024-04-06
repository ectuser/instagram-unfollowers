import * as React from 'react';
import { Unfollowers } from './Unfollowers';
import { Followers } from './Followers';
import { AvailableTabs } from './Popup';


export function TabBody(props: {tab: AvailableTabs}) {
  return <div>
    {
      props.tab === 'unfollowers' 
      ? <Unfollowers /> 
      : props.tab === 'followers' 
      ?  <Followers /> : null
    }
  </div>;
}

export function TabsContent(props: {tab: AvailableTabs, tabClicked: (tab: AvailableTabs) => void}) {
  return <div style={{display: 'flex', gap: '8px'}}>
    <Tab isActive={props.tab === 'unfollowers'} tabClicked={() => props.tabClicked('unfollowers')}>Unfollowers</Tab>
    <Tab isActive={props.tab === 'followers'} tabClicked={() => props.tabClicked('followers')}>Followers</Tab>
  </div>;
}

export function Tab(props: {isActive: boolean, children: React.ReactNode, tabClicked: () => void}) {
  return <button className={!props.isActive ? 'outline' : 'primary'} onClick={() => props.tabClicked()}>
    {props.children}
  </button>;
}