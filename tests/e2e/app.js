import path from 'path';
import Architect from 'node-architect';
import { isArray, mergeWith } from 'lodash';

export function withApp(test, config, done) {
  const application = new Architect(config, path.resolve('.'));

  application
    .execute()
    .then(test)
    .then(application.shutdown.bind(application))
    .then(done, done);
}

export function merge(object, sources) {
  return mergeWith(object, sources, function (objValue, srcValue) {
    if (isArray(objValue)) {
      return objValue.concat(srcValue);
    }
  });
}
