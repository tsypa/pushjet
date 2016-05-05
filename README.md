# PushJet API
[![npm version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Downloads][downloads-image]][downloads-url]

A Node.js module for using [PushJet API](//docs.pushjet.io).

## Installation
```sh
npm i pushjet
```
## Usage
All methods described in [PushJet documentation](docs.pusjhet.io) are supported.<br/>
Each method returns Promise which fulfilled with appropriate json object or rejected with an error.

## API
### sendMessage(secret, message, title, level, link)
Send a message
#### Parameters
| name    | type    | meaning                                     | example                          | required |
|---------|---------|---------------------------------------------|----------------------------------|----------|
| secret  | string  | the service secret token                    | d2d1820d56b862a6f5b1a69a7af730fa |   **X**  |
| message | string  | The notification text                       | our server is on fire!!@#!       |   **X**  |
| title   | string  | A custom message title                      | Big server #5                    |          |
| level   | integer | The importance level from 1(low) to 5(high) | 3                                |          |
| link    | string  | http://i.imgur.com/TerUkQY.gif              | An optional link                 |          |
### fetchUnreadMessages(uuid)
Fetch unread messages
#### Parameters
| name  | type   | meaning         | example                              | required |
|-------|--------|-----------------|--------------------------------------|----------|
| uuid  | string | The device UUID | D867AB3E-36D2-11E4-AEA8-76C9E2E253B6 |   **X**  |
### markMessagesAsRead(uuid)
Mark messages as read
#### Parameters
| name  | type   | meaning         | example                              | required |
|-------|--------|-----------------|--------------------------------------|----------|
| uuid  | string | The device UUID | D867AB3E-36D2-11E4-AEA8-76C9E2E253B6 |   **X**  |
### createService(name, icon)
Create service
#### Parameters
| name  | type   | meaning          | example                     | required |
|-------|--------|------------------|-----------------------------|----------|
| name  | string | The service name | important stuff             |   **X**  |
| icon  | string | The service icon | http://im.gy/images/SkZ.png |          |

### getServiceInfo(service, secret)
Get service info
#### Parameters
| name    | type   | meaning                                    | example                                  | required |
|---------|--------|--------------------------------------------|------------------------------------------|----------|
| service | string | Obtain service info using the public token | 4be3-eda97a-0d7faeab05a0-89403-ad4751c49 |          |
| secret  | string | Obtain service info using the secret       | d2d1820d56b862a6f5b1a69a7af730fa         |          |

### updateServiceInfo(secret, name, icon)
Update service info
#### Parameters
| name   | type   | meaning               | example                                | required |
|--------|--------|-----------------------|----------------------------------------|----------|
| secret | string | The service secret    | stringd2d1820d56b862a6f5b1a69a7af730fa |   **X**  |
| name   | string | Updated service name  | Cool new name                          |          |
| icon   | string | Updated service image | http://im.gy/images/SkZ.png            |          |
### deleteService(secret)
This will unsubscribe all listeners
#### Parameters
| name   | type   | meaning            | example                          | required |
|--------|--------|--------------------|----------------------------------|----------|
| secret | string | The service secret | d2d1820d56b862a6f5b1a69a7af730fa |   **X**  |
### subscribeToService(uuid, service)
Subscribe to a service
#### Parameters
| name    | type   | meaning                    | example                                  | required |
|---------|--------|----------------------------|------------------------------------------|----------|
| uuid    | string | The device UUID            | D867AB3E-36D2-11E4-AEA8-76C9E2E253B6     |   **X**  |
| service | string | The service's public token | 4be3-eda97a-0d7faeab05a0-89403-ad4751c49 |   **X**  |
### getSubscriptions(uuid)
Get subscriptions
#### Parameters
| name | type   | meaning         | example                              | required |
|------|--------|-----------------|--------------------------------------|----------|
| uuid | string | The device UUID | D867AB3E-36D2-11E4-AEA8-76C9E2E253B6 |   **X**  |
### unsubscribe(uuid, servie)
Unsubscribe
#### Parameters
| name    | type   | meaning                    | example                                  | required |
|---------|--------|----------------------------|------------------------------------------|----------|
| uuid    | string | The device UUID            | D867AB3E-36D2-11E4-AEA8-76C9E2E253B6     |   **X**  |
| service | string | The service's public token | 4be3-eda97a-0d7faeab05a0-89403-ad4751c49 |   **X**  |
### registerDeviceForGCM(uuid, regid, pubkey)
Registering a device for GCM<br/>
*Only enabled when Google Cloud Messaging is enabled on the server*
#### Parameters
| name   | type   | meaning                                    | example                                 | required |
|--------|--------|--------------------------------------------|-----------------------------------------|----------|
| uuid   | string | The device UUID                            | D867AB3E-36D2-11E4-AEA8-76C9E2E253B6    |   **X**  |
| regid  | string | The registration ID generated by GCM       | EXAMPLExV2lcV2zEKTLNYs625zfk2jh4EXAMPLE |   **X**  |
| pubkey | string | Optional public key for message encryption |                                         |          |
### removingGCMRegistration(uuid)
Removing a GCM registration
#### Parameters
| name | type   | meaning         | example                              | required |
|------|--------|-----------------|--------------------------------------|----------|
| uuid | string | The device UUID | D867AB3E-36D2-11E4-AEA8-76C9E2E253B6 |   **X**  |
## A quick and dirty example.
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

## Third-party libraries
- [lodash](github.com/lodsah/lodash)
- [request](github.com/request/request)

[travis-image]: https://img.shields.io/travis/tsypa/pushjet.svg?style=flat-square
[travis-url]: https://travis-ci.org/tsypa/pushjet
[coveralls-image]: https://img.shields.io/coveralls/tsypa/pushjet.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/tsypa/pushjet
[npm-image]: https://img.shields.io/npm/v/pushjet.svg?style=flat-square
[npm-url]: https://npmjs.org/package/pushjet
[downloads-image]: http://img.shields.io/npm/dm/pushjet.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/pushjet
