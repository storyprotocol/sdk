import chai from "chai";
import { StoryClient, StoryConfig } from "../../../src";
import { Hex, http, Account } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  IPAccountABI,
  getLicensingModuleConfig,
  getPILPolicyFrameworkManagerConfig,
} from "../../config";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const expect = chai.expect;
describe("Test Policy Functions", () => {
  let client: StoryClient;
  let senderAddress: string;

  before(function () {
    const config: StoryConfig = {
      chainId: "storyTestnet",
      transport: http(process.env.STORY_TEST_NET_RPC_PROVIDER_URL),
      account: privateKeyToAccount(process.env.STORY_TEST_NET_WALLET_PRIVATE_KEY as Hex),
    };
    const configAccount: Account = config.account as Account;
    senderAddress = configAccount.address;
    client = StoryClient.newClient(config);
    client.policy.ipAccountABI = IPAccountABI;
    client.policy.licensingModuleConfig = getLicensingModuleConfig("storyTestnet");
    client.policy.pilPolicyFrameworkManagerConfig =
      getPILPolicyFrameworkManagerConfig("storyTestnet");
  });
  describe("Commercial Policy", async function () {
    it.skip("should not throw error when registering Commercial Policy", async () => {
      const response = await expect(
        client.policy.registerPILCommercialUsePolicy({
          commercialRevShare: 100,
          territories: [],
          distributionChannels: [],
          contentRestrictions: [],
          txOptions: {
            waitForTransaction: true,
          },
        }),
      ).to.not.be.rejected;
      console.log(response);
      expect(response.policyId).to.be.a("string").and.not.empty;
    });
  });
});
