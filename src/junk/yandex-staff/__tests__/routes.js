import express from 'express';
import request from 'supertest';
import service from '../routes';
import handleError from '../../../services/http/middlewares/handle-error';

import staffMock from '../__mocks__/index';

describe('plugins/yandex-staff/routes', function () {

  let app, options, imports, router;
  let staff, users;

  beforeEach(function () {
    app = express();

    staff = staffMock();

    options = {};
    imports = { 'yandex-staff': staff };

    users = [{ login: 'foo' }, { login: 'bar' }];

    staff.getUsers
      .withArgs('1')
      .returns(Promise.resolve(users));

    staff.apiAbsence
      .withArgs('foo')
      .returns(Promise.resolve({ absence: true }));

    router = service(options, imports);
  });

  beforeEach(function () {
    app.use(handleError());
    app.use('/', router);
  });

  it('should return group members', function (done) {
    request(app)
      .get('/group/1')
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .expect('[{"login":"foo"},{"login":"bar"}]')
      .end(done);
  });

  it('should return absence info for login', function (done) {
    request(app)
      .get('/absence/foo')
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .expect(/{"absence":true}/)
      .end(done);
  });

});
