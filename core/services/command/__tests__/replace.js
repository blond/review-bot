import { clone } from 'lodash';

import parseLogins from '../../parse-logins/parse-logins';

import service from '../commands/replace';
import teamMock from '../../choose-team/__mocks__/index';
import eventsMock from '../../events/__mocks__/index';
import loggerMock from '../../logger/__mocks__/index';
import { mockReviewers } from '../__mocks__/index';
import pullRequestMock from '../../model/__mocks__/pull_request';
import pullRequestActionMock from '../../pull-request-action/__mocks__/index';


describe('services/command/replace', () => {

  describe('#replaceCommand', () => {
    let command;
    let action, events, logger, team, review;
    let options, imports, comment, payload, pullRequest, reviewResult;

    const promise = (x) => Promise.resolve(x);

    beforeEach(() => {

      team = teamMock();
      team.findTeamMemberByPullRequest.returns(promise({ login: 'Hawkeye' }));

      events = eventsMock();
      logger = loggerMock();

      reviewResult = {
        team: [{ login: 'Thor' }]
      };

      review = {
        review: sinon.stub().returns(promise(reviewResult))
      };

      action = pullRequestActionMock(pullRequest);

      comment = {
        user: {
          login: 'Hulk'
        }
      };

      pullRequest = pullRequestMock();
      pullRequest.id = 42;
      pullRequest.state = 'open';
      pullRequest.review = {
        reviewers: [{ login: 'Hulk' }, { login: 'Spider-Man' }]
      };
      pullRequest.get.withArgs('review.reviewers').returns(clone(mockReviewers));

      options = {};
      imports = { team, action, logger, events, review, parseLogins };

      payload = { pullRequest, comment };
      command = service(options, imports);

    });

    it('should emit `review:command:replace` event', function (done) {
      command('/replace Hulk', payload).then(() => {
        assert.calledWith(events.emit, 'review:command:replace');

        done();
      }, done);
    });

    it('should save pullRequest with new reviewer', function (done) {
      command('/replace Hulk', payload)
        .then(() => {
          assert.calledWithMatch(action.updateReviewers, sinon.match(function (reviewers) {

            assert.sameDeepMembers(
              reviewers,
              [{ login: 'Thor' }, { login: 'Spider-Man' }]
            );

            return true;

          }));

          done();
        })
        .catch(done);
    });

    it('should be rejected if pull is closed', function (done) {
      pullRequest.state = 'closed';

      command('/replace Hulk', payload)
        .catch(() => done());
    });

    it('should be rejected if old reviewer not in reviewers list', done => {
      command('/replace Hawkeye', payload).catch(() => done());
    });

  });

});
