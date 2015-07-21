describe('Core Model: PullRequest', function () {
    var pullRequestMock = require('app/modules/models/__tests__/mocks/pull_request.json');
    var PullRequest = require('../').get('PullRequest');

    beforeEach(function (done) {
        var pullRequest = new PullRequest(pullRequestMock);

        pullRequest.save(done);
    });

    afterEach(function (done) {
        PullRequest.remove({}, done);
    });

    it('should find pull request by it`s number and repo full name', function (done) {
        PullRequest.findByNumberAndRepo(5, 'devexp-org/devexp').then(function (pr) {
            assert.isObject(pr);

            done();
        });
    });
});