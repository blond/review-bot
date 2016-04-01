import util from 'util';
import { get, isEmpty } from 'lodash';

export class PullRequestAction {

  /**
   * @constructor
   *
   * @param {Object} options
   * @param {Object} imports
   */
  constructor(options, { team, events, logger, pullRequest }) {
    this.options = options;

    this.team = team;
    this.events = events;
    this.logger = logger;
    this.pullRequest = pullRequest;
  }

  /**
   * Start review.
   *
   * @param {Number} pullId
   *
   * @return {Promise}
   */
  startReview(pullId) {

    return new Promise((resolve, reject) => {

      this.pullRequest
        .findById(pullId)
        .then(pullRequest => {
          if (!pullRequest) throw new Error('Pull request `${pullId}` not found');

          const review = pullRequest.get('review');

          if (review.status !== 'open') {
            throw new Error(util.format(
              'Try to start not open review [%s – %s] %s',
              pullRequest.id,
              pullRequest.title,
              pullRequest.html_url
            ));
          }

          if (isEmpty(review.reviewers)) {
            throw new Error(util.format(
              'Try to start review where reviewers were not selected [%s – %s] %s',
              pullRequest.id,
              pullRequest.title,
              pullRequest.html_url
            ));
          }

          review.status = 'inprogress';
          review.started_at = new Date();

          pullRequest.set('review', review);

          return pullRequest.save();
        })
        .then(pullRequest => {
          this.events.emit('review:started', { pullRequest });
          this.logger.info(
            'Review started [%s – %s] %s',
            pullRequest.number,
            pullRequest.title,
            pullRequest.html_url
          );

          return pullRequest;
        })
        .then(resolve, reject);

    });

  }

  /**
   * Stop review.
   *
   * @param {Number} pullId
   *
   * @return {Promise}
   */
  stopReview(pullId) {

    return new Promise((resolve, reject) => {

      this.pullRequest
        .findById(pullId)
        .then(pullRequest => {
          if (!pullRequest) throw new Error('Pull request `${pullId}` not found');

          const review = pullRequest.get('review');

          if (review.status !== 'inprogress') {
            this.logger(
              'Try to stop not in progress review [%s – %s] %s',
              pullRequest.id,
              pullRequest.title,
              pullRequest.html_url
            );
          }

          review.status = 'open';

          pullRequest.set('review', review);

          return pullRequest.save();

        })
        .then(pullRequest => {
          this.events.emit('review:updated', { pullRequest });
          this.logger.info(
            'Review stopped [%s – %s] %s',
            pullRequest.number,
            pullRequest.title,
            pullRequest.html_url
          );

          return pullRequest;
        })
        .then(resolve, reject);

    });

  }

  /**
   * Update reviewers list.
   *
   * @param {Object} reviewers
   * @param {Number} pullId
   *
   * @return {Promise}
   */
  updateReviewers(reviewers, pullId) {

    return new Promise((resolve, reject) => {

      this.pullRequest
      .findById(pullId)
      .then(pullRequest => {

        if (!pullRequest) throw new Error('Pull request `${pullId}` not found');

        const review = pullRequest.get('review') || {};

        review.reviewers = reviewers;

        if (isEmpty(review.reviewers)) {
          throw new Error(util.format(
            'Cannot drop all reviewers from pull request [%s – %s] %s',
            pullRequest.number,
            pullRequest.title,
            pullRequest.html_url
          ));
        }

        pullRequest.set('review', review);

        return pullRequest.save();
      })
      .then(pullRequest => {
        this.events.emit('review:updated', { pullRequest });

        this.logger.info(
          'Reviewers updated [%s – %s] %s',
          pullRequest.number,
          pullRequest.title,
          pullRequest.html_url
        );

        return pullRequest;
      })
      .then(resolve, reject);

    });

  }

  /**
   * Approve and complete review if approved reviewers equal `approveCount`.
   *
   * @param {String} login - user which approves pull.
   * @param {String} pullId
   *
   * @return {Promise}
   */
  approveReview(login, pullId) {

    return new Promise((resolve, reject) => {

      let approvedCount = 0;

      this.pullRequest
      .findById(pullId)
      .then(pullRequest => {

        if (!pullRequest) {
          throw new Error('Pull request `${pullId}` not found');
        }

        const review = pullRequest.get('review');
        const requiredApprovedCount = this.getRequiredApproveCount(pullRequest);

        review.reviewers.forEach(reviewer => {
          if (reviewer.login === login) {
            reviewer.approved = true;
          }

          if (reviewer.approved) {
            approvedCount += 1;
          }

          if (approvedCount >= requiredApprovedCount) {
            review.status = 'complete';
          }
        });

        review.updated_at = new Date();
        if (review.status === 'complete') {
          review.completed_at = new Date();
        }

        pullRequest.set('review', review);

        return pullRequest.save();

      })
      .then(pullRequest => {

        if (pullRequest.get('review.status') === 'complete') {
          this.logger.info(
            'Review complete [%s – %s] %s',
            pullRequest.number,
            pullRequest.title,
            pullRequest.html_url
          );

          this.events.emit('review:approved', { pullRequest, login });
          this.events.emit('review:complete', { pullRequest });
        } else {
          this.logger.info(
            'Review approved by %s [%s - %s] %s',
            login,
            pullRequest.number,
            pullRequest.title,
            pullRequest.html_url
          );

          this.events.emit('review:approved', { pullRequest, login });
        }

        return pullRequest;

      })
      .then(resolve, reject);

    });

  }

  /**
   * Returns number of approved reviews after which review will be marked as completed.
   *
   * @param {Object} pullRequest
   *
   * @return {Number}
   */
  getRequiredApproveCount(pullRequest) {
    const teamName = this.team.findTeamNameByPullRequest(pullRequest);

    return get(
      this.options,
      [teamName, 'approveCount'],
      this.options.defaultApproveCount
    );
  }

}

export default function setup(options, imports) {

  const { events, logger, 'choose-team': team } = imports;
  const service = new PullRequestAction(options, {
    team,
    logger,
    events,
    pullRequest: imports['pull-request-model']
  });

  return service;

}
