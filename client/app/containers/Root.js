/* global __ENVIRONMENT__ */

import React, { PropTypes, Component } from 'react';

class Root extends Component {

  renderConfig() {
    if (this.props.config) {
      const innerHtml = `window.__CONFIG__ = ${JSON.stringify(this.props.config)}`;
      return (<script dangerouslySetInnerHTML={{ __html: innerHtml }} />);
    }
  }

  renderEnvironment() {
    const innerHtml = `window.__ENVIRONMENT__ = '${__ENVIRONMENT__}'`;
    return (<script dangerouslySetInnerHTML={{ __html: innerHtml }} />);
  }

  renderInitialState() {
    if (this.props.initialState) {
      const innerHtml = `window.__INITIAL_STATE__ = ${JSON.stringify(this.props.initialState)}`;
      return (<script dangerouslySetInnerHTML={{ __html: innerHtml }} />);
    }
  }

  render() {
    const head = this.props.head;

    return (
      <html>
        <head>
          {head.title.toComponent()}
          {head.meta.toComponent()}
          {head.link.toComponent()}
        </head>
        <body>
          <div id="root" dangerouslySetInnerHTML={{ __html: this.props.content }} />
          {this.renderConfig()}
          {this.renderEnvironment()}
          {this.renderInitialState()}
          {head.script.toComponent()}
          <script src={!process.env.NODE_ENV ? '/app.js' : '/app.min.js'} />
        </body>
      </html>
    );
  }
}

Root.propTypes = {
  head: PropTypes.object.isRequired,
  content: PropTypes.string.isRequired,
  initialState: PropTypes.object.isRequired
};

export default Root;
