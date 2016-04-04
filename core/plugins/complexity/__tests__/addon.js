import * as addon from '../addon';

describe('plugins/complexity/addon', function () {

  describe('#extender', function () {

    it('should return schema object', function () {

      assert.isObject(addon.extender());
      assert.property(addon.extender(), 'complexity');
      assert.deepPropertyVal(addon.extender(), 'complexity.type', Number);

    });

  });

  describe('#saveHook', function () {

    it('should calculate pull request complexity', function (done) {
      const model = {
        additions: 144,
        deletions: 255,
        commits: 1
      };

      addon.saveHook(model)
        .then(() => {
          assert.property(model, 'complexity');
          assert.isAbove(model.complexity, 0);
          done();
        })
        .catch(done);
    });

  });

});
