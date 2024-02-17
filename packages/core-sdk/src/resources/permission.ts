import { PublicClient, WalletClient, getAddress, Hex, encodeFunctionData } from "viem";

import { handleError } from "../utils/errors";
import { setPermissionsRequest, setPermissionsResponse } from "../types/resources/permission";
import { IPAccountABI, AccessControllerConfig } from "../abi/config";
import { parseToBigInt, waitTxAndFilterLog } from "../utils/utils";

export class PermissionClient {
  private readonly wallet: WalletClient;
  private readonly rpcClient: PublicClient;

  constructor(rpcClient: PublicClient, wallet: WalletClient) {
    this.rpcClient = rpcClient;
    this.wallet = wallet;
  }

  /**
   * Sets the permission for a specific function call
   * Each policy is represented as a mapping from an IP account address to a signer address to a recipient
   * address to a function selector to a permission level. The permission level can be 0 (ABSTAIN), 1 (ALLOW), or
   * 2 (DENY).
   * By default, all policies are set to 0 (ABSTAIN), which means that the permission is not set.
   * The owner of ipAccount by default has all permission.
   * address(0) => wildcard
   * bytes4(0) => wildcard
   * Specific permission overrides wildcard permission.
   * @param request The request object containing necessary data to set permissions.
   *   @param request.ipAccount The address of the IP account that grants the permission for `signer`
   *   @param request.signer The address that can call `to` on behalf of the `ipAccount`
   *   @param request.to The address that can be called by the `signer` (currently only modules can be `to`)
   *   @param request.func The function selector string of `to` that can be called by the `signer` on behalf of the `ipAccount`
   *   @param request.permission The new permission level
   * @returns A Promise that resolves to an object containing the transaction hash
   * @emits PermissionSet (ipAccountOwner, ipAccount, signer, to, func, permission)
   */
  public async setPermission(request: setPermissionsRequest): Promise<setPermissionsResponse> {
    try {
      const IPAccountConfig = {
        abi: IPAccountABI,
        address: getAddress(request.ipAccount),
      };

      const { request: call } = await this.rpcClient.simulateContract({
        ...IPAccountConfig,
        functionName: "execute",
        args: [
          AccessControllerConfig.address,
          parseToBigInt(0),
          encodeFunctionData({
            abi: AccessControllerConfig.abi,
            functionName: "setPermission",
            args: [
              getAddress(request.ipAccount), // 0x Address
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
          ...AccessControllerConfig,
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
