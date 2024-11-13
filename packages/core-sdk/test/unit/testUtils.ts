import sinon from "sinon";

export function createMock<T>(obj = {}): T {
  const mockObj: any = obj;
  mockObj.waitForTransactionReceipt = sinon.stub().resolves({});
  mockObj.address = "0x73fcb515cee99e4991465ef586cfe2b072ebb512";
  mockObj.multicall = sinon.stub().returns([{ error: "", status: "success" }]);
  mockObj.getBlock = sinon.stub().resolves({ timestamp: 1629820800n });
  return mockObj;
}
