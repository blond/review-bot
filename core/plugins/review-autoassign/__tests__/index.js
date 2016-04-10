import service from '../../review-autoassign';
import eventsMock from '../../../services/events/__mocks__/index';
import loggerMock from '../../../services/logger/__mocks__/index';
import pullRequestMock from '../../../services/model/__mocks__/pull-request';
import pullRequestActionMock from '../../../services/pull-request-action/__mocks__/index';
import chooseReviewerMock from '../../../services/choose-reviewer/__mocks__/index';

describe('plugins/review-autoassign', function () {

  let logger, events, chooseReviewer, pullRequestAction, pullRequest;
  let options, imports, payload, reviewResult;

  beforeEach(function () {

    events = eventsMock();
    logger = loggerMock();
    pullRequest = pullRequestMock();
    pullRequestAction = pullRequestActionMock(pullRequest);
    chooseReviewer = chooseReviewerMock();

    options = {};

    imports = {
      logger,
      events,
      'choose-reviewer': chooseReviewer,
      'pull-request-action': pullRequestAction
    };

    payload = { pullRequest };

    reviewResult = {
      team: ['Captain America', 'Hawkeye']
    };

    events.on
      .withArgs('github:pull_request:opened')
      .callsArgWith(1, payload);

    chooseReviewer.review
      .withArgs(pullRequest.id)
      .returns(Promise.resolve(reviewResult));

  });

  it('should start review when someone open a new pull request', function (done) {

    service(options, imports);

    setTimeout(function () {
      assert.calledWithExactly(
        pullRequestAction.updateReviewers,
        reviewResult.team,
        1
      );
      done();
    }, 0);

  });

  it('should not restart if reviewers were selected before', function (done) {

    payload.pullRequest.get
      .withArgs('review.reviewers')
      .returns([{ login: 'Hulk' }]);

    service(options, imports);

    setTimeout(function () {
      assert.notCalled(pullRequestAction.updateReviewers);
      done();
    }, 0);

  });

});
