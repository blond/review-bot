export default function setup(options, imports) {
  const model = imports.model;

  return model.get('pull_request');
}
