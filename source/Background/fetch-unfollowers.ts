import { browser } from 'webextension-polyfill-ts';

import { StorageKeys } from '../storage/storage';
import { UnfollowerUser } from '../Popup/unfollowers/useUnfollowers';
import { generateLinkFromUsers } from '../util';

let timer: NodeJS.Timeout | undefined;

export function handleFetch() {
  browser.storage.local.set({
    [StorageKeys.LoadingUnfollowers]: true,
  });

  setTimer();
}

export function handleFetchResult(message: any) {
  const users: UnfollowerUser[] = message;

  browser.storage.local.set({
    [StorageKeys.Unfollowers]: users,
    [StorageKeys.UnfollowersTimeFetched]: new Date().getTime(),
  });

  const link = generateLinkFromUsers(users);

  // browser.tabs.create({url: link});

  reset();
}

export function handleFetchError() {
  reset();
}

export function handleFetchProgress() {
  setTimer();
}

function reset() {
  browser.storage.local.set({
    [StorageKeys.LoadingUnfollowers]: false,
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
