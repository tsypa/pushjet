'use strict';

const _ = require('lodash');

const wrap = (path, request) => {
  this[path] = request.defaults({ url: `/${path}` });
};

const $ = (path, method, args) => new Promise((resolve, reject) => {
  _.invoke(this, `${path}.${method}`, {
    [method === 'get' ? 'qs' : 'form']: _.omitBy(args, _.isNil),
  }, (error, response, body) => {
    const e = error || body.error;
    e ? reject(e) : resolve(body[_.head(_.keys(body))]);
  });
});

class PushJet {
  constructor(baseUrl) {
    // create private wrappers
    const request = require('request').defaults({ baseUrl, json: true });

    _.each(['message', 'service', 'subscription', 'gcm'], (path) => {
      wrap(path, request);
    });

  };

  sendMessage(secret, message, title, level, link) {
    return $('message', 'post', { secret, message, title, level, link });
  }

  fetchUnreadMessages(uuid) {
    return $('message', 'get', { uuid });
  }

  markMessagesAsRead(uuid) {
    return $('message', 'delete', { uuid });
  }

  createService(name, icon) {
    return $('service', 'post', { name, icon });
  }

  getServiceInfo(service, secret) {
    return $('service', 'get', { service, secret });
  }

  updateServiceInfo(secret, name, icon) {
    return $('service', 'patch', { secret, name, icon });
  }

  deleteService(secret) {
    return $('service', 'delete', { secret });
  }

  subscribeToService(uuid, service) {
    return $('subscription', 'post', { uuid, service });
  }

  getSubscriptions(uuid) {
    return $('subscription', 'get', { uuid });
  }

  unsubscribe(uuid, service) {
    return $('subscription', 'delete', { uuid, service });
  }

  registerDeviceForGCM(uuid, regid, pubkey) {
    return $('gcm', 'post', {  uuid, regid, pubkey });
  }

  removingGCMRegistration(uuid) {
    return $('gcm', 'delete', { uuid });
  }
}

module.exports = PushJet;
