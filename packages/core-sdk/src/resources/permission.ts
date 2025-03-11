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
import { defaultFunctionSelector } from "../constants/common";
import { getDeadline, getPermissionSignature } from "../utils/sign";
import { ChainIds } from "../types/config";

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
   * Emits an on-chain `PermissionSet` event.
   * @see {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/access/IAccessController.sol#L13 | IAccessController}
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
   * Emits an on-chain `PermissionSet` event.
   * @see {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/access/IAccessController.sol#L13 | IAccessController}
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
          getAddress(signer, "request.signer"),
          getAddress(to, "request.to"),
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
   * Emits an on-chain `PermissionSet` event.
   * @see {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/access/IAccessController.sol#L13 | IAccessController}
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
   * Emits an on-chain `PermissionSet` event.
   * @see {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/access/IAccessController.sol#L13 | IAccessController}
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
   * Emits an on-chain `PermissionSet` event.
   * @see {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/access/IAccessController.sol#L13 | IAccessController}
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
        chainId: chain[this.chainId],
        wallet: this.wallet as WalletClient,
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
