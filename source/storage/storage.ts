export enum StorageKeys {
  Unfollowers = 'unfollowers',
  LoadingUnfollowers = 'loading-unfollowers',
  UnfollowersTimeFetched = 'unfollowers-time-fetched',

  Users = 'users',
  History = 'history',
  LoadingFollowers = 'loading-followers',
};

export type UserStorage = {
  id: string,
  username: string,
  name: string,
};

// Record<datetime, id[]>
export type HistoryStorage = Record<string, string[]>;