import * as React from 'react';

import { UserHistory, UsersHistory } from './Followers';

export function HistoryAccordion(props: {history: UsersHistory}) {
  const historyDate = new Date(props.history.dt).toLocaleString();

  return <details>
    <summary role="button" className="outline">{historyDate}</summary>
    <div>
      <div>
        <h3>Added followers:</h3>
        {props.history.plus.length ? <UsersTable users={props.history.plus} /> : null}
      </div>
      <div>
        <h3>Unsubscribed followers:</h3>
        {props.history.minus.length ? <UsersTable users={props.history.minus} /> : null}
      </div>
    </div>
  </details>;
}

function UsersTable(props: {users: UserHistory[]}) {
  return <table>
    <thead>
      <tr>
        <th>Username</th>
        <th>Name</th>
      </tr>
    </thead>
    <tbody>
      {props.users.map(u => 
        <tr key={u.id}>
          <td>
            <a href={u.link} target='_blank'>{u.username}</a>
          </td>
          <td>
            {u.name}
          </td>
        </tr>
      )}
    </tbody>
  </table>
}