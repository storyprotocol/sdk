import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { createPublicClient, http } from "viem";
import * as dotenv from "dotenv";

dotenv.config();
chai.use(chaiAsPromised);
chai.config.truncateThreshold = 0;

before(async function () {
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

  // @ts-ignore
  const checkpoint = (await client.request({ method: "evm_snapshot", params: [] })) as string;
  console.log("Checkpoint created:", checkpoint);
});
