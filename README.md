# PushJet API
A Node.js module for using [PushJet API](//docs.pushjet.io).

## Installation
```sh
npm i pushjet
```

## Usage
### A quick and dirty example.
We  share service's public token between pusher and receiver.

```javascript
'use strict';

const PushJet = require('pushjet');
const pusher = new PushJet('https://api.pushjet.io/');
const name = 'pizza';
const icon = 'https://ipfs.pics/ipfs/QmVBjUHLS4jewV1VVwDRBfB2DBjqYA993jjUBVez2God21';

// subscribe to a service and receive messages
const subscribe = (pusher, service) => {
  const uuid = require('node-uuid');
  const device = uuid.v4();

  pusher.subscribeToService(device, service).then((subsciption) => {
    console.log('device', device, 'subscribed');

    const  WebSocket = require('ws');
    const ws = new WebSocket('wss://api.pushjet.io/ws');

    ws.on('open', () => {
      console.log('connector connected');
      ws.send(device, (error) => {
        console.log('sending', device, error ? error : 'ok');
      });
    });

    ws.on('message', (data, flags) => {
      console.log(data);
      if (JSON.parse(data).subscription) {
        console.log('connection closed');
        ws.close();
      }
    });
  }).catch((error) => {
    console.log('cannot subscribe', error);
  });
};

// create service, tell about eating pizzas, and then delete service
pusher.createService(name, icon).then((service) => {
  const pizzas = 4;
  let n = 0;

  const push = () => {
    pusher.sendMessage(service.secret, `eat pizza #${++n}`, 'yum-yum')
      .then((status) => {
        console.log('message', n, 'sent', status);
        if (n < pizzas) {
          // schedule next message
          setTimeout(push, 1000);
          return;
        }

        // there are no more pizzas
        pusher.deleteService(service.secret).then((status) => {
          console.log('service deleted');
        }).catch((error) => {
          console.log('cannot delete service', error);
        });
      }).catch((error) => {
        console.log('error', error);
      });
  };

  // subscribe to a service
  subscribe(pusher, service.public);

  // start sending
  push();
}).catch((error) => {
  console.log('error', error);
});

```
