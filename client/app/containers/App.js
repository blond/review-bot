import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';
import Helmet from 'react-helmet';

class App extends Component {

  render() {
    return (
      <div>
        <Helmet
          title="DevExp"
          titleTemplate="DevExp - %s"
          meta={[
            { charset: 'utf-8' }
          ]}
        />
        <nav>
          <ul>
            <li><Link to="/users">Users</Link></li>
            <li><Link to="/teams">Teams</Link></li>
          </ul>
        </nav>
        {this.props.children}
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.node
};

export default App;
