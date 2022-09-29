// src/ClientList.js

import React from 'react';
import './ClientList.css';

function ClientList(props) {
  const clients = props.clients.map( client =>
      <li key={client.id} 
      className='clientItem'>
        <b>{client.name}</b><br/>
        <i>{client.description}</i>
      </li>
    );

  return (
    <div>
      <h2>Your applications</h2>
      <ul className='clientList'>
        {clients}
      </ul>
    </div>
  );
}

export default ClientList;