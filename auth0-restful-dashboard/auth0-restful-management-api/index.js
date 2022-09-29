//index.js
const express = require('express');
const Auth0Manager = require('./Auth0Manager');

const bodyParser = require('body-parser');    //import the body-parser library

//const jwt = require('express-jwt');        //<--- newly added
const { expressjwt: expressJwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');    //<--- newly added

require('dotenv').config();

const app = express();

const apiPrefix = '/api';


const checkJwt = expressJwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${process.env.CLIENT_DOMAIN}/.well-known/jwks.json`
    }),  
    audience: process.env.API_IDENTIFIER,
    issuer: `https://${process.env.CLIENT_DOMAIN}/`,
    algorithms: ['RS256']
  });

app.use(checkJwt);






app.use(bodyParser.json());            // enable the body-parser middleware

//Define the root endpoint
app.get(apiPrefix, async (req, res) => {
    const clientsState = await getClients();

    res.send(clientsState);
});

//Define the  endpoint for getting a particular client based on id - GET by id
app.get(`${apiPrefix}/clients/:clientId`, async (req, res) => {
    const clientState = await getClient(req.params.clientId);

    res.send(clientState);
});



//Define the  endpoint for updating a particular client based on id - update by id
app.put(`${apiPrefix}/clients/:clientId`, async (req, res) => {

    const updatedData = req.body;

    const clientState = await updateClient(req.params.clientId, updatedData);

    res.sendStatus(200);
});

app.listen(3001, () => {
    console.log('listening on port 3001');
});

//Use the Auth0 Management API wrapper and build the response with hypermedia 
async function getClients() {
    await Auth0Manager.init();

    const clients = await Auth0Manager.getClients();
    const clientList = clients.map(client => ({
        id: client.client_id,
        name: client.name,
        description: client.description || "",
        links: [{
            uri: `${apiPrefix}/clients/${client.client_id}`,
            rel: "client"
        }]
    }));

    return { resourceType: "client-list", clients: clientList };
}





async function getClient(clientId) {
    await Auth0Manager.init();

    const client = await Auth0Manager.getClient(clientId);

    return {
        resourceType: "client",
        id: client.client_id,
        name: client.name,
        description: client.description || "",
        links: [{
            uri: `${apiPrefix}/clients/${client.client_id}`,
            rel: "self"
        },
        {
            uri: `${apiPrefix}/clients/${client.client_id}`,
            rel: "self",
            type: "PUT"
        }]
    };
}


async function updateClient(clientId, updatedData) {
    await Auth0Manager.init();
    await Auth0Manager.updateClient(updatedData, clientId);
}