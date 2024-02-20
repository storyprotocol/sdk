import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { createPublicClient, http, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import * as dotenv from "dotenv";

dotenv.config();
chai.use(chaiAsPromised);
chai.config.truncateThreshold = 0;

before(async function () {
  if (process.env.USE_TENDERLY !== "true") return;
  console.log(">>>> Using Tenderly for testing <<<<");

  const TEST_CHECKPOINT = "0x024c376000e3bb27344a6d8bbd5b99ee22c84eb9beefdfc3caa7bb367869dc09";
  const client = createPublicClient({
    chain: {
      id: 11155111,
      name: "Tenderly",
      network: "paris",
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: {
        default: {
          http: [process.env.RPC_PROVIDER_URL!],
        },
        public: {
          http: [process.env.RPC_PROVIDER_URL!],
        },
      },
    },
    transport: http(),
  });

  // @ts-ignore
  await client.request({ method: "evm_revert", params: [TEST_CHECKPOINT] });

  // To create a checkpoint, we must use the private, unlocked RPC URL on Tenderly TestNet. Same for funding below.
  // @ts-ignore
  const checkpoint = (await client.request({ method: "evm_snapshot", params: [] })) as string;
  console.log("Checkpoint created:", checkpoint);

  // Fund the test account, if it's new, since checkpointed state might not have balance for the test account.
  const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as Hex);
  const fundAmount = "0x3635C9ADC5DEA00000"; // 1000 ether in wei hex
  // @ts-ignore
  await client.request({ method: "tenderly_addBalance", params: [account.address, fundAmount] });
});
