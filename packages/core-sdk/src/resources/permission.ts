import { PublicClient, WalletClient, getAddress, Hex, encodeFunctionData } from "viem";

import { handleError } from "../utils/errors";
import { setPermissionsRequest, setPermissionsResponse } from "../types/resources/permission";
import { IPAccountABI, AccessControllerConfig } from "../abi/config";
import { parseToBigInt, waitTxAndFilterLog } from "../utils/utils";

export class PermissionClient {
  private readonly wallet: WalletClient;
  private readonly rpcClient: PublicClient;
  public ipAccountABI = IPAccountABI;
  public accessControllerConfig = AccessControllerConfig;

  constructor(rpcClient: PublicClient, wallet: WalletClient) {
    this.rpcClient = rpcClient;
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
      const IPAccountConfig = {
        abi: this.ipAccountABI,
        address: getAddress(request.ipAsset),
      };

      const { request: call } = await this.rpcClient.simulateContract({
        ...IPAccountConfig,
        functionName: "execute",
        args: [
          this.accessControllerConfig.address,
          parseToBigInt(0),
          encodeFunctionData({
            abi: this.accessControllerConfig.abi,
            functionName: "setPermission",
            args: [
              getAddress(request.ipAsset), // 0x Address
              getAddress(request.signer), // 0x Address
              getAddress(request.to), // 0x Address
              request.func as Hex, // bytes4
              request.permission, // uint8
            ],
          }),
        ],
        account: this.wallet.account,
      });

      const txHash = await this.wallet.writeContract(call);

      if (request.txOptions?.waitForTransaction) {
        await waitTxAndFilterLog(this.rpcClient, txHash, {
          ...this.accessControllerConfig,
          eventName: "PermissionSet",
        });
        return { txHash: txHash, success: true };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to set permissions");
    }
  }
}
