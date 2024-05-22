import sinon from "sinon";

export function createMock<T>(obj = {}): T {
  const mockObj: any = obj;
  mockObj.waitForTransactionReceipt = sinon.stub().resolves({});
  mockObj.address = "0x73fcb515cee99e4991465ef586cfe2b072ebb512";
  return mockObj;
}
