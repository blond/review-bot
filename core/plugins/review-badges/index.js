import BadgeBase from '../../modules/badge-base';

export class ReviewBadgeBuilder extends BadgeBase {

  /**
   * @constructor
   *
   * @param {String} url
   */
  constructor(url) {
    super(url);
  }

  /**
   * Map review status to color.
   *
   * @param {String} status
   *
   * @return {String}
   */
  statusToColor(status) {
    switch (status) {
      case 'inprogress':
        return 'yellow';
      case 'complete':
        return 'green';
      default:
        return 'lightgrey';
    }
  }

  /**
   * Map review status to badge title.
   *
   * @param {String} status
   *
   * @return {String}
   */
  statusToTitle(status) {
    switch (status) {
      case 'inprogress':
        return 'in progress';
      case 'notstarted':
        return 'not started';
      default:
        return status;
    }
  }

  /**
   * Create review status badge.
   *
   * @param {Object} review
   * @param {String} review.status
   *
   * @return {String}
   */
  buildStatusBadge(review) {
    return this.create(
      'review',
      this.statusToTitle(review.status),
      this.statusToColor(review.status)
    );
  }

  /**
   * Create reviewer badge.
   *
   * @param {Object}  reviewer
   * @param {String}  reviewer.login
   * @param {Boolean} reviewer.approved
   * @param {String}  reviewer.html_url
   *
   * @return {String}
   */
  buildReviewerBadge(reviewer) {
    return this.create(
      reviewer.login,
      reviewer.approved ? 'ok' : '…',
      reviewer.approved ? 'green' : 'yellow',
      reviewer.html_url
    );
  }

  /**
   * Concat review status badge and reviewers badges.
   *
   * @param {Object} review
   *
   * @return {String}
   */
  build(review) {
    const status = this.buildStatusBadge(review);
    const reviewers = review.reviewers.map(::this.buildReviewerBadge);

    return status + ' ' + reviewers.join(' ');
  }

}

export default function (options, imports) {
  const queue = imports.queue;
  const events = imports.events;
  const logger = imports.logger;
  const pullRequestModel = imports['pull-request-model'];
  const pullRequestGithub = imports['pull-request-github'];

  const builder = new ReviewBadgeBuilder(options.url);

  function updatePullRequestBody(pullRequest) {
    const badgeContent = builder.build(pullRequest.get('review'));

    return pullRequestGithub.setBodySection(
      pullRequest.id, // pull id
      'review:badge', // section id
      badgeContent,   // content
      100             // position
    );
  }

  function logReviewBadgesUpdate(pullRequest) {
    logger.info('Review badges updated %s', pullRequest.toString());
  }

  /**
   * Call method for updating pull request body with review badges.
   *
   * @param {Object} payload
   *
   * @return {Promise}
   */
  function updateReviewBadges(payload) {
    const pullId = payload.pullRequest.id;

    return queue
      .dispatch('pull-request-body-update#' + pullId, () => {
        return new Promise((resolve, reject) => {
          pullRequestModel
            .findById(pullId)
            .then(updatePullRequestBody)
            .then(logReviewBadgesUpdate)
            .then(resolve, reject);
        });
      })
      .catch(::logger.error);
  }

  // Subscribe to events to create review badges.
  events.on('review:started', updateReviewBadges);
  events.on('review:updated', updateReviewBadges);
  events.on('review:approved', updateReviewBadges);
  events.on('review:complete', updateReviewBadges);

  return {};
}
