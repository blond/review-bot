import service from '../../choose-reviewer-steps';
import teamMock from '../../choose-team/__mocks__/index';
import modelMock from '../../model/__mocks__/index';
import loggerMock from '../../logger/__mocks__/index';

describe('services/choose-reviewer', function () {

  let team, model, logger, imports, options, steps;

  beforeEach(() => {
    options = {
      'team-github': {
        steps: [
          'step1',
          'step2'
        ]
      }
    };

    team = {
      findTeamNameByPullRequest: sinon.stub().returns('team-github')
    };

    steps = service(options, { 'choose-team': team });
  });

  it('should be resolved to ChooseReviewerSteps', function () {
    team = teamMock();
    model = modelMock();
    logger = loggerMock();

    options = {};
    imports = { model, logger, 'choose-team': team };

    assert.isFunction(service(options, imports));
  });

  it('should be rejected if team was not found', done => {
    team.findTeamNameByPullRequest = sinon.stub().returns(null);

    steps({}).catch(() => done());
  });

  it('should be rejected if there aren`t any steps for team', done => {
    team.findTeamNameByPullRequest = sinon.stub().returns('team');

    steps({}).catch(() => done());
  });

  it('should throw an error if there is no step with passed name', () => {
    steps = service(options, { 'choose-team': team });

    assert.throws(() => { steps({}); });
  });

  it('should instantiate steps and resolve with steps array', done => {
    const step1 = function step1() {};
    const step2 = function step2() {};

    steps = service(options, { 'choose-team': team, step1, step2 });

    steps({})
      .then(resolved => {
        assert.deepEqual(resolved, [step1, step2]);

        done();
      })
      .catch(done);
  });

});
