import { browser } from 'webextension-polyfill-ts';

import { HistoryStorage, StorageKeys, UserStorage } from '../storage/storage';
import { FollowerUser } from '../Popup/followers/Followers';
import { isValueDefined } from '../util';

let timer: NodeJS.Timeout | undefined;

export function handleFetchFollowers() {
  browser.storage.local.set({
    [StorageKeys.LoadingFollowers]: true,
  });

  setTimer();
}

export function handleFetchFollowersResult(message: any) {
  const currentFollowers: FollowerUser[] = message;

  processHistory(currentFollowers);
  processUsers(currentFollowers);
  
  reset();
}

export function handleFetchFollowersError() {
  reset();
}

export function handleFetchFollowersProgress() {
  setTimer();
}

function reset() {
  browser.storage.local.set({
    [StorageKeys.LoadingFollowers]: false,
  });

  if (timer) {
    clearTimeout(timer);
  }
}

function setTimer() {
  if (timer) {
    clearTimeout(timer);
  }

  timer = setTimeout(() => {
    // no response in 10 seconds
    
    console.log('reset timeout');

    reset();
  }, 30000);
}

async function processUsers(currentFollowers: FollowerUser[]) {
  const existingUsers: UserStorage[]  = (await browser.storage.local.get(StorageKeys.Users))[StorageKeys.Users];

  if (!isValueDefined(existingUsers)) {
    return;
  }

  const missingStorageUsers = currentFollowers.filter(f => {
    const existingUser = existingUsers.find(u => u.id === f.id);

    return !existingUser;
  });

  const storageMissingUsers: UserStorage[] = missingStorageUsers.map(u => ({
    id: u.id,
    username: u.username,
    name: u.name,
  }));

  const usersToStore: UserStorage[] = [...existingUsers, ...storageMissingUsers];

  browser.storage.local.set({
    [StorageKeys.Users]: usersToStore,
  });
};

async function processHistory(currentFollowers: FollowerUser[]) {
  const dt = new Date().toISOString();

  const ids = currentFollowers.map(f => f.id);

  const newHistoryObj: HistoryStorage = {[dt]: ids};

  const history = await browser.storage.local.get(StorageKeys.History).then(result => {
    const history = result[StorageKeys.History];

    return history;
  });;

  const historyToStore = {
    ...(history ?? {}),
    ...newHistoryObj
  };

  browser.storage.local.set({
    [StorageKeys.History]: historyToStore,
  });
};
