import _ from 'lodash';

/**
 * Check for autostarting review.
 *
 * @param {Object} pullRequest
 *
 * @return {Boolean}
 */
function shouldStart(pullRequest) {
  return _.isEmpty(pullRequest.get('review.reviewers'));
}

export default function setup(options, imports) {

  const logger = imports.logger;
  const events = imports.events;
  const chooseReviewer = imports['choose-reviewer'];
  const pullRequestAction = imports['pull-request-action'];

  /**
   * Plugin for auto assign reviewers for pull request.
   *
   * @param {Object} payload
   * @param {Object} payload.pullRequest
   *
   * @return {Promise}
   */
  function autoStart(payload) {
    const pullRequest = payload.pullRequest;

    if (!shouldStart(pullRequest)) {
      return;
    }

    logger.info('Autostart review %s', pullRequest.toString());

    return chooseReviewer
      .review(pullRequest.id)
      .then(resultReview => {
        return pullRequestAction.updateReviewers(resultReview.team, pullRequest.id);
      })
      .catch(::logger.error);
  }

  events.on('github:pull_request:opened', autoStart);
  events.on('github:pull_request:synchronize', autoStart);

  return {};
}
