import util from 'util';
import { isEmpty, get } from 'lodash';

export default function setup(options, imports) {
  const chooseTeam = imports['choose-team'];

  /**
   * Get steps for team.
   *
   * @param {Object} pullRequest
   *
   * @return {Object} { steps, stepOptions }
   */
  return function getSteps(pullRequest) {
    const teamName = chooseTeam.findTeamNameByPullRequest(pullRequest);

    if (!teamName) {
      return Promise.reject(new Error(util.format(
        'Team not found for pull request [%s – %s] %s',
        pullRequest.id, pullRequest.title, pullRequest.html_url
      )));
    }

    const steps =
      get(options, [teamName, 'steps']) ||
      get(options, ['default', 'steps']);

    if (isEmpty(steps)) {
      return Promise.reject(new Error(util.format(
        'There aren\'t any steps for given team — %s',
        teamName
      )));
    }

    return Promise.resolve(
      steps.map(name => {
        const ranker = imports[name];

        if (!ranker) {
          throw new Error(util.format('There is no step with name "%s"', name));
        }

        return ranker;
      })
    );
  };

}
