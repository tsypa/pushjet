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
          service = data;
          data.should.have.interface({
            created: Number,
            icon: String,
            name: String,
            public: String,
            secret: String, });
        });
    });
  });

  describe('#getServiceInfo()', function () {
    it('should have interface', function () {
      return pushjet.getServiceInfo(service.public)
        .then(function (data) {
          data.should.have.interface({
            created: Number,
            icon: String,
            name: String,
            public: String, });
        });
    });
  });

  describe('#updateServiceinfo()', function () {
    it('should return ok', function () {
      return pushjet.updateServiceInfo(service.secret, 'my new name')
        .should.eventually.equal('ok');
    });
  });

  describe('#subscribeToService()', function () {
    it('should have interface', function () {
      return pushjet.subscribeToService(device, service.public)
        .then(function (data) {
          data.should.have.interface({
              created: Number,
              icon: String,
              name: String,
              public: String,
            });
        });
    });
  });

  describe('#getSubscriptions()', function () {
    it('should be array', function () {
      return pushjet.getSubscriptions(device)
        .should.eventually.be.a('array');
    });
  });

  describe('#sendMessage()', function () {
    it('should be ok', function () {
      return pushjet.sendMessage(service.secret, 'message', 'title', 3, 'http://kernel.org')
        .should.eventually.equal('ok');
    });
  });

  describe('#fetchUnreadMessages()', function () {
    it('should return non-empty array', function () {
      return pushjet.fetchUnreadMessages(device)
        .should.eventually.be.a('array')
        .and.not.to.be.empty;
    });
  });

  describe('#markMessagesAsRead()', function () {
    it('should be ok', function () {
      return pushjet.markMessagesAsRead(device)
        .should.eventually.equal('ok');
    });
  });

  describe('#fetchUnreadMessages()', function () {
    it('should return empty array of messages', function () {
      return pushjet.fetchUnreadMessages(device)
        .should.eventually.be.a('array')
        .and.to.be.empty;
    });
  });

  describe('#unsubscribe()', function () {
    it('should be ok', function () {
      return pushjet.unsubscribe(device, service.public)
        .should.eventually.equal('ok');
    });
  });

  describe('#deleteService()', function () {
    it('should return status ok', function () {
      return pushjet.deleteService(service.secret)
        .should.eventually.equal('ok');
    });
  });
});
