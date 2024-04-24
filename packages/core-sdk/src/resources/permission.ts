import { PublicClient, getAddress, Hex, encodeFunctionData } from "viem";

import { handleError } from "../utils/errors";
import { SetPermissionsRequest, SetPermissionsResponse } from "../types/resources/permission";
import { parseToBigInt } from "../utils/utils";
import {
  accessControllerAbi,
  AccessControllerClient,
  IpAccountImplClient,
  SimpleWalletClient,
} from "../abi/generated";

export class PermissionClient {
  private readonly wallet: SimpleWalletClient;
  private readonly rpcClient: PublicClient;
  private accessControllerClient: AccessControllerClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient) {
    this.rpcClient = rpcClient;
    this.wallet = wallet;
    this.accessControllerClient = new AccessControllerClient(this.rpcClient, this.wallet);
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
   * @param request - The request object containing necessary data to set permissions.
   *   @param request.ipAsset The address of the IP account that grants the permission for `signer`
   *   @param request.signer The address that can call `to` on behalf of the `ipAccount`
   *   @param request.to The address that can be called by the `signer` (currently only modules can be `to`)
   *   @param request.func Optional. The function selector string of `to` that can be called by the `signer` on behalf of the `ipAccount`. Be default, it allows all functions.
   *   @param request.permission The new permission level
   * @returns A Promise that resolves to an object containing the transaction hash
   * @emits PermissionSet (ipAccountOwner, ipAccount, signer, to, func, permission)
   */
  public async setPermission(request: SetPermissionsRequest): Promise<SetPermissionsResponse> {
    try {
      const ipAccountClient = new IpAccountImplClient(
        this.rpcClient,
        this.wallet,
        getAddress(request.ipId),
      );

      const txHash = await ipAccountClient.execute({
        to: this.accessControllerClient.address,
        value: parseToBigInt(0),
        data: encodeFunctionData({
          abi: accessControllerAbi,
          functionName: "setPermission",
          args: [
            getAddress(request.ipId), // 0x Address
            getAddress(request.signer), // 0x Address
            getAddress(request.to), // 0x Address
            (request.func || "0x00000000") as Hex, // bytes4
            request.permission, // uint8
          ],
        }),
      });

      if (request.txOptions?.waitForTransaction) {
        await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        return { txHash: txHash, success: true };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to set permissions");
    }
  }
}
