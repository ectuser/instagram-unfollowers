import { browser } from 'webextension-polyfill-ts';
import { getMockData } from './mock';

export {};

browser.runtime.onMessage.addListener((request, sender) => {
  if( request.message === 'fetch' ) {
    scan()
      .then(result => {
        console.log('send message');
        
        browser.runtime.sendMessage({type: 'fetch-result', message: result})
      })
      .catch(() => {});
  }
});


async function scan() {
  // console.log('start');

  // const result = await Promise.resolve(getMockData());

  // console.log(result);

  // return result;
  
  
  const results: Node[] = [];
  let scrollCycle = 0;
  let url = urlGenerator();
  let hasNext = true;
  let currentFollowedUsersCount = 0;
  let totalFollowedUsersCount = -1;

  while (hasNext) {
      console.log('next');
      
      let receivedData: User;
      try {
        const data = await fetch(url).then(res => res.json());
        receivedData = data.data.user.edge_follow;
        console.log(receivedData);
      } catch (e) {
          console.error(e);
          continue;
      }

      if (totalFollowedUsersCount === -1) {
          totalFollowedUsersCount = receivedData.count;
      }

      hasNext = receivedData.page_info.has_next_page;
      url = urlGenerator(receivedData.page_info.end_cursor);
      currentFollowedUsersCount += receivedData.edges.length;
      receivedData.edges.forEach(x => results.push(x.node));

      await sleep(Math.floor(Math.random() * (1000 - 600)) + 1000);
      scrollCycle++;
      if (scrollCycle > 6) {
          scrollCycle = 0;
          console.log('Sleeping 10 secs to prevent getting temp blocked');
          // setToast({ show: true, text: 'Sleeping 10 secs to prevent getting temp blocked' });
          await sleep(10000);
      }
      // setToast({ show: false });
  }

  const nonFollow = results
    .filter(user => user.followed_by_viewer && !user.follows_viewer)
    .map(user => ({
      name: user.full_name,
      username: user.username,
      link: getUserLink(user.username),
      icon: user.profile_pic_url,
      id: user.id,
    }));

  console.log(JSON.stringify(nonFollow));

  return nonFollow;
  

  // setToast({ show: true, text: 'Scanning completed!' });
};

export function urlGenerator(nextCode?: string): string {
  const ds_user_id = getCookie('ds_user_id');
  if (nextCode === undefined) {
      // First url
      return `https://www.instagram.com/graphql/query/?query_hash=3dec7e2c57367ef3da3d987d89f9dbc8&variables={"id":"${ds_user_id}","include_reel":"true","fetch_mutual":"false","first":"24"}`;
  }
  return `https://www.instagram.com/graphql/query/?query_hash=3dec7e2c57367ef3da3d987d89f9dbc8&variables={"id":"${ds_user_id}","include_reel":"true","fetch_mutual":"false","first":"24","after":"${nextCode}"}`;
}

export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length !== 2) {
      return null;
  }
  return parts.pop()!.split(';').shift()!;
}

export function sleep(ms: number): Promise<any> {
  return new Promise(resolve => {
      setTimeout(resolve, ms);
  });
}

function getUserLink(username: string) {
  return `https://www.instagram.com/${username}`;
}

export function unfollowUserUrlGenerator(idToUnfollow: string): string {
  return `https://www.instagram.com/web/friendships/${idToUnfollow}/unfollow/`;
}

export interface User {
  readonly count: number;
  readonly page_info: PageInfo;
  readonly edges: Edge[];
}

export interface Edge {
  readonly node: Node;
}

export interface Node {
  readonly id: string;
  readonly username: string;
  readonly full_name: string;
  readonly profile_pic_url: string;
  readonly is_private: boolean;
  readonly is_verified: boolean;
  readonly followed_by_viewer: boolean;
  readonly follows_viewer: boolean;
  readonly requested_by_viewer: boolean;
  readonly reel: Reel;
}

export interface Reel {
  readonly id: string;
  readonly expiring_at: number;
  readonly has_pride_media: boolean;
  readonly latest_reel_media: number;
  readonly seen: null;
  readonly owner: Owner;
}

export interface Owner {
  readonly __typename: Typename;
  readonly id: string;
  readonly profile_pic_url: string;
  readonly username: string;
}

export enum Typename {
  GraphUser = 'GraphUser',
}

export interface PageInfo {
  readonly has_next_page: boolean;
  readonly end_cursor: string;
}

