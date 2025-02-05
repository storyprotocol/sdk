import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { AccessPermission, StoryClient } from "../../src";
import { mockERC721, getStoryClient, getTokenId, aeneid } from "./utils/util";
import { Hex, encodeFunctionData, getAddress, toFunctionSelector } from "viem";
import {
  accessControllerAbi,
  accessControllerAddress,
  coreMetadataModuleAddress,
} from "../../src/abi/generated";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("IPAccount Functions", () => {
  let client: StoryClient;
  let ipId: Hex;
  let data: Hex;
  const coreMetadataModule = coreMetadataModuleAddress[aeneid];
  const permissionAddress = accessControllerAddress[aeneid];

  before(async () => {
    client = getStoryClient();
    const tokenId = await getTokenId();
    const registerResult = await client.ipAsset.register({
      nftContract: mockERC721,
      tokenId: tokenId!,
      txOptions: {
        waitForTransaction: true,
      },
    });
    ipId = registerResult.ipId!;
    data = encodeFunctionData({
      abi: accessControllerAbi,
      functionName: "setPermission",
      args: [
        getAddress(ipId),
        getAddress(process.env.TEST_WALLET_ADDRESS as Hex),
        getAddress(coreMetadataModule),
        toFunctionSelector("function setAll(address,string,bytes32,bytes32)"),
        AccessPermission.ALLOW,
      ],
    });
  });

  describe("execute", () => {
    it("should successfully execute a transaction", async () => {
      const response = await client.ipAccount.execute({
        to: permissionAddress,
        value: 0,
        data,
        ipId: ipId,
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(response.txHash).to.be.a("string").and.not.empty;
    });

    it("should return encoded transaction data when requested", async () => {
      const response = await client.ipAccount.execute({
        to: permissionAddress,
        value: 0,
        data,
        ipId: ipId,
        txOptions: {
          encodedTxDataOnly: true,
        },
      });
      expect(response.encodedTxData).to.exist;
      expect(response.encodedTxData?.data).to.be.a("string").and.not.empty;
    });

    it("should fail with invalid ipId", async () => {
      await expect(
        client.ipAccount.execute({
          to: permissionAddress,
          value: 0,
          data,
          ipId: "0x0000000000000000000000000000000000000000",
          txOptions: {
            waitForTransaction: true,
          },
        }),
      ).to.be.rejected;
    });
  });

  describe("executeWithSig", () => {
    // Using a fixed future deadline for testing
    const FUTURE_DEADLINE = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now
    const EXPIRED_DEADLINE = BigInt(Math.floor(Date.now() / 1000) - 3600); // 1 hour ago

    it("should return encoded transaction data for executeWithSig", async () => {
      const response = await client.ipAccount.executeWithSig({
        to: permissionAddress,
        data,
        ipId: ipId,
        signer: process.env.TEST_WALLET_ADDRESS as Hex,
        deadline: FUTURE_DEADLINE,
        signature: "0x", // Need valid signature
        txOptions: {
          encodedTxDataOnly: true,
        },
      });
      expect(response.encodedTxData).to.exist;
      expect(response.encodedTxData?.data).to.be.a("string").and.not.empty;
    });

    it("should fail with expired deadline", async () => {
      await expect(
        client.ipAccount.executeWithSig({
          to: permissionAddress,
          data,
          ipId: ipId,
          signer: process.env.TEST_WALLET_ADDRESS as Hex,
          deadline: EXPIRED_DEADLINE,
          signature: "0x",
          txOptions: {
            waitForTransaction: true,
          },
        }),
      ).to.be.rejected;
    });
  });

  describe("getIpAccountNonce", () => {
    it("should successfully return account nonce", async () => {
      const response = await client.ipAccount.getIpAccountNonce(ipId);
      expect(response).to.be.a("string").and.not.empty;
    });

    it("should fail with invalid ipId", async () => {
      await expect(client.ipAccount.getIpAccountNonce("0x0000000000000000000000000000000000000000"))
        .to.be.rejected;
    });
  });

  describe("getToken", () => {
    it("should successfully return token information", async () => {
      const response = await client.ipAccount.getToken(ipId);
      expect(response.chainId).to.be.a("bigint");
      expect(response.tokenContract).to.be.a("string").and.not.empty;
      expect(response.tokenId).to.be.a("bigint");
      expect(response.tokenContract).to.equal(mockERC721);
    });

    it("should fail with invalid ipId", async () => {
      await expect(client.ipAccount.getToken("0x0000000000000000000000000000000000000000")).to.be
        .rejected;
    });
  });
});
