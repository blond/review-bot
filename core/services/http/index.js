import _ from 'lodash';
import express from 'express';

import bodyParser from 'body-parser';
import responseTime from 'response-time';
import responseJSON from './response';

export default function setup(options, imports, provide) {

  const app = express();
  const port = options.port;
  const logger = imports.logger;

  app.use(responseTime());
  app.use(bodyParser.json());
  app.use(responseJSON());

  _.forEach(options.routes || {}, (router, route) => {
    const routerModule = imports[router];

    app.use(route, routerModule);
  });

  const server = app.listen(port, () => {
    logger.info(
      'Server listening at %s:%s',
      server.address().address,
      server.address().port
    );

    server.shutdown = (callback) => server.close(callback);

    provide(server);
  });

}
