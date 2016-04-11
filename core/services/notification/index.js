/**
 * Notification service
 *
 * @param {Object} options
 * @param {Object} imports
 *
 * @return {Function}
 */
export default function setup(options, imports) {
  const model = imports.model;
  const userModel = model.get('user');

  function getServiceName(transport) {
    return 'notification-service-' + transport.id;
  }

  return function send(to, message) {
    const userTransports = userModel
      .findByLogin(to)
      .getNotificationTransport();

    for (let i = 0; i < userTransports.length; i++) {
      const transport = userTransports[i];
      const serviceName = getServiceName(transport);

      if (serviceName in imports) {
        const sendService = imports[serviceName];
        sendService(transport.username, message);
        break;
      }
    }
  };

}
