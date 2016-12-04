import path from 'path';
import request from 'supertest';
import service from '../';
import loggerMock from '../../logger/__mocks__/';

import indexRoute from '../routes/index';
import staticRoute from '../routes/static';
import resposeJSON from '../response';

describe('services/http', function () {

  let options, imports;

  beforeEach(function () {

    options = {
      routes: {
        '/': 'index',
        '/public': 'bundle'
      },
      middlewares: ['responseJSON']
    };

    const localAssets = path.resolve(__dirname, './assets');

    imports = {
      index: indexRoute({ assets: localAssets }, {}),
      bundle: staticRoute({ assets: localAssets }, {}),
      logger: loggerMock(),
      responseJSON: resposeJSON()
    };

  });

  it('should setup http-server', function (done) {

    options.routes = {};

    service(options, imports)
      .then(app => {
        request(app)
          .get('/')
          .expect('Review Service')
          .expect('Content-Type', /text\/html/)
          .expect(200)
          .end(err => {
            app.shutdown().then(() => done(err), done);
          });
      });

  });

  it('should serve index.html', function (done) {

    service(options, imports)
      .then(app => {
        request(app)
          .get('/')
          .expect('Content-Type', /text\/html/)
          .expect('Content-Length', '103')
          .expect(200)
          .end(err => {
            app.shutdown().then(() => done(err), done);
          });
      })
      .catch(done);

  });

  it('should serve static from /public', function (done) {

    service(options, imports)
      .then(app => {
        request(app)
          .get('/public/1.txt')
          .expect('1.txt\n')
          .end(err => {
            app.shutdown().then(() => done(err), done);
          });
      })
      .catch(done);

  });

  it('should return status 404 if the file is not found in /public', function (done) {

    service(options, imports)
      .then(app => {
        request(app)
          .get('/public/file-does-not-exist')
          .expect(404)
          .end(err => {
            app.shutdown().then(() => done(err), done);
          });
      })
      .catch(done);

  });

  it('should throw an error if route module was not given', function () {
    imports.index = null;

    assert.throws(() => service(options, imports), /cannot.*index/i);
  });

  it('should throw an error if middleware module was not given', function () {
    imports.responseJSON = null;

    assert.throws(() => service(options, imports), /cannot.*responseJSON/i);
  });

});
