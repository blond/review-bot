import fs from 'fs';
import path from 'path';
import _ from 'lodash';

/**
 * Return parsed json file if the file exists.
 * Otherwise return an empty object.
 *
 * @param {String} configPath
 * @return {Object}
 */
const requireIfExists = function (configPath) {
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath));
  }

  return {};
};

export function transform(basePath, json) {

  const visit = function (context) {
    if (_.isArray(context)) {
      return _.map(context, visit);
    }

    if (_.isPlainObject(context)) {
      const addons = [];
      const newObj = _(context)
        .mapValues((v, k) => {
          if (k.substr(0, 9) === '#include:') {
            const includePath = path.join(basePath, v);
            const includeContent = requireIfExists(includePath);
            addons.push(visit(includeContent));

            return null;
          } else {
            return visit(v);
          }
        })
        .omitBy(_.isNull)
        .value();

      return _.merge.apply(_, [newObj].concat(addons));
    }

    return context;
  };

  return visit(json);

}

export default function config(basePath, envName) {

  envName = envName || process.env.NODE_ENV || 'development';
  basePath = path.join(basePath, 'config');

  const join = path.join.bind(path, basePath);

  const envConfigPath = join(envName + '.json');
  const envConfigRaw = requireIfExists(envConfigPath);
  const envConfig = transform(basePath, envConfigRaw);

  const secretConfigPath = join('secret.json');
  const secretConfigRaw = requireIfExists(secretConfigPath);
  const secretConfig = transform(basePath, secretConfigRaw);

  const defaultConfigPath = join('default.json');
  const defaultConfigRaw = requireIfExists(defaultConfigPath);
  const defaultConfig = transform(basePath, defaultConfigRaw);


  return _.merge({ env: envName }, defaultConfig, secretConfig, envConfig);

}
