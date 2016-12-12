import { map, uniq, includes, difference } from 'lodash';

export const REVIEWER_RE = /@([a-z][-0-9a-z]+)/gi;

/**
 * Find users in description
 *
 * @param {String} body
 *
 * @return {Array}
 */
export function findReviewersInDescription(body) {
  let match;

  const reviewers = [];

  do {
    match = REVIEWER_RE.exec(body);
    if (match && match.length) {
      reviewers.push(match[1]);
    }
  } while (match !== null);

  return reviewers;
}

/**
 * Create prefered reviewers processor.
 *
 * @param {Object} options
 * @param {Number} options.max - max random rank
 * @param {Object} imports
 *
 * @return {Function}
 */
export default function setup(options, imports) {
  const teamDispatcher = imports['team-dispatcher'];

  /**
   * Up rank for prefered reviewers
   *
   * @param {Review} review
   * @param {Object} options
   *
   * @return {Review} review
   */
  function preferedReviewers(review, options) {
    let promise = [];
    const reviewers = [];

    const body = review.pullRequest.body;
    const team = teamDispatcher.findTeamByPullRequest(review.pullRequest);

    const preferedReviewers = uniq(findReviewersInDescription(body));
    const requiredReviewers = difference(preferedReviewers, map(review.members, 'login'));

    preferedReviewers.length && review.members.forEach(user => {
      if (includes(preferedReviewers, user.login)) {
        reviewers.push({ login: user.login, rank: 500 });
      }
    });

    if (requiredReviewers.length) {
      promise = requiredReviewers.map(requiredUser => {
        return team
          .findTeamMember(review.pullRequest, requiredUser)
          .then(user => {
            if (user) {
              reviewers.push({ login: user.login, rank: 500 });
            }
          });
      });
    }

    return Promise.all(promise).then(() => reviewers);
  }

  return preferedReviewers;
}
