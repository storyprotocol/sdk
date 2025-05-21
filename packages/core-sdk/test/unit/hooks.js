// Restores the default sandbox after every test
const sinon = require("sinon");

exports.mochaHooks = {
  afterEach() {
    sinon.restore();
  },
};
