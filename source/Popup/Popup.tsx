import * as React from 'react';

import './styles.scss';

import { sendMessage } from './util';

import { browser } from 'webextension-polyfill-ts';
import { compressToEncodedURIComponent } from 'lz-string';

type User = {
  name: string;
  username: string;
  link: string;
  icon: string;
  id: string,
};

const Popup: React.FC = () => {
  const [users, setUsers] = React.useState<User[]>([]);
  const [images, setImages] = React.useState<(Blob | undefined)[]>([]);

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

      browser.storage.local.get('users').then(result => {
        const users = result.users;

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
          users: message.message
        });

        browser.runtime.onMessage.removeListener(func);
      }
    };

    browser.runtime.onMessage.addListener(func);

    await sendMessage({message: 'fetch'});
  };

  const profileClicked = (link: string) => {
    browser.tabs.create({url: link});
  };

  return <section id="popup">
    <div>Number of users: {users.length}</div>

    <button onClick={run}>Search / Refresh</button>

    <div style={{paddingTop: 20}}>
      {users.length ? <button onClick={copy}>Copy link to view on mobile phone</button> : null}
    </div>

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
        {users.map((user, index) => 
          <tr key={user.id}>
            <td>
              {images[index] 
                ? <span>
                  <span>{index}</span>
                  <img src={URL.createObjectURL(images[index]!)} alt="" width={100} height={100} /> 
                </span>
                : null
              }
            </td>
            <td>{user.username}</td>
            <td>{user.name}</td>
            <td>
              <a onClick={() => profileClicked(user.link)} href='#'>Profile</a>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </section>;
};

export default Popup;
