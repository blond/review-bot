// @flow

import { isEmpty } from 'lodash';

/**
 * Queue that starts tasks in order.
 */
export default class Queue {

  queue: {
    [id: string]: {
      queue: Array<{
        id: string,
        reject: (err: Error) => void,
        resolve: () => void,
        callback: () => void
      }>,
      active: boolean
    }
  };

  /**
   * @constructor
   *
   * @property {Object} queue Queue storage.
   */
  constructor() {
    this.queue = {};
  }

  /**
   * Starts the first task from queue.
   *
   * @param {String} id Queue id.
   *
   * @protected
   */
  step(id: string) {
    if (!this.queue[id] || this.queue[id].active) {
      return;
    }

    const section = this.queue[id];
    const queueItem = section.queue.shift();

    let fulfilled = false;
    section.active = true;

    Promise.resolve()
      .then(() => queueItem.callback())
      .catch(err => {
        fulfilled = true;
        queueItem.reject(err);
      })
      .then(() => {
        section.active = false;

        fulfilled || queueItem.resolve();

        if (isEmpty(section.queue)) {
          delete this.queue[id];
        }

        this.step(id);
      });
  }

  /**
   * Inserts a new task at the end of the queue.
   *
   * @protected
   *
   * @param {String} id Queue id. Queues with different ids run in parallel.
   * @param {Function} callback Queue task.
   *
   * @return {Promise}
   */
  enqueue(id: string, callback: () => void) {
    return new Promise((resolve, reject) => {
      this.queue[id] = this.queue[id] || { active: false, queue: [] };
      this.queue[id].queue.push({ id, callback, resolve, reject });
    });
  }

  /**
   * Inserts a new task at the end of the queue and run that queue.
   *
   * @param {String} id Queue id. Queues with different ids run in parallel.
   * @param {Function} callback Queue task.
   *
   * @return {Promise} when the task will completed.
   */
  dispatch(id: string, callback: () => void) {
    const promise = this.enqueue(id, callback);

    this.step(id);

    return promise;
  }

}
