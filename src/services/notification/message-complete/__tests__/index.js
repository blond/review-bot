import service from '../';

import eventsMock from '../../../events/__mocks__/';
import loggerMock from '../../../logger/__mocks__/';
import notificationMock from '../../__mocks__/';
import { pullRequestMock } from '../../..//model/model-pull-request/__mocks__/';

describe('services/notification/message-complete', function () {

  let events, logger, notification, payload, pullRequest;
  let options, imports;

  beforeEach(function () {

    events = eventsMock();
    logger = loggerMock();

    notification = notificationMock();

    pullRequest = pullRequestMock();

    payload = { pullRequest };

    events.on.callsArgWith(1, payload);

    options = {};

    imports = { events, logger, notification };

  });

  it('should subscribe to event `review:complete', function () {
    service(options, imports);

    assert.calledWith(events.on, 'review:complete');
  });

  it('should send complete message to the author', function () {
    pullRequest.user = { login: 'Black Widow' };

    service(options, imports);

    assert.calledWith(notification.sendMessage, pullRequest, 'Black Widow');
  });

});
