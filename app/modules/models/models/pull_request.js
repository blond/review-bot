const REPO_REGEX = /repos\/(.*\/.*)\/pulls/;

var mongoose = require('mongoose');
var addons = require('./../addons');
var Schema = mongoose.Schema;
var baseSchema = {
    _id: Number,
    id: Number,
    title: String,
    body: String,
    url: String,
    org: String,
    repo: String,
    full_name: String,
    html_url: String,
    number: Number,
    state: {
        type: String,
        'enum': ['open', 'closed']
    },
    user: {
        login: String,
        avatar_url: String,
        url: String,
        html_url: String
    },
    created_at: Date,
    updated_at: Date,
    closed_at: Date,
    merged_at: Date,
    merged: Boolean,
    merged_by: {
        login: String,
        avatar_url: String,
        url: String,
        html_url: String
    },
    comments: Number,
    review_comments: Number,
    review: {
        status: {
            type: String,
            'enum': ['notstarted', 'inprogress', 'complete'],
            'default': 'notstarted'
        },
        reviewers: Array,
        started_at: Date,
        updated_at: Date,
        completed_at: Date
    },
    commits: Number,
    additions: Number,
    deletions: Number,
    changed_files: Number,
    head: Schema.Types.Mixed,
    files: {
        type: Array,
        'default': []
    }
};

/**
 * Setup model
 */
addons.setupExtenders('PullRequest', baseSchema);

var PullRequest = new Schema(baseSchema);

addons.setupHooks('PullRequest', PullRequest);

/**
 * Setup properties hooks
 */

/**
 * Replace mongo id with pull request id.
 *
 * @param {Number} 'id' - pull requiest id.
 *
 * @returns {Number}
 */
PullRequest.path('id').set(function (v) {
    this._id = v;

    return v;
});

/**
 * Parse url and get owner/repo.
 *
 * @param {String} 'url' - pull request url.
 *
 * @returns {String}
 */
PullRequest.path('url').set(function (v) {
    var repo = v.match(REPO_REGEX) || [];

    if (repo[1]) {
        repo = repo[1];

        this.full_name = repo;
        this.repo = repo.split('/')[1];
        this.org = repo.split('/')[0];
    }

    return v;
});

/**
 * Model static methods
 */

/**
 * Find pull request by number and repo
 *
 * @param {Number} number
 * @param {String} fullName - repository full name
 *
 * @returns {Promise}
 */
PullRequest.statics.findByNumberAndRepo = function (number, fullName) {
    return this.model('PullRequest').findOne({
        number: number,
        'full_name': fullName
    });
};

/**
 * Find pull requests by user
 *
 * @param {String} login
 *
 * @returns {Promise}
 */
PullRequest.statics.findByUsername = function (login) {
    return this.model('PullRequest').find({
        'user.login': login
    }).sort('-updated_at');
};

/**
 * Find pull requests by reviewer
 *
 * @param {String} login
 *
 * @returns {Promise}
 */
PullRequest.statics.findByReviewer = function (login) {
    return this.model('PullRequest').find({
        'review.reviewers.login': login
    }).sort('-updated_at');
};

/**
 * Find open reviews by reviewer
 *
 * @param {String} login
 *
 * @returns {Promise}
 */
PullRequest.statics.findOpenReviewsByUser = function (login) {
    return this.model('PullRequest').find({
        'state': 'open',
        'review.reviewers.login': login,
        'review.status': 'inprogress'
    }, 'review');
};

try {
    mongoose.model('PullRequest', PullRequest);
} catch(e) { } // eslint-ignore-line