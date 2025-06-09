// Restores the default sandbox after every test
import * as sinon from "sinon";

export const mochaHooks = {
  afterEach(): void {
    sinon.restore();
  },
};
