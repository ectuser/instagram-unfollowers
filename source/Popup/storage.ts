export type UserStorage = {
  id: string,
  username: string,
  name: string,
};

// Record<datetime, id[]>
export type HistoryStorage = Record<string, string[]>;