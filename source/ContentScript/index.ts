import { browser } from 'webextension-polyfill-ts';
import { getUnfollowers } from './unfollowers';
import { getFollowers } from './followers';

browser.runtime.onMessage.addListener((request) => {
  if( request.message === 'fetch' ) {
    const notifyProgress = (value: string) => {
      browser.runtime.sendMessage({type: 'fetch-progress', message: value});
    };

    getUnfollowers(notifyProgress)
      .then(result => {
        console.log('send message');
        
        browser.runtime.sendMessage({type: 'fetch-result', message: result})
      })
      .catch(() => {
        browser.runtime.sendMessage({type: 'fetch-error'});
      });

  } else if( request.message === 'fetch-followers' ) {
    const html = document.documentElement.innerHTML;

    const regex = /"APP_ID":"(\d+)"/;
    const appId = html.match(regex)?.at(1);

    if (!appId) {
      browser.runtime.sendMessage({type: 'fetch-followers-error'});

      return;
    }

    const notify = (numberOfUsers: number) => {
      browser.runtime.sendMessage({type: 'fetch-followers-progress', message: numberOfUsers});
    };

    getFollowers(appId, notify)
      .then(result => {
        console.log('send message');
        
        browser.runtime.sendMessage({type: 'fetch-followers-result', message: result});
      })
      .catch(() => {
        browser.runtime.sendMessage({type: 'fetch-followers-error'});
      });
  }
});