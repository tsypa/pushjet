'use strict';

const chai = require('chai');

chai.use(require('chai-as-promised'));
chai.use(require('chai-interface'));
chai.should();

describe('PushJet', function () {
  const PushJet = require('../index.js');
  const pushjet = new PushJet('http://api.pushjet.io/');
  const uuid = require('node-uuid');
  const device = uuid.v4();
  let service;

  describe('#createService()', function () {
    it('should have interface', function () {
      return pushjet.createService('mytest')
        .then(function (data) {
          service = data.service;
          data.should.have.interface({
            service: {
              created: Number,
              icon: String,
              name: String,
              public: String,
              secret: String, },
          });
        });
    });
  });

  describe('#getServiceInfo()', function () {
    it('should have interface', function () {
      return pushjet.getServiceInfo(service.public)
        .then(function (data) {
          data.should.have.interface({
            service: {
              created: Number,
              icon: String,
              name: String,
              public: String, },
          });
        });
    });
  });

  describe('#updateServiceinfo()', function () {
    it('should return status ok', function () {
      return chai.expect(pushjet.updateServiceInfo(service.secret, 'my new name'))
        .to.eventually.become({ status: 'ok' });
    });
  });

  describe('#subscribeToService()', function () {
    it('should have interface', function () {
      return pushjet.subscribeToService(device, service.public)
        .then(function (data) {
          data.should.have.interface({
            service: {
              created: Number,
              icon: String,
              name: String,
              public: String,
            },
          });
        });
    });
  });

  describe('#getSubscriptions()', function () {
    it('should have subscriptions array', function () {
      return chai.expect(pushjet.getSubscriptions(device))
        .to.eventually.have.property('subscriptions')
        .and.to.be.a('array');
    });
  });

  describe('#sendMessage()', function () {
    it('should return status ok', function () {
      return chai.expect(pushjet.sendMessage(service.secret, 'm', 't', 3, 'http://kernel.org'))
        .to.eventually.become({ status: 'ok' });
    });
  });

  describe('#fetchUnreadMessages()', function () {
    it('should return non-empty array of messages', function () {
      return chai.expect(pushjet.fetchUnreadMessages(device)).
        to.eventually.have.property('messages')
        .and.to.be.a('array')
        .and.not.to.be.empty;
    });
  });

  describe('#markMessagesAsRead()', function () {
    it('should return status ok', function () {
      return chai.expect(pushjet.markMessagesAsRead(device))
        .to.eventually.become({ status: 'ok' });
    });
  });

  describe('#fetchUnreadMessages()', function () {
    it('should return empty array of messages', function () {
      return chai.expect(pushjet.fetchUnreadMessages(device))
        .to.eventually.have.property('messages')
        .and.to.be.a('array')
        .and.to.be.empty;
    });
  });

  describe('#unsubscribe()', function () {
    it('should return status ok', function () {
      return chai.expect(pushjet.unsubscribe(device, service.public))
        .to.eventually.become({ status: 'ok' });
    });
  });

  describe('#deleteService()', function () {
    it('should return status ok', function () {
      return chai.expect(pushjet.deleteService(service.secret))
        .to.eventually.become({ status: 'ok' });
    });
  });
});
