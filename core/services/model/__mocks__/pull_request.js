export default function mock() {

  const pull = {};

  const promise = Promise.resolve(pull);

  pull.get = sinon.stub();
  pull.set = sinon.stub().returnsThis();
  pull.save = sinon.stub().returns(promise);

  return pull;

}
