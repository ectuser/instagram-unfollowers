import * as React from 'react';

import { StorageKeys, sendMessage } from './util';

import { browser } from 'webextension-polyfill-ts';
import { compressToEncodedURIComponent } from 'lz-string';
import { useVirtualizer } from '@tanstack/react-virtual';

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

    console.log('initial:', stringifiedParams.length);
    

    const compressed = compressToEncodedURIComponent(stringifiedParams);

    console.log(compressed);
    

    console.log('compressed:', compressed.length);

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
      
      alert('Copied');
    } catch (error) {
      alert('Could not copy');
    }
  };

  const run = async () => {
    console.log('run');

    const func = (message: any) => {
      console.log(message);
      
      if (message.type === 'fetch-result') {

        setUsers(message.message);

        browser.storage.local.set({
          [StorageKeys.Unfollowers]: message.message
        });

        browser.runtime.onMessage.removeListener(func);

        setLoading(false);
      } else if (message.type === 'fetch-progress') {
        setProgress(message.message);
      }
    };

    browser.runtime.onMessage.addListener(func);

    setLoading(true);
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
          <th>Link</th>
        </tr> 
      </thead>
      <tbody>
        {virtualizer.getVirtualItems().map((virtualRow) => 
          <tr key={virtualRow.key}>
            <td>
              {images[virtualRow.index] 
                ? <span>
                  <img src={URL.createObjectURL(images[virtualRow.index]!)} alt={users[virtualRow.index].username} width="500" height="500" /> 
                </span>
                : null
              }
            </td>
            <td>{users[virtualRow.index].username}</td>
            <td>{users[virtualRow.index].name}</td>
            <td>
              <a onClick={() => profileClicked(users[virtualRow.index].link)} href='#'>Profile</a>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>;
}