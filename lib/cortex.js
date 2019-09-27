console.log('loaded')
const WebScoket = require('ws');
const fs = require('fs');
const client = require('socket.io-client');

//socket to the server 
let clientTest = null;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

//socket to the api
const socketUrl = 'wss://localhost:6868';
const socket = new WebScoket(socketUrl);
const streams = ['com'];

const user = {
  clientId: 'NJQgt9fiWoFfaIVth8ErVuxIsMNqFLmwmKdz5rMv',
  clientSecret: 'v2FbJLhB7o5vNE8RHmp16POBwuX0SCxk4NVh3j21RW8iSQoAIcDaJzbGP3e0J2q881SKJLO0f6kbZ1Ca8ZdnUwcEKIMdV0D4CfksPdRFEBY7rZ9Hdlr4dF3chanNrrj2'
};

let connection=false;

let openServerSockler=function (){

    clientTest=client('http://localhost:6005');

    connection=true;

}



class Cortex {
  constructor(user) {
    this.user = user;
  }

  queryHeadset() {
    const QUERYHEADSETID = 1;
    const queryHeadsetRequest = {
      jsonrpc: '2.0',
      id: QUERYHEADSETID,
      method: 'queryHeadsets',
      params: {},
    };
    return new Promise(((resolve, reject) => {
      socket.send(JSON.stringify(queryHeadsetRequest));
      socket.on('message', (data) => {
        try {
          if (JSON.parse(data).id === QUERYHEADSETID) {
            if (JSON.parse(data).result.length > 0) {
              const headsetID = JSON.parse(data).result[0].id;
              resolve(headsetID);
            } else console.log('No Headset Found Please Check Again');
          }
        } catch (error) {
          console.error(error);
        }
      });
    }));
  }

  requestAccess() {
    const REQUESTACCESSID = 2;
    const { user } = this;
    const requestAccessRequest = {
      id: REQUESTACCESSID,
      jsonrpc: '2.0',
      method: 'requestAccess',
      params: {
        clientId: user.clientId,
        clientSecret: user.clientSecret,
      },
    };
    return new Promise(((resolve, reject) => {
      socket.send(JSON.stringify(requestAccessRequest));
      socket.on('message', (data) => {
        try {
          if (JSON.parse(data).id) {
            resolve(data);
          }
        } catch (error) {
          console.error(error);
        }
      });
    }));
  }

  authorise() {
    const { user } = this;
    const AUTHORISEID = 3;
    const authoriseRequest = {
      id: AUTHORISEID,
      jsonrpc: '2.0',
      method: 'authorize',
      params: {
        clientId: user.clientId,
        clientSecret: user.clientSecret,
      },
    };
    return new Promise(((resolve, reject) => {
      socket.send(JSON.stringify(authoriseRequest));
      socket.on('message', (data) => {
        try {
          if (JSON.parse(data).id === AUTHORISEID) {
            const { cortexToken } = JSON.parse(data).result;
            resolve(cortexToken);
          }
        } catch (error) {
          console.error(error);
        }
      });
    }));
  }


  createSession (authToken, headsetID) {
    const CREATESESSIONID = 4;
    const createSessionRequest = {
      jsonrpc: '2.0',
      id: CREATESESSIONID,
      method: 'createSession',
      params: {
        cortexToken: authToken,
        headset: headsetID,
        status: 'open',
      },
    };
    return new Promise(((resolve, reject) => {
      socket.send(JSON.stringify(createSessionRequest));
      socket.on('message', (data) => {
        try {
          if (JSON.parse(data).id === CREATESESSIONID) {
            const sessionID = JSON.parse(data).result.id;
            resolve(sessionID);
          }
        } catch (error) {
          console.error(error);
        }
      });
    }));
  }

  subscribeRequest (streams, authToken, sessionID){
    const SUBSCRIPTIONID = 5;
    const subscribeRequestReq = {
      id: SUBSCRIPTIONID,
      jsonrpc: '2.0',
      method: 'subscribe',
      params: {
        cortexToken: authToken,
        session: sessionID,
        streams,
      },
    };
    socket.send(JSON.stringify(subscribeRequestReq));
    socket.on('message', (data => {
      try {
        //console.log(data);
      } catch (error) {
        //console.log(error);
      }
    }));
  }

  unSubscribeRequest(streams, authToken, sessionID){
    const UNSUBSCRIPTIONID = 6;
    const unSubscribeRequestReq = {
      id: UNSUBSCRIPTIONID,
      jsonrpc: '2.0',
      method: 'unsubscribe',
      params: {
        cortexToken: authToken,
        session: sessionID,
        streams,
      },
    };
    socket.send(JSON.stringify(subscribeRequestReq));
    socket.on('message', (data => {
      try {
        console.log(data);
        resolve(data);
      } catch (error) {
        console.log(error);
      }
    }));
  }
  async querySessionInfo() {
    let headsetID = '';
    await this.queryHeadset().then((headset) => {
      headsetID = headset;
    });
    this.headsetID = headsetID;

    let authToken = '';
    await this.authorise().then((auth) => {
      authToken = auth;
    });
    this.authToken = authToken;

    let sessionID = '';
    await this.createSession(authToken, headsetID).then((result) => {
      sessionID = result;
    });
    this.sessionID = sessionID;

    console.log('Headset ID ------------------------\n');
    console.log(this.headsetID);
    console.log('\n');
    console.log('Auth Token ------------------------\n');
    console.log(this.authToken);
    console.log('\n');
    console.log('Session ID ------------------------\n');
    console.log(this.sessionID);
    console.log('\n');
  }

  async checkAndQuery() {
    let requestAccessResult = '';
    await this.requestAccess().then((result) => {
      requestAccessResult = result;
    });
    const accessGranted = JSON.parse(requestAccessResult);
    if ('error' in accessGranted) {
      console.log('Login on Emotiv App before you request for permission and rerun the script');
      throw new Error('Login Error: Login inside the EMOTIV APP');
    } else {
      console.log(accessGranted.result.message);
      if (accessGranted.result.accessGranted) {
        await this.querySessionInfo();
      } else {
        console.log('You must accept access request inside the Emotiv App');
        throw new Error('Permission Error: You must accept access request inside the Emotiv App');
      }
    }
  }

  subscribeStreams(streams) {
    socket.on('open', async () => {
      await this.checkAndQuery();
      this.subscribeRequest(streams, this.authToken, this.sessionID);
      let result = new Array();
      socket.on('message', async (data) => {
        //console.log(data.com[0]);
        result.push(data);
        fs.writeFile('./lib/info.json', JSON.stringify(result, null ,2), (error) => {
          if (error) console.error(error);
        });
      });
    });
  }

  async usnsubscribe(streams) {
    let unsubscribeResult = '';
    await this.unSubscribeRequest(streams, this.authToken, this.sessionID).then((result) => {
     unsubscribeResult = result;
    })
  }
}

module.exports = {
 getCommands: function(){
  const cortexUser = new Cortex(user);
  cortexUser.subscribeStreams(streams);
 }
};
//const cortexUser = new Cortex(user);
//cortexUser.subscribeStreams(streams);