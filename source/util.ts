import { compressToEncodedURIComponent } from 'lz-string';

import { UnfollowerUser } from './Popup/unfollowers/useUnfollowers';

export function isValueDefined(val: unknown) {
  return val !== null && val !== undefined;
}

export function generateLinkFromUsers(users: UnfollowerUser[]) {
  const stringifiedParams = JSON.stringify(users.map(user => ({
    name: user.name,
    username: user.username,
    id: user.id,
    link: user.link,
  })));

  const compressed = compressToEncodedURIComponent(stringifiedParams);

  const params = new URLSearchParams({
    params: compressed,
  }).toString();

  return `https://ectuser.github.io/instagram-unfollowers-client/?${params}`;
} 
