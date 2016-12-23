import service from '../';
import eventsMock from '../../../events/__mocks__/';
import loggerMock from '../../../logger/__mocks__/';
import { pullRequestMock } from '../../..//model/model-pull-request/__mocks__/';

describe('services/notification/message-ping', function () {

  let events, logger, notification, payload, pullRequest;
  let options, imports;

  beforeEach(function () {

    events = eventsMock();
    logger = loggerMock();

    notification = sinon.stub().returns(Promise.resolve());

    pullRequest = pullRequestMock();

    payload = { pullRequest };

    events.on.callsArgWith(1, payload);

    options = {};

    imports = { events, logger, notification };

  });

  it('should subscribe to event `review:command:ping`', function () {
    service(options, imports);

    assert.calledWith(events.on, 'review:command:ping');
  });

  it('should send ping message to the reviewers', function () {
    pullRequest.review = {
      reviewers: [{ login: 'Black Widow' }, { login: 'Spider-Man' }]
    };

    service(options, imports);

    assert.calledWith(notification, pullRequest, 'Black Widow');
    assert.calledWith(notification, pullRequest, 'Spider-Man');
  });

  it('should not send ping message to approved reviewers', function () {
    pullRequest.review = {
      reviewers: [
        { login: 'Black Widow' },
        { login: 'Spider-Man', approved: true }
      ]
    };

    service(options, imports);

    assert.calledWith(notification, pullRequest, 'Black Widow');
    assert.neverCalledWith(notification, pullRequest, 'Spider-Man');
  });

});