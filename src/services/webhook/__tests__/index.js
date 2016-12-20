import express from 'express';
import request from 'supertest';
import proxyquire from 'proxyquire';
import bodyParser from 'body-parser';
import loggerMock from '../../logger/__mocks__/';
import handleError from '../../http/middlewares/handle-error';

describe('services/webhook', function () {

  let options, imports;
  let app, router, service, logger;
  let pullRequestHookStub, issueCommentHookStub;

  beforeEach(function () {

    app = express();

    logger = loggerMock();

    options = {};
    imports = { logger };

    pullRequestHookStub = sinon.stub().returns(Promise.resolve({}));

    issueCommentHookStub = sinon.stub().returns(Promise.resolve({}));

    const routes = proxyquire('../index', {
      './github/pull_request': {
        'default': pullRequestHookStub
      },
      './github/issue_comment': {
        'default': issueCommentHookStub
      }
    });

    service = routes.default;

    router = service(options, imports);

  });

  it('should response `ok` on `/github`', function (done) {
    app.use(router);

    request(app)
      .get('/github')
      .expect('ok')
      .expect('Content-Type', /text\/html/)
      .expect(200)
      .end(done);
  });

  describe('`/github` without bodyParser', function () {

    it('should fail if body-parser is not installed', function (done) {
      app.use(handleError());
      app.use(router);

      request(app)
        .post('/github')
        .type('json')
        .expect('Content-Type', /application\/json/)
        .expect(500)
        .end(done);
    });

  });

  describe('`/github` with header `x-github-event`', function () {

    beforeEach(function () {
      app.use(bodyParser.json());
      app.use(handleError());
      app.use(router);
    });

    it('should response `pong` on `ping`', function (done) {
      request(app)
        .post('/github')
        .send({ action: 'ping' })
        .set('x-github-event', 'ping')
        .expect('Content-Type', /text\/html/)
        .expect(200)
        .expect('pong')
        .end(done);
    });

    it('should call pullRequestHook on `pull_request`', function (done) {
      request(app)
        .post('/github')
        .send({ action: 'pull_request' })
        .set('x-github-event', 'pull_request')
        .expect(200)
        .end(err => {
          assert.called(pullRequestHookStub);
          done(err);
        });
    });

    it('should call issueCommentHook on `issue_comment`', function (done) {
      request(app)
        .post('/github')
        .send({ action: 'issue_comment' })
        .set('x-github-event', 'issue_comment')
        .expect(200)
        .end(err => {
          assert.called(issueCommentHookStub);
          done(err);
        });
    });

    it('should fail on unknown event', function (done) {
      request(app)
        .post('/github')
        .set('x-github-event', 'foo')
        .send({ action: 'foo' })
        .expect(/unknown event/i)
        .end(done);
    });

  });

});