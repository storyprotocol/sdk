import { PublicClient, getAddress, Hex, encodeFunctionData, Address } from "viem";

import { handleError } from "../utils/errors";
import {
  SetAllPermissionsRequest,
  SetPermissionsRequest,
  SetPermissionsResponse,
} from "../types/resources/permission";
import {
  accessControllerAbi,
  AccessControllerClient,
  IpAccountImplClient,
  IpAssetRegistryClient,
  SimpleWalletClient,
} from "../abi/generated";

export class PermissionClient {
  public accessControllerClient: AccessControllerClient;
  public ipAssetRegistryClient: IpAssetRegistryClient;
  private readonly wallet: SimpleWalletClient;
  private readonly rpcClient: PublicClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient) {
    this.rpcClient = rpcClient;
    this.wallet = wallet;
    this.accessControllerClient = new AccessControllerClient(this.rpcClient, this.wallet);
    this.ipAssetRegistryClient = new IpAssetRegistryClient(this.rpcClient, this.wallet);
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
   *   @param request.ipId The IP ID that grants the permission for `signer`
   *   @param request.signer The address that can call `to` on behalf of the `ipAccount`
   *   @param request.to The address that can be called by the `signer` (currently only modules can be `to`)
   *   @param request.func Optional. The function selector string of `to` that can be called by the `signer` on behalf of the `ipAccount`. Be default, it allows all functions.
   *   @param request.permission The new permission level
   * @returns A Promise that resolves to an object containing the transaction hash
   * @emits PermissionSet (ipAccountOwner, ipAccount, signer, to, func, permission)
   */
  public async setPermission(request: SetPermissionsRequest): Promise<SetPermissionsResponse> {
    try {
      await this.checkIsRegistered(request.ipId);
      const ipAccountClient = new IpAccountImplClient(
        this.rpcClient,
        this.wallet,
        getAddress(request.ipId),
      );

      const txHash = await ipAccountClient.execute({
        to: this.accessControllerClient.address,
        value: BigInt(0),
        data: encodeFunctionData({
          abi: accessControllerAbi,
          functionName: "setPermission",
          args: [
            getAddress(request.ipId),
            getAddress(request.signer),
            getAddress(request.to),
            (request.func || "0x00000000") as Hex,
            request.permission,
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

  /**
   * Sets permission to a signer for all functions across all modules.
   * @param request - The request object containing necessary data to set all permissions.
   *  @param request.ipId The IP ID that grants the permission for `signer`
   *  @param request.signer The address of the signer receiving the permissions.
   *  @param request.permission The new permission.
   * @returns A Promise that resolves to an object containing the transaction hash
   * @emits PermissionSet (ipAccountOwner, ipAccount, signer, to, func, permission)
   */
  public async setAllPermissions(
    request: SetAllPermissionsRequest,
  ): Promise<SetPermissionsResponse> {
    try {
      await this.checkIsRegistered(request.ipId);
      const ipAccountClient = new IpAccountImplClient(
        this.rpcClient,
        this.wallet,
        getAddress(request.ipId),
      );

      const txHash = await ipAccountClient.execute({
        to: this.accessControllerClient.address,
        value: BigInt(0),
        data: encodeFunctionData({
          abi: accessControllerAbi,
          functionName: "setAllPermissions",
          args: [getAddress(request.ipId), getAddress(request.signer), request.permission],
        }),
      });

      if (request.txOptions?.waitForTransaction) {
        await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        return { txHash: txHash, success: true };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to set all permissions");
    }
  }

  private async checkIsRegistered(ipId: Address): Promise<void> {
    const isRegistered = await this.ipAssetRegistryClient.isRegistered({ id: getAddress(ipId) });
    if (!isRegistered) {
      throw new Error("IP is not registered.");
    }
  }
}
