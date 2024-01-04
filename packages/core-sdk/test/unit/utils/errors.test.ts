import { expect } from "chai";
import { handleError } from "../../../src/utils/errors";

describe("Test handleError", function () {
  it("should throw unknown error message when passing in a non-Error error", function () {
    try {
      handleError({}, "abc");
    } catch (error) {
      expect((error as Error).message).to.equal("abc: Unknown error type");
    }
  });

  it("should throw normal error message when passing in aError", function () {
    try {
      handleError(new Error("cde"), "abc");
    } catch (error) {
      expect((error as Error).message).to.equal("abc: cde");
    }
  });
});
