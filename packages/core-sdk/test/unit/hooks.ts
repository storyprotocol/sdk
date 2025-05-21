// Restores the default sandbox after every test
import * as sinon from "sinon";
exports.mochaHooks = {
  afterEach() {
    sinon.restore();
  },
};
