import * as React from 'react';

import { browser } from 'webextension-polyfill-ts';
import { compressToEncodedURIComponent } from 'lz-string';
import { useVirtualizer } from '@tanstack/react-virtual';
import toast, { Toaster } from 'react-hot-toast';

import { sendMessage } from '../util';
import { StorageKeys } from '../../storage/storage';

type User = {
  name: string;
  username: string;
  link: string;
  icon: string;
  id: string,
};

export function Unfollowers() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [images, setImages] = React.useState<(Blob | undefined)[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState<string | undefined>(undefined);

  const link = React.useMemo(() => {

    const stringifiedParams = JSON.stringify(users.map(user => ({
      name: user.name,
      username: user.username,
      id: user.id,
      link: user.link,
    })));

    const compressed = compressToEncodedURIComponent(stringifiedParams);

    const params = new URLSearchParams({
      params: compressed,
    }).toString();

    return `https://ectuser.github.io/instagram-unfollowers-client/?${params}`
  }, [users]);

  const mounted = React.useRef(false);

  React.useEffect(() => {
    if (!mounted?.current) {

      browser.storage.local.get(StorageKeys.Unfollowers).then(result => {
        const users = result[StorageKeys.Unfollowers];

        if (users) {
          setUsers(users);
        }
      })

      mounted.current = true;
    }
  }, []);

  React.useEffect(() => {
    Promise.allSettled(
      users.map(user => fetch(user.icon).then(res => res.blob()))
    ).then(res => res.map(data => {
      if (data.status === 'fulfilled') {
        return data.value;
      }

      return undefined;
    })).then(transformed => {
      setImages(transformed);
    });
  }, [users]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      
      toast.success('Copied', {duration: 1000});
    } catch (error) {
      toast.error('Could not copy', {duration: 1000});
    }
  };

  const run = async () => {

    const func = (message: any) => {
      if (message.type === 'fetch-result') {

        setUsers(message.message);

        browser.storage.local.set({
          [StorageKeys.Unfollowers]: message.message
        });

        browser.runtime.onMessage.removeListener(func);

        setLoading(false);
        toast.success('Done! There are your unfollowers', {duration: 1000});
      } else if (message.type === 'fetch-progress') {
        setProgress(message.message);
      } else if (message.typ === 'fetch-error') {
        setLoading(false);
        toast.error('Error. Could not get unsubscribers.', {duration: 1500});
      }
    };

    browser.runtime.onMessage.addListener(func);

    setLoading(true);
    toast.loading('Start loading unfollowers', {duration: 1500});
    await sendMessage({message: 'fetch'});
  };

  const profileClicked = (link: string) => {
    browser.tabs.create({url: link});
  };

  const clearCache = () => {
    browser.storage.local.remove(StorageKeys.Unfollowers);
    setUsers([]);
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

    <div style={{display: 'flex', gap: '8px'}}>
      <button onClick={run} disabled={loading} aria-busy={loading}>Search / Refresh</button>
      <button onClick={clearCache} disabled={loading} aria-busy={loading}>Clear cache</button>
    </div>

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
                  <img style={{maxWidth: 'none', width: 50, height: 50}} src={URL.createObjectURL(images[virtualRow.index]!)} alt={users[virtualRow.index].username}/> 
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