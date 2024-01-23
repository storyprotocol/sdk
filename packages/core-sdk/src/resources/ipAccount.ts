import { AxiosInstance } from "axios";
import { PublicClient, WalletClient } from "viem";

// import { handleError } from "../utils/errors";
import { IPAccountReadOnlyClient } from "./ipAccountReadOnly";
// import { ipAccountRegistryAbi } from "../abi/ipAccountRegistry.abi";
// import { parseToBigInt, waitTxAndFilterLog, typedDataArrayToBytesArray } from "../utils/utils";
// import { HashZero } from "../constants/common";

export class IPAccountClient extends IPAccountReadOnlyClient {
  private readonly wallet: WalletClient;

  constructor(httpClient: AxiosInstance, rpcClient: PublicClient, wallet: WalletClient) {
    super(httpClient, rpcClient);
    this.wallet = wallet;
  }

  public async getIpId() {}

  public async registerRootIp() {}

  public async registerDerivativeIp() {}

  public async createPolicy() {}

  public async addPolicyToIp() {}
}
