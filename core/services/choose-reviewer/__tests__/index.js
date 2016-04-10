import service, { ChooseReviewer } from '../../choose-reviewer';
import teamMock, { membersMock } from '../../choose-team/__mocks__/index';
import modelMock from '../../model/__mocks__/index';
import loggerMock from '../../logger/__mocks__/index';
import pullRequestMock from '../../model/__mocks__/pull-request';

describe('services/choose-reviewer', function () {

  describe('ChooseReviewer', function () {
    let team, model, logger, pullRequest, PullRequestModel;
    let imports, options;

    beforeEach(function () {
      team = teamMock();
      team.findByPullRequest.returns(Promise.resolve(membersMock()));
      team.findTeamNameByPullRequest.returns('Avengers');

      model = modelMock();
      logger = loggerMock();

      pullRequest = pullRequestMock();

      PullRequestModel = model.get('pull_request');
      PullRequestModel.findById.returns(Promise.resolve(pullRequest));

      options = {};
      imports = { 'choose-team': team, logger, 'pull-request-model': PullRequestModel };
    });

    describe('#start', () => {

      it('should throws error if pull request is not found', done => {
        const review = new ChooseReviewer(options, imports);

        PullRequestModel.findById.returns(Promise.resolve(null));

        review.start(123456)
          .catch(error => {
            assert.instanceOf(error, Error);
            assert.match(error.toString(), /not found/);
            done();
          })
          .catch(done);
      });

    });

    describe('#setSteps', () => {

      it('should be rejected if there is no steps for team for pull request', done => {
        const review = new ChooseReviewer(options, imports);

        review.setSteps({ pullRequest: {} }).catch(() => done());
      });

      it('should be resolved with review which includes steps for pull request', done => {
        options = {
          Avengers: {
            steps: ['step1', 'step2']
          }
        };

        imports.step1 = '1';
        imports.step2 = '2';

        const review = new ChooseReviewer(options, imports);

        review.setSteps({ pullRequest: {} })
          .then(resolved => {
            assert.deepEqual(resolved.steps, ['1', '2']);
            done();
          })
          .catch(done);
      });

    });

    describe('#stepsQueue', () => {

      it('should iterate through steps', done => {
        const order = [];

        const createStep = function (name) {
          return function (review) {
            order.push(name);
            return Promise.resolve(review);
          };
        };

        const _steps = [
          createStep('one'),
          createStep('two'),
          createStep('three'),
          createStep('four')
        ];

        const review = new ChooseReviewer(options, imports);

        review.stepsQueue({ steps: _steps, team: [] })
          .then(() => {
            assert.deepEqual(order, ['one', 'two', 'three', 'four']);
          })
          .then(done, done);
      });

      describe('each step', () => {

        it('should receive team and pullRequest', done => {
          const steps = [
            function (review) {
              assert.equal(review.pullRequest, pullRequest);
              assert.deepEqual(review.team, membersMock());

              return Promise.resolve(review);
            }
          ];

          const review = new ChooseReviewer(options, imports);

          review.stepsQueue({ steps, pullRequest, team: membersMock() })
            .then(() => null)
            .then(done, done);
        });

        it('should be able to change the team', done => {
          const steps = [
            function (review) {
              review.team.splice(0, 5);
              return Promise.resolve(review);
            },
            function (review) {
              assert.lengthOf(review.team, 12);
              return Promise.resolve(review);
            }
          ];

          const review = new ChooseReviewer(options, imports);

          review.stepsQueue({ steps, pullRequest, team: membersMock() })
            .then(() => null)
            .then(done, done);
        });

      });

    });

    describe('#review', () => {

      it('should not throw error if reviewers will not selected', done => {
        options = {
          Avengers: {
            steps: ['step1']
          }
        };

        imports.step1 = function (review) {
          return Promise.resolve(review);
        };

        const review = new ChooseReviewer(options, imports);

        review.review(123456)
          .then(() => null)
          .then(done, done);
      });

    });

    describe('#getSteps', function () {

      let review;

      beforeEach(() => {
        options = {
          Avengers: {
            steps: [
              'step1',
              'step2'
            ]
          }
        };

        imports.step1 = '1';
        imports.step2 = '2';

        review = new ChooseReviewer(options, imports);
      });

      it('should be rejected if team was not found', done => {
        team.findTeamNameByPullRequest = sinon.stub().returns(null);

        review.getSteps({}).catch(() => done());
      });

      it('should be rejected if there aren`t any steps for team', done => {
        team.findTeamNameByPullRequest = sinon.stub().returns('team');

        review.getSteps({}).catch(() => done());
      });

      it('should throw an error if there is no step with passed name', done => {
        imports.step2 = null;

        review.getSteps({}).catch(() => done());
      });

      it('should instantiate steps and resolve with steps array', done => {
        options = {
          Avengers: {
            steps: ['step1', 'step2']
          }
        };

        imports.step1 = '1';
        imports.step2 = '2';

        review = new ChooseReviewer(options, imports);

        review.getSteps({})
          .then(resolved => {
            assert.deepEqual(resolved, ['1', '2']);

            done();
          })
          .catch(done);
      });

    });

  });

  describe('service', () => {

    it('should be resolved to ChooseReviewer', function () {
      const model = { get: sinon.stub().returns({}) };
      const options = { steps: ['step1', 'step2'] };
      const requireDefault = sinon.stub();
      const imports = { model, requireDefault };

      requireDefault.returns(function step() {});

      assert.property(service(options, imports), 'review');
    });

  });

});
