import Queue from './queue';

export default function setup(options, imports) {
  const service = new Queue();

  return service;
}
