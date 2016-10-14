import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { check } from 'meteor/check';
import faker from 'faker';

import { Actions, actionChildrenCursors } from './actions';

const feedItemSchema = {
  _id: { type: String, regEx: SimpleSchema.RegEx.Id, denyUpdate: true },
  userId: { type: String, regEx: SimpleSchema.RegEx.Id, denyUpdate: true },
  actionId: { type: String, regEx: SimpleSchema.RegEx.Id, denyUpdate: true },
  createdAt: { type: Date, denyUpdate: true },
};

export const NewsItems = new Mongo.Collection('news');

NewsItems.schema = new SimpleSchema({
  ...feedItemSchema,
  authorId: { type: String, regEx: SimpleSchema.RegEx.Id, denyUpdate: true },
});

NewsItems.attachSchema(NewsItems.schema);

export const NotifyItems = new Mongo.Collection('notices');

NotifyItems.schema = new SimpleSchema({
  ...feedItemSchema,
  isRead: { type: Boolean, defaultValue: false },
});

NotifyItems.attachSchema(NotifyItems.schema);

if (Meteor.isServer) {
  Meteor.publishComposite('news', function(limit) {
    check(limit, Number);

    if (!this.userId)
      return this.ready();

    return {
      find: () => NewsItems.find({ userId: this.userId }, { sort: { createdAt: -1 }, limit: limit }),
      children: [{
        find: newsItem => Actions.find(newsItem.actionId),
        children: actionChildrenCursors,
      }],
    };
  });

  Meteor.publishComposite('notifications', function(limit) {
      check(limit, Number);

      if (!this.userId)
        return this.ready();

      return {
        find: () => NotifyItems.find({ userId: this.userId }, { sort: { createdAt: -1 }, limit: limit }),
        children: [{
          find: notifyItem => Actions.find(notifyItem.actionId),
          children: actionChildrenCursors,
        }],
      };
    }
  );
}

Meteor.methods({
  'notification.remove' (actionId) {
    check(actionId, String);

    if (!this.userId)
      throw new Meteor.Error('not-authorized');
    const notification = NotifyItems.findOne({ userId: this.userId, actionId });
    if (!notification)
      throw new Meteor.Error('notification-not-found');

    NotifyItems.remove({ userId: this.userId, actionId });
  },
});

Factory.define('notification', NotifyItems, {
  userId: Factory.get('user'),
  actionId: () => Factory.get('action.default'), // TODO: remove circular dependency
  createdAt: () => faker.date.past(),
});
