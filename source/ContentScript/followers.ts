import { getCookie, getUserLink, sleep } from './unfollowers';

type Follower = {
  pk: string
  pk_id: string
  username: string
  full_name: string
  is_private: boolean
  fbid_v2: string
  third_party_downloads_enabled: number
  strong_id__: string
  profile_pic_id: string
  profile_pic_url: string
  is_verified: boolean
  has_anonymous_profile_picture: boolean
  account_badges: any[]
  latest_reel_media: number
};

export async function getFollowers(appId: string) {  
  const results: Follower[] = [];
  let scrollCycle = 0;
  let url = followersUrlGenerator();
  let hasNext = true;
  let numberOfUsers = 0;

  while (hasNext) {
      console.log('next');
      
      let receivedData: {users: Follower[], has_more: boolean, next_max_id: string, page_size: number};
      try {
        const data = await fetch(url, {
          headers: {
            'x-ig-app-id': appId,
          }
        }).then(res => res.json());
        receivedData = data;
      } catch (e) {
          console.error(e);
          continue;
      }

      numberOfUsers += receivedData.page_size;
      hasNext = !!receivedData.next_max_id;
      url = followersUrlGenerator(receivedData.next_max_id);

      const users = receivedData.users;

      results.push(...users);

      await sleep(Math.floor(Math.random() * (1000 - 600)) + 1000);
      scrollCycle++;
      if (scrollCycle % 6 === 0 && scrollCycle !== 0) {
          scrollCycle = 0;
          console.log('Sleeping 10 secs to prevent getting temp blocked');
          // setToast({ show: true, text: 'Sleeping 10 secs to prevent getting temp blocked' });
          await sleep(10000);
      }
      // setToast({ show: false });
  }

  console.log(results);;
  

  return results.map(user => ({
    name: user.full_name,
    username: user.username,
    link: getUserLink(user.username),
    icon: user.profile_pic_url,
    id: user.pk_id,
  }));
  

  // setToast({ show: true, text: 'Scanning completed!' });
};

export function followersUrlGenerator(nextCode?: string): string {
  const ds_user_id = getCookie('ds_user_id');
  if (nextCode === undefined) {
      // First url
      return `https://www.instagram.com/api/v1/friendships/${ds_user_id}/followers/?count=12&search_surface=follow_list_page`;
  }
  return `
  https://www.instagram.com/api/v1/friendships/${ds_user_id}/followers/?count=12&max_id=${nextCode}&search_surface=follow_list_page`;
}