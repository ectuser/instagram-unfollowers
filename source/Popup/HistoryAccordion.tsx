import * as React from 'react';

import { UserHistory, UsersHistory } from './Followers';

export function HistoryAccordion(props: {history: UsersHistory}) {
  const [open, setOpen] = React.useState(false);

  const historyDate = new Date(props.history.dt).toLocaleString();

  return <div>
    <button style={{width: '100%', display: 'flex', justifyContent: 'space-between'}} className='outline secondary' onClick={() => setOpen(val => !val)}>
      <span>{historyDate}</span>
      <span>{open ? '-' : '+'}</span>
    </button>
    {open 
    ? <>
      <div>
        <h3>Added followers:</h3>
        {props.history.plus.length ? <UsersTable users={props.history.plus} /> : null}
      </div>
      <div>
        <h3>Unsubscribed followers:</h3>
        {props.history.minus.length ? <UsersTable users={props.history.minus} /> : null}
      </div>
    </>
    : null}
  </div>;
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