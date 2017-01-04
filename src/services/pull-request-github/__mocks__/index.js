export default function mock(pullRequest) {

  return {
    loadPullRequestFromGitHub: sinon.stub().returns(Promise.resolve(pullRequest)),
    updatePullRequestOnGitHub: sinon.stub().returns(Promise.resolve(pullRequest)),
    loadPullRequestFiles: sinon.stub().returns(Promise.resolve(pullRequest)),
    syncPullRequestWithGitHub: sinon.stub(),
    setDeploymentStatus: sinon.stub().returns(Promise.resolve(pullRequest)),
    setBodySection: sinon.stub(),
    setPayload: sinon.stub()
  };

}
