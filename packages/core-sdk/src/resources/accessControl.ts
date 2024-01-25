import { AxiosInstance } from "axios";
import { PublicClient, WalletClient, getAddress } from "viem";

import { handleError } from "../utils/errors";
import { setPermissionsRequest, setPermissionsResponse } from "../types/resources/accessControl";
// import { parseToBigInt, waitTxAndFilterLog } from "../utils/utils";
import { AccessControlReadOnlyClient } from "./accessControlReadOnly";
import { AccessControllerConfig } from "../abi/accessController.abi";
// import { HashZero } from "../constants/common";

export class AccessControlClient extends AccessControlReadOnlyClient {
  private readonly wallet: WalletClient;

  constructor(httpClient: AxiosInstance, rpcClient: PublicClient, wallet: WalletClient) {
    super(httpClient, rpcClient);
    this.wallet = wallet;
  }

  /**
   * Set Permission based on the specified input
   *
   * @param request - the request object that contains all data needed to set permission.
   * @returns the response object that contains results from the set permission.
   */
  public async setPermission(request: setPermissionsRequest): Promise<setPermissionsResponse> {
    try {
      const { request: call } = await this.rpcClient.simulateContract({
        ...AccessControllerConfig,
        functionName: "setPermission",
        args: [
          getAddress(request.ipAccount), // 0x Address
          getAddress(request.signer), // 0x Address
          getAddress(request.to), // 0x Address
          getAddress(request.func), // bytes4
          request.permission, // uint8
        ],
      });

      const txHash = await this.wallet.writeContract(call);
      // if (request.txOptions?.waitForTransaction) {
      //   const targetLog = await waitTxAndFilterLog(this.rpcClient, txHash, {
      //     ...IPAccountRegistryConfig,
      //     eventName: "IPAccountRegistered",
      //   });
      //   return { txHash: txHash };
      // } else {
      return { txHash: txHash };
      // }
    } catch (error) {
      handleError(error, "Failed to set permissions");
    }
  }
}
