import _ from 'lodash';
import { Schema } from 'mongoose';

import { AddonBroker } from './addon-broker';
import * as user from './models/user';
import * as pullRequest from './models/pull-request';

export default function setup(options, imports) {

  const mongoose = imports.mongoose;

  const saveHooks = {};
  const extenders = {};

  _.forEach(options.addons, (list, modelName) => {
    _.forEach(list, addon => {
      const m = imports.require(addon);

      if (!saveHooks[modelName]) {
        saveHooks[modelName] = [];
        extenders[modelName] = [];
      }

      m.saveHook && saveHooks[modelName].push(m.saveHook);
      m.extender && extenders[modelName].push(m.extender);
    });
  });

  const addonBroker = new AddonBroker(saveHooks, extenders);

  const setup = function setup(modelName, module) {
    const schema0 = module.setupSchema();
    const schema1 = addonBroker.setupExtenders(modelName, schema0);

    const model = new Schema(schema1);

    module.setupModel(modelName, model);
    addonBroker.setupSaveHooks(modelName, model);

    mongoose.model(modelName, model);
  };

  setup('user', user);
  setup('pull_request', pullRequest);

  const service = {
    get(modelName) {
      return mongoose.model(modelName);
    }
  };

  return service;

}
