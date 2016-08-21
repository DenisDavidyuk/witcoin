import React from 'react';
import { Link } from 'react-router';

import UserName from './UserName';

export default class UserMenu extends React.Component {
  logOut() {
    AccountsTemplates.logout();
    this.context.router.push('/');
  }

  renderLoggedIn() {
    const user = this.props.user;
    const userPagePath = '/u/' + user._id;
    const router = this.context.router;

    return <ul className="nav navbar-nav navbar-right">
      <li>
        <a className="dropdown-toggle" data-toggle="dropdown" href="#">
          <UserName user={user}/>&nbsp;
          <b className="caret"/>
        </a>
        <ul className="dropdown-menu">
          <li className={router.isActive(userPagePath) ? 'active' : ''}><Link to={userPagePath}>Моя страница</Link></li>
          <li className="divider"/>
          <li><a onClick={this.logOut.bind(this)} href="#">Выход</a></li>
        </ul>
      </li>
    </ul>;
  }

  renderLoggedOut() {
    return <ul className="nav navbar-nav navbar-right">
      <Link to="/accounts" className="btn btn-success navbar-btn">Войти</Link>
    </ul>;
  }

  render() {
    return this.props.user ? this.renderLoggedIn() : this.renderLoggedOut();
  }
}

UserMenu.propTypes = {
  user: React.PropTypes.object,
};

UserMenu.contextTypes = {
  router: React.PropTypes.object.isRequired,
};
