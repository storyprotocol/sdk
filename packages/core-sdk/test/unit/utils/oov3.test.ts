import { expect } from "chai";
import { getAssertionDetails, getOov3Contract } from "../../../src/utils/oov3";
import { createMock } from "../testUtils";
import { PublicClient } from "viem";
import { ArbitrationPolicyUmaClient } from "../../../src/abi/generated";
import { mockAddress } from "../mockData";
import * as sinon from "sinon";

describe("oov3", () => {
  let rpcClient: PublicClient;
  beforeEach(() => {
    rpcClient = createMock<PublicClient>();
  });
  it("should get assertion details", async () => {
    rpcClient.readContract = sinon.stub().resolves({
      bond: 1n,
    });
    const arbitrationPolicyUmaClient = createMock<ArbitrationPolicyUmaClient>();
    arbitrationPolicyUmaClient.oov3 = sinon.stub().resolves(mockAddress);
    const assertionDetails = await getAssertionDetails(
      rpcClient,
      arbitrationPolicyUmaClient,
      mockAddress,
    );
    expect(assertionDetails).to.equal(1n);
  });

  it("should get oov3 contract address", async () => {
    const arbitrationPolicyUmaClient = createMock<ArbitrationPolicyUmaClient>();
    arbitrationPolicyUmaClient.oov3 = sinon.stub().resolves(mockAddress);
    const oov3Contract = await getOov3Contract(arbitrationPolicyUmaClient);
    expect(oov3Contract).to.equal(mockAddress);
  });
});
