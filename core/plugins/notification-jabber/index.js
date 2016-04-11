import Jabber from './jabber';

export default function setup(options, imports) {

  const logger = imports.logger;
  options.info = function (message) {
    logger.info('Jabber: ' + message);
  };

  const jabber = new Jabber(options);
  // Ignore promise and don't wait until client goes online.
  jabber.connect();

  const service = function send(to, message) {
    return new Promise(resolve => {
      jabber.send(to, message);
      resolve();
    });
  };

  service.shutdown = function () {
    return new Promise(resolve => {
      service.close();
      resolve();
    });
  };

  return service;
}
