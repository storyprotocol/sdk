import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { StoryClient } from "../../src";
import { MockERC721, getStoryClientInSepolia, getTokenId } from "./util";
import { Hex, encodeFunctionData, getAddress, zeroAddress } from "viem";
import { accessControllerAbi, accessControllerAddress } from "../../src/abi/generated";
import { privateKeyToAccount } from "viem/accounts";
chai.use(chaiAsPromised);
const expect = chai.expect;
const sepoliaChainId = BigInt(11155111);

describe("Ip Account functions", () => {
  let client: StoryClient;
  let ipId: Hex;
  let data: Hex;

  before(async function () {
    client = getStoryClientInSepolia();
    const tokenId = await getTokenId();
    const registerResult = await client.ipAsset.register({
      tokenContract: MockERC721,
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
        getAddress("0x2ac240293f12032E103458451dE8A8096c5A72E8"),
        "0x00000000" as Hex,
        1,
      ],
    });
  });

  describe("Execute ipAccount", async function () {
    it("should not throw error when execute", async () => {
      const response = await client.ipAccount.execute({
        to: accessControllerAddress[11155111],
        value: 0,
        data,
        accountAddress: ipId,
      });
      expect(response.txHash).to.be.a("string").and.not.empty;
    });
  });

  describe.skip("Execute with sig", async function () {
    // collect signature and help other execute method
    it("should not throw error when executeWithSig setting permission", async () => {
      const account = privateKeyToAccount(process.env.SEPOLIA_TEST_WALLET_PRIVATE_KEY as Hex);

      const signature = await account.signTypedData({
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
          ],
          ExecuteWithSig: [
            { name: "accountAddress", type: "address" },
            { name: "value", type: "uint256" },
            { name: "to", type: "address" },
            { name: "data", type: "bytes" },
            { name: "deadline", type: "uint256" },
          ],
        },
        primaryType: "ExecuteWithSig",
        domain: {
          name: "sepolia",
          chainId: sepoliaChainId,
          verifyingContract: client.ipAsset.ipAssetRegistryClient.address,
        },
        message: {
          accountAddress: ipId,
          value: BigInt(0),
          to: client.ipAsset.ipAssetRegistryClient.address,
          data: data,
          deadline: BigInt(111),
        },
      });
      const waitForTransaction: boolean = true;
      const response = await expect(
        client.ipAccount.executeWithSig({
          accountAddress: ipId,
          value: 0,
          to: client.ipAsset.ipAssetRegistryClient.address,
          data: data,
          deadline: 111,
          signer: process.env.SEPOLIA_TEST_WALLET_ADDRESS as Hex,
          signature: signature,
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;
    });
  });
});
