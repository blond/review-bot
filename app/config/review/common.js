var config = require('app/core/config');

module.exports = {
    approveCount: 2,
    processors: [
        require('app/plugins/review_choose_reviewers/remove_author')(),
        require('app/plugins/review_choose_reviewers/remove_already_reviewers')(),
        require('app/plugins/review_choose_reviewers/commiters')(4, config.load('commiters')),
        require('app/plugins/review_choose_reviewers/random')(5),
        require('app/plugins/review_choose_reviewers/load')(1),
        require('app/plugins/review_choose_reviewers/sort')(),
        require('app/plugins/review_choose_reviewers/total_number')(2)
    ]
};
