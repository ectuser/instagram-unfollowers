import * as React from 'react';
import { browser } from 'webextension-polyfill-ts';

import { useVirtualizer } from '@tanstack/react-virtual';
import toast, { Toaster } from 'react-hot-toast';

import { notInstagramText, sendMessage } from '../util';
import { HistoryStorage, StorageKeys, UserStorage } from '../../storage/storage';
import { HistoryAccordion } from './HistoryAccordion';
import { getUserLink } from '../../ContentScript/unfollowers';
import { InstagramPageContext } from '../detect-page';
import { useStorage } from '../storage-manager';

export type FollowerUser = {
  name: string;
  username: string;
  link: string;
  icon: string;
  id: string,
};

type History = {
  dt: string,
  ids: string[],
};

export type ChangedHistory = {
  dt: string,
  plus: string[], // new ids
  minus: string[], // excluded ids
};

export type UserHistory = {id: string, username: string, name: string, link: string};

export type UsersHistory = {
  dt: string,
  plus: UserHistory[],
  minus: UserHistory[],
};

export function Followers() {
  const isInstagramPage = true;
  
  const [loading] = useStorage<boolean | undefined>(StorageKeys.LoadingFollowers);
  const [users, setUsers] = React.useState<UserStorage[]>([]);
  const [history, setHistory] = React.useState<HistoryStorage | undefined>(undefined);
  const [numberOfUsers, setNumberOfUsers] = React.useState<number | undefined>(undefined);
  const mounted = React.useRef(false);

  const historyArr: ChangedHistory[] = React.useMemo(() => {
    if (history === undefined) {
      return [];
    }

    const allHistory = Object.entries(history).map(([key, value]) => {
      const h: History = {dt: key, ids: value};

      return h;
    }).sort((a: History, b: History) => {
      const aDate = new Date(a.dt).getTime();
      const bDate = new Date(b.dt).getTime();

      return aDate - bDate;
    });

    const changedHistory: ChangedHistory[] = [];

    for (let index = 0; index < allHistory.length; index++) {
      const currItem = allHistory[index];

      if (index === 0) {
        changedHistory.push({dt: currItem.dt, plus: currItem.ids, minus: []});
        continue;
      }

      const lastItem = allHistory[index - 1];

      const a = lastItem.ids;
      const b = currItem.ids;
      
      const plus = b.filter(item => !a.includes(item));
      const minus = a.filter(item => !b.includes(item));
      
      changedHistory.push({dt: currItem.dt, plus, minus});
      
    }

    return changedHistory.reverse();
  }, [history]);

  const usersHistory: UsersHistory[] = React.useMemo(() => {
    return historyArr.map(h => {
      const plus: UserHistory[] = h.plus.map(id => {
        const u = users.find(item => item.id === id);

        if (!u) {
          return undefined;
        }

        const res: UserHistory = {id: u.id, username: u.username, name: u.name, link: getUserLink(u.username)};

        return res;
      }).filter(res => !!res) as UserHistory[];

      const minus: UserHistory[] = h.minus.map(id => {
        const u = users.find(item => item.id === id);

        if (!u) {
          return undefined;
        }

        const res: UserHistory = {id: u.id, username: u.username, name: u.name, link: getUserLink(u.username)};

        return res;
      }).filter(res => !!res) as UserHistory[];

      const result: UsersHistory = { dt: h.dt, plus, minus };

      return result;
    });
  }, [historyArr, users]);

  React.useEffect(() => {
    if (!mounted?.current) {

      browser.storage.local.get(StorageKeys.Users).then(result => {
        const users = result[StorageKeys.Users];

        if (users) {
          setUsers(users);
        }
      });

      browser.storage.local.get(StorageKeys.History).then(result => {
        const history = result[StorageKeys.History];

        if (history) {
          setHistory(history);
        }
      });

      mounted.current = true;
    }
  }, []);

  const buttonEnabled = () => {
    return !loading && isInstagramPage;
  }

  const trackFollowers = async () => {

    if (!buttonEnabled()) {
      if (!isInstagramPage) {
        toast.error(notInstagramText, {duration: 2500});
      } else if (loading) {
        toast.error('Currently loading', {duration: 2500});
      }

      return;
    }

    const func = (message: any) => {
      if (message.type === 'fetch-followers-result') {
        browser.runtime.onMessage.removeListener(func);
        setNumberOfUsers(undefined);
        toast.success('Done! There are your followers!', {duration: 1000});
      }

      if (message.type === 'fetch-followers-progress') {
        setNumberOfUsers(message.message);
      }

      if (message.type === 'fetch-followers-error') {
        setNumberOfUsers(undefined);
        toast.error('Error. Could not get followers.', {duration: 1500});
      }
    };

    browser.runtime.onMessage.addListener(func);

    toast.loading('Start loading followers', {duration: 1500});
    
    browser.runtime.sendMessage({type: 'fetch-followers'});
    await sendMessage({type: 'fetch-followers'});
  };

  const parentRef = React.useRef(null);
  const virtualizer = useVirtualizer({
    count: usersHistory.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45,
  });

  return <div ref={parentRef}>
    <Toaster />
    <button
      onClick={trackFollowers}
      aria-busy={loading}
    >
      {loading ? 'Loading followers. Please wait...' : 'Track followers'}
    </button>

    <h1 style={{paddingTop: 20}}>History of followers</h1>

    {loading 
    ? <>
      <h4 style={{paddingTop: 20, paddingBottom: 20}}>Loaded {numberOfUsers} followers</h4>
    </>
    : null}

    <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>{virtualizer.getVirtualItems().map((virtualRow) => 
      <HistoryAccordion history={usersHistory[virtualRow.index]} key={virtualRow.key} />)}
    </div>
  </div>;
}
