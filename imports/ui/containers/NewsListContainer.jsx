import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import ActionList from '../components/ActionList';
import { NewsItems } from '../../api/feeds';
import { Actions, joinAction } from '../../api/actions';

export default NewsListContainer = createContainer(({ limit, countCallback }) => {
  const handle = Meteor.subscribe('news', limit);

  const actions = NewsItems
    .find({ userId: Meteor.userId() }, {sort: {createdAt: -1}})
    .map(notifyItem => Actions.findOne(notifyItem.actionId))
    .filter(joinAction);

  countCallback && countCallback(actions.length);

  return {
    actions,
    actionsLoading: !handle.ready(),
  };
}, ActionList);
