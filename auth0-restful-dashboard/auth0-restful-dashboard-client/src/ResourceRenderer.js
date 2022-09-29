// src/ResourceRenderer.js

import React, { useState, useEffect } from 'react';
import ClientList from './ClientList';
import { useAuth0 } from './react-auth0-wrapper';

function handleResource(link, token){
  return fetch(link.uri, {
      method: "GET",
      headers: new Headers({"Accept": "application/json", 
                            "Authorization": `Bearer ${token}`})
    })
    .then(response => response.json())
}

function mapResourceToComponent(resource) {
  let currentComponent = null;

  if (resource.resourceType === "client-list") {
    currentComponent = <ClientList clients={resource.clients} />
  }
  
  return currentComponent;
}

function ResourceRenderer() {
  const [currentResource, setCurrentResource] = useState({});
  const { getTokenSilently } = useAuth0();

  const stateTransitionManager = {
    handleStateTransition: (link) => {
      getTokenSilently()
          .then(token =>handleResource(link, token))
        .then(resource => {
          if (typeof resource === "object") {
            setCurrentResource(resource)};
          })
        .catch(error => console.log(error));
    }    
  };

  useEffect(()=>{
    stateTransitionManager.handleStateTransition({uri: "/api"});
  }, []);

  return (
    <div>
      {mapResourceToComponent(currentResource)}
    </div>
  );
}

export default ResourceRenderer;