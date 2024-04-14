import {browser} from 'webextension-polyfill-ts';

import { handleFetch, handleFetchError, handleFetchProgress, handleFetchResult } from './fetch-unfollowers';
import { handleFetchFollowersError, handleFetchFollowers, handleFetchFollowersProgress, handleFetchFollowersResult } from './fetch-followers';

browser.runtime.onMessage.addListener(handler);

function handler({message, type}: {message: any, type: string}) {
  console.log({message, type});
  
  if (type === 'fetch') {
    handleFetch();
  }

  if (type === 'fetch-result') {
    handleFetchResult(message);
  }

  if (type === 'fetch-progress') {
    handleFetchProgress();
  }

  if (type === 'fetch-error') {
    handleFetchError();
  }

  // fetch followers

  if (type === 'fetch-followers') {
    handleFetchFollowers();
  }

  if (type === 'fetch-followers-progress') {
    handleFetchFollowersProgress();
  }

  if (type === 'fetch-followers-result') {
    handleFetchFollowersResult(message);
  }

  if (type === 'fetch-followers-error') {
    handleFetchFollowersError();
  }

}
