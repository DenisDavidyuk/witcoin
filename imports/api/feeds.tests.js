import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { expect } from 'meteor/practicalmeteor:chai';

import { FeedItems } from './feeds';
import { Actions } from './actions';
import './users';

if (Meteor.isServer) {
  describe('feeds', () => {
    const subscribeAction = Meteor.server.method_handlers['action.subscribe'];
    const createAction = Meteor.server.method_handlers['action.create'];
    const removeAction = Meteor.server.method_handlers['action.remove'];

    it('news', () => {
      const userId = Factory.create('user')._id;
      const newsSourceId = Factory.create('user')._id;
      const assertNewsCount = (c) =>
        expect(FeedItems.find({userId, isNotification: false}).count()).to.equal(c);

      const actionId = createAction.call({ userId: newsSourceId }, 'test action');
      assertNewsCount(0);
      subscribeAction.call({ userId }, newsSourceId);
      assertNewsCount(1);

      const newsItem = FeedItems.findOne({userId, isNotification: false});
      expect(newsItem.actionId).to.equal(actionId);
      const action = Actions.findOne(actionId);
      expect(newsItem.createdAt).to.eql(action.createdAt);

      subscribeAction.call({ userId }, newsSourceId);
      assertNewsCount(0);
      subscribeAction.call({ userId }, newsSourceId);
      assertNewsCount(1);

      removeAction.call({ userId: newsSourceId }, actionId);
      assertNewsCount(0);
    });

    it('show/hide notification on subscribe', () => {
      const subscriberId = Factory.create('user')._id;
      const userId = Factory.create('user')._id;
      const assertNotificationCount = (c) =>
        expect(FeedItems.find({userId, isNotification: true}).count()).to.equal(c);

      assertNotificationCount(0);
      subscribeAction.call({ userId: subscriberId }, userId);
      assertNotificationCount(1);
      subscribeAction.call({ userId: subscriberId }, userId);
      assertNotificationCount(0);
    });

    describe('factory', () => {
      it('notification', () => {
        const notification = Factory.create('notification');
        expect(FeedItems.findOne({_id: notification._id, isNotification: true})).is.an('object');
      });
    });

    describe('methods', () => {
      describe('notification.remove', () => {
        const removeNotification = Meteor.server.method_handlers['notification.remove'];

        it('fail when current user not logged in', () => {
          assert.throws(() => removeNotification.call({}, Factory.create('notification').actionId)
            , Meteor.Error, 'not-authorized');
        });

        it('fail when remove uncreated notification', () => {
          const userId = Factory.create('user')._id;
          assert.throws(() => removeNotification.call({ userId }, Random.id())
            , Meteor.Error, 'notification-not-found');
        });

        it('fail when remove notification of another user', () => {
          const actionId = Factory.create('notification').actionId;
          const userId = Factory.create('user')._id;
          assert.throws(() => removeNotification.call({ userId }, actionId)
            , Meteor.Error, 'notification-not-found');
        });

        it('remove', () => {
          const notification = Factory.create('notification');
          const userId = notification.userId;
          expect(FeedItems.find({userId, isNotification: true}).count()).to.equal(1);
          removeNotification.call({ userId }, notification.actionId);
          expect(FeedItems.find({userId, isNotification: true}).count()).to.equal(0);
        });
      });
    });

    const commentAction = Meteor.server.method_handlers['action.comment'];
    const rateAction = Meteor.server.method_handlers['action.rate'];
    const shareAction = Meteor.server.method_handlers['action.share'];

    it('show/hide notification on share, comment, rate', () => {
      const actionUserId = Factory.create('user')._id;
      const userId = Factory.create('user')._id;
      const assertNotifyCount = c =>
        expect(FeedItems.find({userId: actionUserId, isNotification: true}).count()).to.equal(c);
      [
        (userId, actionId) => commentAction.call({ userId }, actionId, 'test'),
        (userId, actionId) => rateAction.call({ userId }, actionId, 1),
        (userId, actionId) => shareAction.call({ userId }, actionId),
      ].forEach(f => {
        const actionId = createAction.call({userId: actionUserId}, 'test');
        assertNotifyCount(0);
        const childActionId = f(userId, actionId);
        assertNotifyCount(1);
        removeAction.call({ userId }, childActionId);
        assertNotifyCount(0);
        f(userId, actionId);
        assertNotifyCount(1);
        removeAction.call({userId: actionUserId}, actionId);
        assertNotifyCount(0);
      });
    });
  });
}
