import { forEach } from 'lodash';

export function message({ pullRequest }) {

  return '' +
`You were assigned to review the pull request:
#${pullRequest.number} – ${pullRequest.title}
${pullRequest.html_url}`;

}

export default function setup(options, imports) {
  const events = imports.events;
  const notification = imports.notification;

  function startNotification(payload) {
    const reviewers = payload.pullRequest.get('review.reviewers');

    const body = message(payload);
    forEach(reviewers, (member) => {
      notification(member.login, body);
    });
  }

  events.on('review:started', startNotification);

  return {};
}
