import { browser } from 'webextension-polyfill-ts';
import { getUnfollowers } from './unfollowers';
import { getFollowers } from './followers';

browser.runtime.onMessage.addListener((request, sender) => {
  if( request.message === 'fetch' ) {
    getUnfollowers()
      .then(result => {
        console.log('send message');
        
        browser.runtime.sendMessage({type: 'fetch-result', message: result})
      })
      .catch(() => {});
  } else if( request.message === 'fetch-followers' ) {

    
    const html = document.documentElement.innerHTML;

    const regex = /"APP_ID":"(\d+)"/;
    const appId = html.match(regex)?.at(1);

    if (!appId) {
      console.log('Cannot extract app id');
      
      return;
    }

    getFollowers(appId)
      .then(result => {
        console.log('send message');
        
        browser.runtime.sendMessage({type: 'fetch-followers-result', message: result})
      })
      .catch(() => {});
  }
});