import { Schema } from 'mongoose';

const Transport = new Schema({
  id: String,
  username: String
});

export function setupSchema() {
  return {
    _id: String,
    login: String,
    html_url: String,
    avatar_url: String,
    transports: {
      type: [Transport],
      'default': []
    }
  };
}

export function setupModel(modelName, model) {

  /**
   * Set mongo id the same as user login
   *
   * @param {String} login - user login.
   *
   * @return {String}
   */
  model.path('login').set(function (login) {
    this._id = login;

    return login;
  });

  model.methods.getNotificationTransport = function () {
    return this.transports || [];
  };

  /**
   * Find user by login
   *
   * @param {String} login
   *
   * @return {Promise}
   */
  model.statics.findByLogin = function (login) {
    return this
      .model(modelName)
      .findById(login);
  };

}
