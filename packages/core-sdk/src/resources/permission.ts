import { PublicClient, encodeFunctionData, Address, toFunctionSelector, WalletClient } from "viem";

import { handleError } from "../utils/errors";
import {
  CreateBatchPermissionSignatureRequest,
  CreateSetPermissionSignatureRequest,
  SetAllPermissionsRequest,
  SetBatchPermissionsRequest,
  SetPermissionsRequest,
  SetPermissionsResponse,
} from "../types/resources/permission";
import {
  accessControllerAbi,
  AccessControllerClient,
  CoreMetadataModuleClient,
  IpAccountImplClient,
  IpAssetRegistryClient,
  SimpleWalletClient,
} from "../abi/generated";
import { chain, getAddress } from "../utils/utils";
import { SupportedChainIds } from "../types/config";
import { defaultFunctionSelector } from "../constants/common";
import { getDeadline, getPermissionSignature } from "../utils/sign";

export class PermissionClient {
  public accessControllerClient: AccessControllerClient;
  public ipAssetRegistryClient: IpAssetRegistryClient;
  public coreMetadataModuleClient: CoreMetadataModuleClient;
  private readonly wallet: SimpleWalletClient;
  private readonly rpcClient: PublicClient;
  private readonly chainId: SupportedChainIds;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, chainId: SupportedChainIds) {
    this.rpcClient = rpcClient;
    this.wallet = wallet;
    this.chainId = chainId;
    this.accessControllerClient = new AccessControllerClient(this.rpcClient, this.wallet);
    this.ipAssetRegistryClient = new IpAssetRegistryClient(this.rpcClient, this.wallet);
    this.coreMetadataModuleClient = new CoreMetadataModuleClient(this.rpcClient, this.wallet);
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
   * @param request - The request object containing necessary data to set `permission`.
   *   @param request.ipId The IP ID that grants the permission for `signer`.
   *   @param request.signer The address that can call `to` on behalf of the `ipAccount`.
   *   @param request.to The address that can be called by the `signer` (currently only modules can be `to`).
   *   @param request.permission The new permission level.
   *   @param request.func [Optional] The function selector string of `to` that can be called by the `signer` on behalf of the `ipAccount`. Be default, it allows all functions.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the transaction hash.
   * @emits PermissionSet (ipAccountOwner, ipAccount, signer, to, func, permission)
   */
  public async setPermission(request: SetPermissionsRequest): Promise<SetPermissionsResponse> {
    try {
      await this.checkIsRegistered(request.ipId);

      const req = {
        ipAccount: request.ipId,
        signer: request.signer,
        to: request.to,
        func: request.func ? toFunctionSelector(request.func) : defaultFunctionSelector,
        permission: request.permission,
      };

      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData: this.accessControllerClient.setPermissionEncode(req) };
      } else {
        const txHash = await this.accessControllerClient.setPermission(req);
        if (request.txOptions?.waitForTransaction) {
          await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          return { txHash: txHash, success: true };
        } else {
          return { txHash: txHash };
        }
      }
    } catch (error) {
      handleError(error, "Failed to set permissions");
    }
  }
  /**
   * Specific permission overrides wildcard permission with signature.
   * @param request - The request object containing necessary data to set permissions.
   *   @param request.ipId The IP ID that grants the permission for `signer`
   *   @param request.signer The address that can call `to` on behalf of the `ipAccount`
   *   @param request.to The address that can be called by the `signer` (currently only modules can be `to`)
   *   @param request.permission The new permission level.
   *   @param request.func [Optional] The function selector string of `to` that can be called by the `signer` on behalf of the `ipAccount`. Be default, it allows all functions.
   *   @param request.deadline [Optional] The deadline for the signature in seconds, default is 1000s.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the transaction hash.
   * @emits PermissionSet (ipAccountOwner, ipAccount, signer, to, func, permission)
   */
  public async createSetPermissionSignature(
    request: CreateSetPermissionSignatureRequest,
  ): Promise<SetPermissionsResponse> {
    try {
      const { ipId, signer, to, txOptions, func, permission, deadline } = request;
      await this.checkIsRegistered(ipId);
      const ipAccountClient = new IpAccountImplClient(this.rpcClient, this.wallet, ipId);
      const data = encodeFunctionData({
        abi: accessControllerAbi,
        functionName: "setPermission",
        args: [
          ipId,
          getAddress(signer, "request.signer"),
          getAddress(to, "request.to"),
          func ? toFunctionSelector(func) : defaultFunctionSelector,
          permission,
        ],
      });
      const { result: state } = await ipAccountClient.state();
      const blockTimestamp = (await this.rpcClient.getBlock()).timestamp;
      const calculatedDeadline = getDeadline(blockTimestamp, deadline);

      const signature = await getPermissionSignature({
        ipId,
        deadline: calculatedDeadline,
        state,
        permissions: [
          {
            ipId,
            signer,
            to,
            permission,
            func,
          },
        ],
        chainId: chain[this.chainId],
        wallet: this.wallet as WalletClient,
      });
      const req = {
        to: getAddress(this.accessControllerClient.address, "accessControllerClientAddress"),
        value: BigInt(0),
        data,
        signer: signer,
        deadline: calculatedDeadline,
        signature,
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData: ipAccountClient.executeWithSigEncode(req) };
      } else {
        const txHash = await ipAccountClient.executeWithSig(req);
        if (request.txOptions?.waitForTransaction) {
          await this.rpcClient.waitForTransactionReceipt({
            ...txOptions,
            hash: txHash,
          });
          return { txHash: txHash, success: true };
        } else {
          return { txHash: txHash };
        }
      }
    } catch (error) {
      handleError(error, "Failed to create set permission signature");
    }
  }
  /**
   * Sets permission to a signer for all functions across all modules.
   * @param request - The request object containing necessary data to set all permissions.
   *   @param request.ipId The IP ID that grants the permission for `signer`
   *   @param request.signer The address of the signer receiving the permissions.
   *   @param request.permission The new permission.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the transaction hash
   * @emits PermissionSet (ipAccountOwner, ipAccount, signer, to, func, permission)
   */
  public async setAllPermissions(
    request: SetAllPermissionsRequest,
  ): Promise<SetPermissionsResponse> {
    try {
      await this.checkIsRegistered(request.ipId);
      const req = {
        ipAccount: request.ipId,
        signer: request.signer,
        permission: request.permission,
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData: this.accessControllerClient.setAllPermissionsEncode(req) };
      } else {
        const txHash = await this.accessControllerClient.setAllPermissions(req);
        if (request.txOptions?.waitForTransaction) {
          await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          return { txHash: txHash, success: true };
        } else {
          return { txHash: txHash };
        }
      }
    } catch (error) {
      handleError(error, "Failed to set all permissions");
    }
  }
  /**
   * Sets a batch of permissions in a single transaction.
   * @param request - The request object containing necessary data to set all permissions.
   * @param {Array} request.permissions - An array of `Permission` structure, each representing the permission to be set.
   *   @param request.permissions[].ipId The IP ID that grants the permission for `signer`.
   *   @param request.permissions[].signer The address that can call `to` on behalf of the `ipAccount`.
   *   @param request.permissions[].to The address that can be called by the `signer` (currently only modules can be `to`).
   *   @param request.permissions[].permission The new permission level.
   *   @param request.permissions[].func [Optional] The function selector string of `to` that can be called by the `signer` on behalf of the `ipAccount`. Be default, it allows all functions.
   *   @param request.deadline [Optional] The deadline for the signature in milliseconds, default is 1000ms.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the transaction hash
   * @emits PermissionSet (ipAccountOwner, ipAccount, signer, to, func, permission)
   */
  public async setBatchPermissions(
    request: SetBatchPermissionsRequest,
  ): Promise<SetPermissionsResponse> {
    try {
      const { permissions, txOptions } = request;
      for (const permission of permissions) {
        await this.checkIsRegistered(permission.ipId);
      }
      const req = {
        permissions: permissions.map((permission) => ({
          ipAccount: permission.ipId,
          signer: permission.signer,
          to: permission.to,
          func: permission.func ? toFunctionSelector(permission.func) : defaultFunctionSelector,
          permission: permission.permission,
        })),
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData: this.accessControllerClient.setBatchPermissionsEncode(req) };
      } else {
        const txHash = await this.accessControllerClient.setBatchPermissions(req);
        if (request.txOptions?.waitForTransaction) {
          await this.rpcClient.waitForTransactionReceipt({
            ...txOptions,
            hash: txHash,
          });
          return { txHash: txHash, success: true };
        } else {
          return { txHash: txHash };
        }
      }
    } catch (error) {
      handleError(error, "Failed to set batch permissions");
    }
  }
  /**
   * Sets a batch of permissions in a single transaction with signature.
   * @param request - The request object containing necessary data to set permissions.
   *   @param request.ipId The IP ID that grants the permission for `signer`
   *   @param {Array} request.permissions - An array of `Permission` structure, each representing the permission to be set.
   *   @param request.permissions[].ipId The IP ID that grants the permission for `signer`.
   *   @param request.permissions[].signer The address that can call `to` on behalf of the `ipAccount`.
   *   @param request.permissions[].to The address that can be called by the `signer` (currently only modules can be `to`).
   *   @param request.permissions[].permission The new permission level.
   *   @param request.permissions[].func [Optional] The function selector string of `to` that can be called by the `signer` on behalf of the `ipAccount`. Be default, it allows all functions.
   *   @param request.deadline [Optional] The deadline for the signature in seconds, default is 1000s.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the transaction hash.
   * @emits PermissionSet (ipAccountOwner, ipAccount, signer, to, func, permission)
   */
  public async createBatchPermissionSignature(
    request: CreateBatchPermissionSignatureRequest,
  ): Promise<SetPermissionsResponse> {
    try {
      const { permissions, deadline, ipId, txOptions } = request;
      for (const permission of permissions) {
        await this.checkIsRegistered(permission.ipId);
      }
      const ipAccountClient = new IpAccountImplClient(this.rpcClient, this.wallet, ipId);
      const data = encodeFunctionData({
        abi: accessControllerAbi,
        functionName: "setBatchPermissions",
        args: [
          permissions.map((permission) => ({
            ipAccount: permission.ipId,
            signer: permission.signer,
            to: permission.to,
            func: permission.func ? toFunctionSelector(permission.func) : defaultFunctionSelector,
            permission: permission.permission,
          })),
        ],
      });
      const { result: state } = await ipAccountClient.state();
      const blockTimestamp = (await this.rpcClient.getBlock()).timestamp;
      const calculatedDeadline = getDeadline(blockTimestamp, deadline);
      const signature = await getPermissionSignature({
        ipId,
        deadline: calculatedDeadline,
        state,
        permissions,
        chainId: chain[this.chainId],
        wallet: this.wallet as WalletClient,
        permissionFunc: "setBatchPermissions",
      });
      const req = {
        to: getAddress(this.accessControllerClient.address, "accessControllerAddress"),
        value: BigInt(0),
        data,
        signer: getAddress(this.wallet.account!.address, "walletAccountAddress"),
        deadline: calculatedDeadline,
        signature,
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData: ipAccountClient.executeWithSigEncode(req) };
      } else {
        const txHash = await ipAccountClient.executeWithSig(req);
        if (request.txOptions?.waitForTransaction) {
          await this.rpcClient.waitForTransactionReceipt({
            ...txOptions,
            hash: txHash,
          });
          return { txHash: txHash, success: true };
        } else {
          return { txHash: txHash };
        }
      }
    } catch (error) {
      handleError(error, "Failed to create batch permission signature");
    }
  }

  private async checkIsRegistered(ipId: Address): Promise<void> {
    const isRegistered = await this.ipAssetRegistryClient.isRegistered({
      id: getAddress(ipId, "ipId"),
    });
    if (!isRegistered) {
      throw new Error(`IP id with ${ipId} is not registered.`);
    }
  }
}
