import React from 'react';

import UserList from '../components/UserList';

export default class HomePage extends React.Component {
  render() {
    return (
      <div className="row">
        <div className="col-sm-8">
          <div className="panel panel-default">
            <div className="panel-heading">Информация о системе</div>
            <table className="table">
              <tbody>
              <tr><td>Зарегистрировано пользователей</td><td>
                {this.props.usersCount}
              </td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-sm-4">
          <UserList users={this.props.lastUsers} title="Недавно зарегистрировавшиеся"/>
        </div>
      </div>
    );
  }
}

HomePage.propTypes = {
  lastUsers: React.PropTypes.array,
  usersCount: React.PropTypes.number,
};