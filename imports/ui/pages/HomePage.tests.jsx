import React from 'react';
import { expect } from 'meteor/practicalmeteor:chai';

import { mountWithIntl } from '../../helpers/intl-enzyme-test-helper';
import HomePage from './HomePage';

if (Meteor.isClient) {
  describe('HomePage', () => {
    const tests = [
      ['one user',   21, 'пользователь'],
      ['few users',   22, 'пользователя'],
      ['many users',  25, 'пользователей'],
      ['other users', 0, 'пользователей'],
    ];

    tests.forEach(test =>
      it(`pluralize label for ${test[0]}`, () => {
        const item = mountWithIntl(<HomePage lastUsers={[]} usersCount={test[1]} />).render();
        expect(item.text()).match(new RegExp(test[1] + '\\s' + test[2]));
      })
    );
  });
}
