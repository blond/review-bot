import React from 'react';
import { Route, IndexRedirect } from 'react-router';
import App from './containers/App/';
import Home from './containers/Home/';
import UserCard from './containers/UserCard/';
import UserList from './containers/UserList/';
import NotFound from './containers/NotFound/';

export default (
  <Route component={App}>
    <Route path="/" component={Home}>
      <IndexRedirect to="users" />
      <Route path="users" component={UserList} />
    </Route>
    <Route path="user/:id" component={UserCard} />
    <Route path="*" component={NotFound} />
  </Route>
);
