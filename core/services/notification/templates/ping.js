import { filter, forEach } from 'lodash';

function message({ pullRequest }) {

  return '' +
`Reminder! You have to review pull request:
#${pullRequest.number} – ${pullRequest.title}
${pullRequest.html_url}`;

}

export default function setup(options, imports) {
  const events = imports.events;
  const notification = imports.notification;

  function pingNotification(payload) {
    const reviewers = filter(
      payload.pullRequest.get('review.reviewers'),
      (reviewer) => !reviewer.approved
    );

    const body = message(payload);
    forEach(reviewers, (member) => {
      notification(member.login, body);
    });
  }

  events.on('review:command:ping', pingNotification);

  return {};
}


