import { Address, encodeFunctionData, PublicClient, toFunctionSelector, WalletClient } from "viem";

import {
  accessControllerAbi,
  AccessControllerClient,
  CoreMetadataModuleClient,
  IpAccountImplClient,
  IpAssetRegistryClient,
  SimpleWalletClient,
} from "../abi/generated";
import { defaultFunctionSelector } from "../constants/common";
import { ChainIds } from "../types/config";
import {
  CreateBatchPermissionSignatureRequest,
  CreateSetPermissionSignatureRequest,
  SetAllPermissionsRequest,
  SetBatchPermissionsRequest,
  SetPermissionsRequest,
  SetPermissionsResponse,
} from "../types/resources/permission";
import { handleError } from "../utils/errors";
import { getDeadline, getPermissionSignature } from "../utils/sign";
import { validateAddress } from "../utils/utils";

export class PermissionClient {
  public accessControllerClient: AccessControllerClient;
  public ipAssetRegistryClient: IpAssetRegistryClient;
  public coreMetadataModuleClient: CoreMetadataModuleClient;
  private readonly wallet: SimpleWalletClient;
  private readonly rpcClient: PublicClient;
  private readonly chainId: ChainIds;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, chainId: ChainIds) {
    this.rpcClient = rpcClient;
    this.wallet = wallet;
    this.chainId = chainId;
    this.accessControllerClient = new AccessControllerClient(this.rpcClient, this.wallet);
    this.ipAssetRegistryClient = new IpAssetRegistryClient(this.rpcClient, this.wallet);
    this.coreMetadataModuleClient = new CoreMetadataModuleClient(this.rpcClient, this.wallet);
  }

  /**
   * Sets the permission for a specific function call.
   * Each policy is represented as a mapping from an IP account address to a signer address to a recipient
   * address to a function selector to a permission level. The permission level is an enum of `AccessPermission`.
   * By default, all policies are set to ABSTAIN, which means that the permission is not set.
   * The owner of ipAccount by default has all permission.
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/access/IAccessController.sol#L13 | `PermissionSet`} event.
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

      const txHash = await this.accessControllerClient.setPermission(req);
      await this.rpcClient.waitForTransactionReceipt({
        ...request.txOptions,
        hash: txHash,
      });
      return { txHash: txHash, success: true };
    } catch (error) {
      return handleError(error, "Failed to set permissions");
    }
  }

  /**
   * Specific permission overrides wildcard permission with signature.
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/access/IAccessController.sol#L13 | `PermissionSet`} event.
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
        functionName: "setTransientPermission",
        args: [
          ipId,
          validateAddress(signer),
          validateAddress(to),
          func ? toFunctionSelector(func) : defaultFunctionSelector,
          permission,
        ],
      });
      const { result: state } = await ipAccountClient.state();
      const blockTimestamp = (await this.rpcClient.getBlock()).timestamp;
      const calculatedDeadline = getDeadline(blockTimestamp, deadline);

      const { signature } = await getPermissionSignature({
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
        chainId: this.chainId,
        wallet: this.wallet as WalletClient,
      });
      const req = {
        to: validateAddress(this.accessControllerClient.address),
        value: BigInt(0),
        data,
        signer: signer,
        deadline: calculatedDeadline,
        signature,
      };
      const txHash = await ipAccountClient.executeWithSig(req);
      await this.rpcClient.waitForTransactionReceipt({
        ...txOptions,
        hash: txHash,
      });
      return { txHash: txHash, success: true };
    } catch (error) {
      return handleError(error, "Failed to create set permission signature");
    }
  }

  /**
   * Sets permission to a signer for all functions across all modules.
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/access/IAccessController.sol#L13 | `PermissionSet`} event.
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
      const txHash = await this.accessControllerClient.setAllPermissions(req);
      await this.rpcClient.waitForTransactionReceipt({
        ...request.txOptions,
        hash: txHash,
      });
      return { txHash: txHash, success: true };
    } catch (error) {
      return handleError(error, "Failed to set all permissions");
    }
  }

  /**
   * Sets a batch of permissions in a single transaction.
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/access/IAccessController.sol#L13 | `PermissionSet`} event.
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
      const txHash = await this.accessControllerClient.setBatchPermissions(req);
      await this.rpcClient.waitForTransactionReceipt({
        ...txOptions,
        hash: txHash,
      });
      return { txHash: txHash, success: true };
    } catch (error) {
      return handleError(error, "Failed to set batch permissions");
    }
  }

  /**
   * Sets a batch of permissions in a single transaction with signature.
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/access/IAccessController.sol#L13 | `PermissionSet`} event.
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
        functionName: "setBatchTransientPermissions",
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
      const { signature } = await getPermissionSignature({
        ipId,
        deadline: calculatedDeadline,
        state,
        permissions,
        chainId: this.chainId,
        wallet: this.wallet as WalletClient,
      });
      const req = {
        to: validateAddress(this.accessControllerClient.address),
        value: BigInt(0),
        data,
        signer: validateAddress(this.wallet.account!.address),
        deadline: calculatedDeadline,
        signature,
      };
      const txHash = await ipAccountClient.executeWithSig(req);
      await this.rpcClient.waitForTransactionReceipt({
        ...txOptions,
        hash: txHash,
      });
      return { txHash: txHash, success: true };
    } catch (error) {
      return handleError(error, "Failed to create batch permission signature");
    }
  }

  private async checkIsRegistered(ipId: Address): Promise<void> {
    const isRegistered = await this.ipAssetRegistryClient.isRegistered({
      id: validateAddress(ipId),
    });
    if (!isRegistered) {
      throw new Error(`IP id with ${ipId} is not registered.`);
    }
  }
}
