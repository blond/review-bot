import { isEmpty } from 'lodash';

export class ChooseReviewer {

  /**
   * @constructor
   *
   * @param {Object} payload
   */
  constructor({ team, steps, logger, 'pull-request-model': pullRequestModel }) {
    this.team = team;
    this.steps = steps;
    this.logger = logger;
    this.pullRequestModel = pullRequestModel;
  }

  /**
   * Get and then set team for pull request.
   *
   * @param {Review} review
   *
   * @return {Promise}
   */
  setTeam(review) {
    return this.team
      .findByPullRequest(review.pullRequest)
      .then(team => {
        review.team = team;
        return review;
      });
  }

  /**
   * Find choose reviewer steps for team.
   *
   * @param {Review} review
   *
   * @return {Promise}
   */
  setSteps(review) {
    return this.steps(review.pullRequest)
      .then(steps => {
        review.steps = steps;
        return review;
      });
  }

  /**
   * Add zero rank for every reviewer.
   *
   * @param {Review} review
   *
   * @return {Promise}
   */
  addZeroRank(review) {
    review.team.forEach(member => { member.rank = 0; });

    return Promise.resolve(review);
  }

  /**
   * Start ranking queue.
   *
   * @param {Number} pullId - pull request id
   *
   * @return {Promise}
   */
  start(pullId) {
    return new Promise((resolve, reject) => {
      this.pullRequestModel
        .findById(pullId)
        .then(pullRequest => {
          if (!pullRequest) {
            return reject(new Error(`Pull request #${pullId} not found`));
          }

          resolve({ pullRequest, team: [] });
        });
    });
  }

  /**
   * Build queue from steps.
   *
   * @param {Review} review
   *
   * @return {Promise}
   */
  stepsQueue(review) {
    return review.steps.reduce((queue, ranker) => {
      return queue.then(review => {
        this.logger.info('Choose reviewer phase is `%s`', ranker.name);
        this.logger.info(
          'Temporary ranks: ' + review.team.map(x => x.login + '#' + x.rank).join(' ')
        );

        return ranker(review);
      });
    }, Promise.resolve(review));
  }

  /**
   * Main review suggestion method.
   * Create queue of promises from processor and retrun suggested reviewers.
   *
   * @param {Number} pullId
   *
   * @return {Promise}
   */
  review(pullId) {
    this.logger.info('Review started for #%s', pullId);

    return this
      .start(pullId)
      .then(::this.setTeam)
      .then(::this.setSteps)
      .then(::this.addZeroRank)
      .then(::this.stepsQueue)
      .then(review => {
        this.logger.info(
          'Choose reviewers complete [%s — %s] %s',
          review.pullRequest.id,
          review.pullRequest.title,
          review.pullRequest.html_url
        );

        this.logger.info('Reviewers are: %s',
          (!isEmpty(review.team)) ?
            review.team.map(x => x.login + '#' + x.rank).join(' ') :
            'ooops, no reviewers were selected...'
        );

        return review;
      });
  }

}

export default function setup(options, imports) {
  const service = new ChooseReviewer(imports);

  return service;
}

/**
 * Review.
 *
 * @typedef {Object} Review
 *
 * @property {Object} pullRequest - Pull Request.
 * @property {Array}  team - Team members for review.
 * @property {Array}  steps - Steps for choosing reviewer.
 */
