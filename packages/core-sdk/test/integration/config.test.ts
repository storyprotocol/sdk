import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import * as dotenv from "dotenv";

dotenv.config();
chai.use(chaiAsPromised);
chai.config.truncateThreshold = 0;

before(async function () {
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
  (await client.request({
    method: "evm_revert",
    params: [process.env.TEST_CHECKPOINT!],
  })) as string;

  // @ts-ignore
  const checkpoint = (await client.request({ method: "evm_snapshot", params: [] })) as string;
  console.log("Checkpoint created:", checkpoint);
});
