import {
  PublicClient,
  getAddress,
  Hex,
  encodeFunctionData,
  Address,
  LocalAccount,
  toFunctionSelector,
} from "viem";

import { handleError } from "../utils/errors";
import {
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
  SpgClient,
} from "../abi/generated";
import { chain } from "../utils/utils";
import { SupportedChainIds } from "../types/config";
import { defaultFunctionSelector } from "../constants/common";

export class PermissionClient {
  public accessControllerClient: AccessControllerClient;
  public ipAssetRegistryClient: IpAssetRegistryClient;
  public spgClient: SpgClient;
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
    this.spgClient = new SpgClient(this.rpcClient, this.wallet);
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
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash.
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
            request.func ? toFunctionSelector(request.func) : defaultFunctionSelector,
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
   * Specific permission overrides wildcard permission with signature.
   * @param request - The request object containing necessary data to set permissions.
   *   @param request.ipId The IP ID that grants the permission for `signer`
   *   @param request.signer The address that can call `to` on behalf of the `ipAccount`
   *   @param request.to The address that can be called by the `signer` (currently only modules can be `to`)
   *   @param request.permission The new permission level.
   *   @param request.func [Optional] The function selector string of `to` that can be called by the `signer` on behalf of the `ipAccount`. Be default, it allows all functions.
   *   @param request.deadline [Optional] The deadline for the signature in milliseconds,default is 1000ms.
   *   @param request.txOptions [Optional] The transaction options.
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
      const nonce = (await ipAccountClient.state()) + 1n;
      const data = encodeFunctionData({
        abi: accessControllerAbi,
        functionName: "setPermission",
        args: [
          ipId,
          getAddress(signer),
          getAddress(to),
          func ? toFunctionSelector(func) : defaultFunctionSelector,
          permission,
        ],
      });
      const calculatedDeadline = this.getDeadline(deadline);
      const signature = await this.getPermissionSignature({
        ipId,
        deadline: calculatedDeadline,
        nonce,
        data,
      });
      const txHash = await ipAccountClient.executeWithSig({
        to: getAddress(this.accessControllerClient.address),
        value: BigInt(0),
        data,
        signer: signer,
        deadline: calculatedDeadline,
        signature,
      });

      if (txOptions?.waitForTransaction) {
        await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        return { txHash: txHash, success: true };
      } else {
        return { txHash: txHash };
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
   *   @param request.txOptions [Optional] The transaction options.
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
  /**
   * Sets a batch of permissions in a single transaction.
   * @param request - The request object containing necessary data to set all permissions.
   * @param {Array} request.permissions - An array of `Permission` structure, each representing the permission to be set.
   *   @param request.permissions[].ipId The IP ID that grants the permission for `signer`.
   *   @param request.permissions[].signer The address that can call `to` on behalf of the `ipAccount`.
   *   @param request.permissions[].to The address that can be called by the `signer` (currently only modules can be `to`).
   *   @param request.permissions[].permission The new permission level.
   *   @param request.permissions[].func [Optional] The function selector string of `to` that can be called by the `signer` on behalf of the `ipAccount`. Be default, it allows all functions.
   *   @param request.txOptions [Optional] The transaction options.
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
      const txHash = await this.accessControllerClient.setBatchPermissions({
        permissions: permissions.map((permission) => ({
          ipAccount: permission.ipId,
          signer: permission.signer,
          to: permission.to,
          func: permission.func ? toFunctionSelector(permission.func) : defaultFunctionSelector,
          permission: permission.permission,
        })),
      });
      if (txOptions?.waitForTransaction) {
        await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        return { txHash: txHash, success: true };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to set batch permissions");
    }
  }
  private async checkIsRegistered(ipId: Address): Promise<void> {
    const isRegistered = await this.ipAssetRegistryClient.isRegistered({ id: getAddress(ipId) });
    if (!isRegistered) {
      throw new Error(`IP id with ${ipId} is not registered.`);
    }
  }
  private getPermissionSignature = async (params: {
    ipId: Address;
    nonce: bigint;
    deadline: bigint;
    data: Hex;
  }): Promise<Hex> => {
    const { ipId, deadline, nonce, data } = params;
    const account = this.wallet.account as LocalAccount;
    if (!account.signTypedData) {
      throw new Error("The account does not support signTypedData, Please use a local account.");
    }
    return await account.signTypedData({
      domain: {
        name: "Story Protocol IP Account",
        version: "1",
        chainId: Number(chain[this.chainId]),
        verifyingContract: ipId,
      },
      types: {
        Execute: [
          { name: "to", type: "address" },
          { name: "value", type: "uint256" },
          { name: "data", type: "bytes" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      },
      primaryType: "Execute",
      message: {
        to: getAddress(this.accessControllerClient.address),
        value: BigInt(0),
        data,
        nonce,
        deadline,
      },
    });
  };

  private getDeadline = (deadline?: bigint | number | string): bigint => {
    if (deadline && (isNaN(Number(deadline)) || BigInt(deadline) < 0n)) {
      throw new Error("Invalid deadline value.");
    }
    const timestamp = BigInt(Date.now());
    return deadline ? timestamp + BigInt(deadline) : timestamp + 1000n;
  };
}
