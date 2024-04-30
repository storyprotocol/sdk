import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { StoryClient } from "../../src";
import { MockERC721, getStoryClientInSepolia, getTokenId } from "./util";
import { Hex, encodeFunctionData } from "viem";
import { ipAssetRegistryAbi } from "../../src/abi/generated";
import { privateKeyToAccount } from "viem/accounts";
chai.use(chaiAsPromised);
const expect = chai.expect;
const sepoliaChainId = BigInt(11155111);
describe.skip("Ip Account functions", () => {
  let client: StoryClient;
  let ipId: Hex;
  let data: Hex;

  before(async function () {
    client = getStoryClientInSepolia();
    const waitForTransaction: boolean = true;
    const tokenId = await getTokenId();
    const registerResponse = await client.ipAsset.register({
      tokenContract: MockERC721,
      tokenId: "1",
      txOptions: {
        waitForTransaction: waitForTransaction,
      },
    });
    ipId = registerResponse.ipId!;
    data = encodeFunctionData({
      abi: ipAssetRegistryAbi,
      functionName: "register",
      args: [sepoliaChainId, MockERC721, BigInt(tokenId!)],
    });
  });

  describe.skip("Execute ipAccount", async function () {
    it("should not throw error when execute", async () => {
      const response = await client.ipAccount.execute({
        accountAddress: ipId,
        value: 0,
        to: client.ipAsset.ipAssetRegistryClient.address,
        data: data,
        txOptions: {
          waitForTransaction: true,
        },
      });
      console.log("response", response);
      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.empty;
    });
  });

  describe("Execute with sig", async function () {
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
