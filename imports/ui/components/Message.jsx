import React from 'react';

import LinkToUser from './LinkToUser';
import Date from './Date';

const Message  = ({ message, isMail }) =>
  <div className="media" key={message._id} style={{flexShrink: 0, margin: '5px 0'}}>
    <div className="media-body">
      <div className="pull-right text-muted">
        <Date value={message.createdAt} />
      </div>
      <LinkToUser user={message.user} />
      <br />
      {message.content}
      {!isMail && message.userId == Meteor.userId()? (
        <div className="pull-right text-muted">
          <span title={'Сообщение ' + (message.isRead ? '' : 'не ') + 'доставлено'}
                className={'glyphicon glyphicon-' + (message.isRead ? 'ok' : 'time')} />
        </div>
      ) : null}
    </div>
  </div>;


Message.propTypes = {
  message: React.PropTypes.object.isRequired,
  isMail: React.PropTypes.bool,
};

export default Message;
