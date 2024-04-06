import * as React from 'react';
import { browser } from 'webextension-polyfill-ts';
import { StorageKeys, sendMessage } from './util';
import { HistoryStorage, UserStorage } from './storage';
import { HistoryAccordion } from './HistoryAccordion';
import { getUserLink } from '../ContentScript/unfollowers';

type User = {
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
  const [users, setUsers] = React.useState<UserStorage[]>([]);
  const [history, setHistory] = React.useState<HistoryStorage | undefined>(undefined);
  const mounted = React.useRef(false);

  const historyArr: ChangedHistory[] = React.useMemo(() => {
    console.log(1, history);
    

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

    console.log(2, allHistory);
    

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
      console.log(3, changedHistory);
      
    }

    console.log(changedHistory);
    

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


  const trackFollowers = async () => {
    console.log('run');

    const func = (message: any) => {
      console.log(message);
      
      if (message.type === 'fetch-followers-result') {

        const currentFollowers: User[] = message.message;

        processUsers(currentFollowers);
        processHistory(currentFollowers)

        browser.runtime.onMessage.removeListener(func);
      }
    };

    browser.runtime.onMessage.addListener(func);

    await sendMessage({message: 'fetch-followers'});
  };

  const processUsers = (currentFollowers: User[]) => {
    const missingStorageUsers = currentFollowers.filter(f => {
      const existingUser = users.find(u => u.id === f.id);

      return !existingUser;
    });

    const storageMissingUsers: UserStorage[] = missingStorageUsers.map(u => ({
      id: u.id,
      username: u.username,
      name: u.name,
    }));

    const usersToStore: UserStorage[] = [...users, ...storageMissingUsers];
    
    console.log({storageMissingUsers, usersToStore, users});
    

    setUsers(usersToStore);

    browser.storage.local.set({
      [StorageKeys.Users]: usersToStore,
    });
  };

  const processHistory = (currentFollowers: User[]) => {
    const dt = new Date().toISOString();

    const ids = currentFollowers.map(f => f.id);

    const newHistoryObj: HistoryStorage = {[dt]: ids};

    const historyToStore = {
      ...(history ?? {}),
      ...newHistoryObj
    };

    console.log(historyToStore);
    

    setHistory(historyToStore);

    browser.storage.local.set({
      [StorageKeys.History]: historyToStore,
    });
  };

  return <div>
    <button onClick={trackFollowers}>Track followers</button>

    <h1>History of followers</h1>

    <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>{usersHistory.map(h => 
      <HistoryAccordion history={h} key={h.dt} />)}
    </div>
  </div>;
}