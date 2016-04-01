import GitHubTeam from './github';

export default function setup(options, imports) {

  const github = imports.github;

  return new GitHubTeam(github, options.slug);

}
