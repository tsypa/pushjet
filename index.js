'use strict';

const _ = require('lodash');

_.mixin({
  denote: (object) => {
    const value = _.get(object, _.head(_.keys(object)));
    return _.isObjectLike(value) ? value : object;
  },
});

const internal = new WeakMap();

const $$ = (object) => {
  if (!internal.has(object)) {
    internal.set(object, {});
  }
  return internal.get(object);
};

const wrap = (pushjet, path, request) => {
  $$(pushjet)[path] = request.defaults({ url: `/${path}` });
};

const $ = (pushjet, path, method, args) => new Promise((resolve, reject) => {
  _.invoke($$(pushjet), `${path}.${method}`, {
    [method === 'get' ? 'qs' : 'form']: _.omitBy(args, _.isNil),
  }, (error, response, body) => {
    const e = error || body.error;

    !e ? resolve(_.denote(body)) : reject(e);
  });
});

// @class  PushJet
class PushJet {
  constructor(baseUrl) {
    // create private wrappers
    const request = require('request').defaults({ baseUrl, json: true });

    _.each(['message', 'service', 'subscription', 'gcm'], (path) => {
      wrap(this, path, request);
    });
  };

  sendMessage(secret, message, title, level, link) {
    return $(this, 'message', 'post', { secret, message, title, level, link });
  }

  fetchUnreadMessages(uuid) {
    return $(this, 'message', 'get', { uuid });
  }

  markMessagesAsRead(uuid) {
    return $(this, 'message', 'delete', { uuid });
  }

  createService(name, icon) {
    return $(this, 'service', 'post', { name, icon });
  }

  getServiceInfo(service, secret) {
    return $(this, 'service', 'get', { service, secret });
  }

  updateServiceInfo(secret, name, icon) {
    return $(this, 'service', 'patch', { secret, name, icon });
  }

  deleteService(secret) {
    return $(this, 'service', 'delete', { secret });
  }

  subscribeToService(uuid, service) {
    return $(this, 'subscription', 'post', { uuid, service });
  }

  getSubscriptions(uuid) {
    return $(this, 'subscription', 'get', { uuid });
  }

  unsubscribe(uuid, service) {
    return $(this, 'subscription', 'delete', { uuid, service });
  }

  registerDeviceForGCM(uuid, regid, pubkey) {
    return $(this, 'gcm', 'post', {  uuid, regid, pubkey });
  }

  removingGCMRegistration(uuid) {
    return $(this, 'gcm', 'delete', { uuid });
  }
}

module.exports = PushJet;
