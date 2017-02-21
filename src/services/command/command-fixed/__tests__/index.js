import service from '../';

import eventsMock from '../../../events/__mocks__/';
import loggerMock from '../../../logger/__mocks__/';
import { reviewersMock } from '../../__mocks__/';
import { pullRequestMock } from
  '../../../model/model-pull-request/__mocks__/';
import teamManagerMock, { teamDriverMock } from
  '../../../team-manager/__mocks__/';
import pullRequestReviewMock, { pullRequestReviewMixin } from
  '../../../pull-request-review/__mocks__/';

describe('services/command/fixed', function () {

  let team, events, logger, teamManager, pullRequest, pullRequestReview;
  let options, imports, command, comment, payload;

  beforeEach(function () {

    team = teamDriverMock();
    team.findTeamMember
      .returns(Promise.resolve({ login: 'Hawkeye' }));

    events = eventsMock();
    logger = loggerMock();

    teamManager = teamManagerMock(team);

    pullRequest = pullRequestMock(pullRequestReviewMixin);
    pullRequest.user.login = 'Black Widow';
    pullRequest.review.status = 'changesneeded';
    pullRequest.review.reviewers = reviewersMock();

    pullRequestReview = pullRequestReviewMock(pullRequest);

    comment = { user: { login: 'Black Widow' } };

    payload = { pullRequest, comment, team };

    options = {};

    imports = {
      events,
      logger,
      'team-manager': teamManager,
      'pull-request-review': pullRequestReview
    };

    command = service(options, imports).command;

  });

  it('should return rejected promise if pull request is closed', function (done) {
    pullRequest.state = 'closed';

    command('/fixed', payload)
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /closed/))
      .then(done, done);
  });

  it('should return rejected promise if commenter is not an author', function (done) {
    pullRequest.user.login = 'Spider-Man';

    command('/fixed', payload)
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /author/i))
      .then(done, done);
  });

  it('should return resolved promise if commenter is not an author but config allows it', function (done) {
    pullRequest.user.login = 'Spider-Man';
    team.getOption.withArgs('fixReviewByAnyone').returns(true);

    command('/fixed', payload)
      .then(() => {})
      .then(done, done);
  });

  it('should return rejected promise if pull request review is not open', function (done) {
    pullRequest.review.status = 'inprogress';

    command('/fixed', payload)
      .then(() => { throw new Error('should reject promise'); })
      .catch(error => assert.match(error.message, /changesneeded/))
      .then(done, done);
  });

  it('should emit review:command:fixed event', function (done) {
    command('/start', payload)
      .then(() => assert.calledWith(events.emit, 'review:command:fixed'))
      .then(done, done);
  });

});