import _ from 'lodash';
import service, { ReviewBadgeBuilder } from '../../review-badges';
import queueMock from '../../../services/queue/__mocks__/index';
import eventsMock from '../../../services/events/__mocks__/index';
import loggerMock from '../../../services/logger/__mocks__/index';
import pullRequestMock from '../../../services/model/__mocks__/pull-request';
import pullRequestGitHubMock from '../../../services/pull-request-github/__mocks__/index';
import { pullRequestModelMock } from '../../../services/model/__mocks__/index';

describe('plugins/review-badges', function () {

  let queue, logger, events, pullRequest, pullRequestGitHub, pullRequestModel;
  let options, imports, payload;

  beforeEach(function () {

    queue = queueMock();
    events = eventsMock();
    logger = loggerMock();
    pullRequest = pullRequestMock();
    pullRequestModel = pullRequestModelMock();
    pullRequestGitHub = pullRequestGitHubMock();

    options = {
      url: 'http://shields.io/badges/'
    };

    imports = {
      queue,
      logger,
      events,
      'pull-request-model': pullRequestModel,
      'pull-request-github': pullRequestGitHub
    };

    payload = { pullRequest };

    queue.dispatch
      .callsArg(1);

    events.on
      .withArgs('review:started')
      .callsArgWith(1, payload);

    pullRequest.get
      .withArgs('review')
      .returns({ status: 'notstarted', reviewers: [{ login: 'Thor' }] });

    pullRequestModel.findById.returns(Promise.resolve(pullRequest));

    pullRequestGitHub.setBodySection.returns(Promise.resolve());

  });

  it('should update badges when pull request started', function (done) {

    service(options, imports);

    setTimeout(function () {
      done();
    }, 0);

  });

});

describe('ReviewBadgeBuilder', function () {

  let builder;

  beforeEach(function () {
    builder = new ReviewBadgeBuilder('http://shields.io/badges/');
  });

  describe('#statusToColor', function () {

    it('should pick different colors for "notstarted", "inprogress" and "complete"', function () {
      const status = ['notstarted', 'inprogress', 'complete'];
      const colors = status.map(name => builder.statusToColor(name));

      assert.lengthOf(_.uniq(colors), 3);
    });

  });

  describe('#statusToTitle', function () {

    it('should pick different titles for "notstarted", "inprogress" and "complete"', function () {
      const status = ['notstarted', 'inprogress', 'complete'];
      const titles = status.map(name => builder.statusToTitle(name));

      assert.lengthOf(_.uniq(titles), 3);
    });

  });

  describe('#buildReviewerBadge', function () {

    beforeEach(function () {
      sinon.stub(builder, 'create');
    });

    afterEach(function () {
      builder.create.restore();
    });

    it('should create badge with "…" status and yellow color if reviewer does not approve request', function () {
      builder.buildReviewerBadge({ login: 'Hawkeye', approved: false });

      assert.calledWith(builder.create, 'Hawkeye', '…', 'yellow');
    });

    it('should create badge with "ok" status and green color if reviewer approve request', function () {
      builder.buildReviewerBadge({ login: 'Hawkeye', approved: true });

      assert.calledWith(builder.create, 'Hawkeye', 'ok', 'green');
    });

  });

});


