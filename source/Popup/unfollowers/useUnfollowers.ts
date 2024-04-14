import * as React from 'react';

import { StorageKeys } from '../../storage/storage';
import { useStorage } from '../storage-manager';

export type UnfollowerUser = {
  name: string;
  username: string;
  link: string;
  icon: string;
  id: string,
};

export function useUnfollowers() {
  const [usersVal] = useStorage<UnfollowerUser[]>(StorageKeys.Unfollowers);
  const [unfollowersTimeFetched] = useStorage<number>(StorageKeys.UnfollowersTimeFetched);
  const [images, setImages] = React.useState<(Blob | undefined)[]>([]);

  const users = usersVal ?? [];

  const timeFetched = unfollowersTimeFetched ? new Date(unfollowersTimeFetched).toLocaleString() : '';

  React.useEffect(() => {
    console.log({users});
    

    Promise.allSettled(
      users.map(user => fetch(user.icon).then(res => res.blob()))
    ).then(res => res.map(data => {
      if (data.status === 'fulfilled') {
        return data.value;
      }

      return undefined;
    })).then(transformed => {
      setImages(transformed);
    });
  }, [users]);

  return {users, images, timeFetched};
}