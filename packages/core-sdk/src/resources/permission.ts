import { AxiosInstance } from "axios";
import { PublicClient, WalletClient, getAddress, Hex } from "viem";

import { handleError } from "../utils/errors";
import { setPermissionsRequest, setPermissionsResponse } from "../types/resources/permission";
import { waitTxAndFilterLog } from "../utils/utils";
import { PermissionReadOnlyClient } from "./permissionReadOnly";
import { AccessControllerConfig } from "../abi/accessController.abi";

// import { HashZero } from "../constants/common";

export class PermissionClient extends PermissionReadOnlyClient {
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
          getAddress(request.ipAsset), // 0x Address
          getAddress(request.signer), // 0x Address
          getAddress(request.to), // 0x Address
          request.func as Hex, // bytes4
          request.permission, // uint8
        ],
        account: this.wallet.account,
      });

      const txHash = await this.wallet.writeContract(call);
      // TODO: the emit event doesn't return anything
      // if (request.txOptions?.waitForTransaction) {
      //   await waitTxAndFilterLog(this.rpcClient, txHash, {
      //     ...AccessControllerConfig,
      //     eventName: "PermissionSet",
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
