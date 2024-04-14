import * as React from 'react';

import { browser } from 'webextension-polyfill-ts';
import { useVirtualizer } from '@tanstack/react-virtual';
import toast, { Toaster } from 'react-hot-toast';

import { notInstagramText, sendMessage } from '../util';
import { InstagramPageContext, useInstagramPage } from '../detect-page';
import { useUnfollowers } from './useUnfollowers';
import { generateLinkFromUsers } from '../../util';
import { StorageKeys } from '../../storage/storage';
import { useStorage } from '../storage-manager';

export function Unfollowers() {
  const isInstagramPage = true;
  const {images, users, timeFetched} = useUnfollowers();
  const [loading] = useStorage<boolean | undefined>(StorageKeys.LoadingUnfollowers);
  const [progress, setProgress] = React.useState<string | undefined>(undefined);

  const copy = async () => {
    try {
      const link = generateLinkFromUsers(users);

      await navigator.clipboard.writeText(link);
      
      toast.success('Copied', {duration: 1000});
    } catch (error) {
      toast.error('Could not copy', {duration: 1000});
    }
  };

  const isButtonEnabled = () => {
    return isInstagramPage && !loading;
  };

  const run = async () => {

    if (!isButtonEnabled()) {
      if (!isInstagramPage) {
        toast.error(notInstagramText, {duration: 2500});
      }
      return;
    }

    const func = (message: {type: string, message: any}) => {
      if (message.type === 'fetch-result') {

        browser.runtime.onMessage.removeListener(func);

        toast.success('Done! There are your unfollowers', {duration: 1000});
      } else if (message.type === 'fetch-progress') {
        setProgress(message.message);
      } else if (message.type === 'fetch-error') {
        toast.error('Error. Could not get unsubscribers.', {duration: 1500});
      }
    };

    browser.runtime.onMessage.addListener(func);
    
    toast.loading('Start loading unfollowers', {duration: 1500});

    browser.runtime.sendMessage({type: 'fetch'});
    await sendMessage({type: 'fetch'});
  };

  const profileClicked = (link: string) => {
    browser.tabs.create({url: link});
  };

  const parentRef = React.useRef(null);
  const virtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45,
  });

  return <div ref={parentRef}>
    <Toaster />
    <h1>Number of users: {users.length}</h1>
    {timeFetched ? <div style={{paddingBottom: 20}}>Last time sync: {timeFetched}</div> : null}

    <button onClick={run} aria-busy={loading}>Search / Refresh</button>

    <div style={{paddingTop: 20}}>
      {users.length ? <button onClick={copy}>Copy link</button> : null}
    </div>

    {loading && progress ? <h4 style={{paddingTop: 20, paddingBottom: 20}}>Current progress: {progress}</h4> : null}

    <table style={{paddingTop: 20}}>
      <thead>
        <tr>
          <th></th>
          <th>Username</th>
          <th>Name</th>
        </tr> 
      </thead>
      <tbody>
        {virtualizer.getVirtualItems().map((virtualRow) => 
          <tr key={virtualRow.key}>
            <td>
              {images[virtualRow.index] 
                ? <span>
                  <img style={{maxWidth: 'none', width: 50, height: 50, borderRadius: 50}} src={URL.createObjectURL(images[virtualRow.index]!)} alt={users[virtualRow.index].username}/> 
                </span>
                : null
              }
            </td>
            <td>
              <a onClick={() => profileClicked(users[virtualRow.index].link)} href='#'>{users[virtualRow.index].username}</a>
            </td>
            <td>{users[virtualRow.index].name}</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>;
}