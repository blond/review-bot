import service from '../routes';

describe('services/badge-constructor', function () {

  it('should install badge middlewere', function () {
    const options = { template: 'flat' };
    const imports = {};

    const router = service(options, imports);

    assert.isFunction(router);
  });

});
