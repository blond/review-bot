// @flow

import Queue from './class';

/**
 * Creates "queue" service.
 *
 * @return {Queue}
 */
export default function setup(): Queue {

  return new Queue();

}
