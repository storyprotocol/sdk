import { PublicClient, SimulateContractParameters } from "viem";

import { SimpleWalletClient } from "../../abi/generated";

export type SimulateAndWriteContractParams = {
  rpcClient: PublicClient;
  wallet: SimpleWalletClient;
  data: Exclude<SimulateContractParameters, "account">;
};
