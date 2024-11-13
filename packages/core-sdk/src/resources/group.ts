import { PublicClient, WalletClient, toHex, zeroHash } from "viem";

import {
  CoreMetadataModuleClient,
  GroupingModuleClient,
  GroupingModuleEventClient,
  GroupingModuleRegisterGroupRequest,
  GroupingWorkflowsClient,
  GroupingWorkflowsMintAndRegisterIpAndAttachLicenseAndAddToGroupRequest,
  GroupingWorkflowsRegisterGroupAndAttachLicenseAndAddIpsRequest,
  GroupingWorkflowsRegisterIpAndAttachLicenseAndAddToGroupRequest,
  IpAccountImplClient,
  IpAssetRegistryClient,
  LicenseRegistryReadOnlyClient,
  LicenseTokenReadOnlyClient,
  LicensingModuleClient,
  PiLicenseTemplateClient,
  SimpleWalletClient,
} from "../abi/generated";
import { AccessPermission } from "../types/resources/permission";
import { handleError } from "../utils/errors";
import { getPermissionSignature, getDeadline } from "../utils/sign";
import { chain, getAddress } from "../utils/utils";
import { SupportedChainIds } from "../types/config";
import {
  MintAndRegisterIpAndAttachLicenseAndAddToGroupRequest,
  MintAndRegisterIpAndAttachLicenseAndAddToGroupResponse,
  RegisterGroupAndAttachLicenseAndAddIpsRequest,
  RegisterGroupAndAttachLicenseAndAddIpsResponse,
  RegisterGroupAndAttachLicenseRequest,
  RegisterGroupAndAttachLicenseResponse,
  RegisterGroupRequest,
  RegisterGroupResponse,
  RegisterIpAndAttachLicenseAndAddToGroupRequest,
  RegisterIpAndAttachLicenseAndAddToGroupResponse,
} from "../types/resources/group";

export class GroupClient {
  public groupingWorkflowsClient: GroupingWorkflowsClient;
  public groupingModuleEventClient: GroupingModuleEventClient;
  public groupingModuleClient: GroupingModuleClient;
  public licenseTemplateClient: PiLicenseTemplateClient;
  public licenseTokenReadOnlyClient: LicenseTokenReadOnlyClient;
  public ipAssetRegistryClient: IpAssetRegistryClient;
  public coreMetadataModuleClient: CoreMetadataModuleClient;
  public licensingModuleClient: LicensingModuleClient;
  public licenseRegistryReadOnlyClient: LicenseRegistryReadOnlyClient;

  private readonly rpcClient: PublicClient;
  private readonly wallet: SimpleWalletClient;
  private readonly chainId: SupportedChainIds;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, chainId: SupportedChainIds) {
    this.rpcClient = rpcClient;
    this.wallet = wallet;
    this.chainId = chainId;
    this.groupingWorkflowsClient = new GroupingWorkflowsClient(rpcClient, wallet);
    this.groupingModuleEventClient = new GroupingModuleEventClient(rpcClient);
    this.licenseTemplateClient = new PiLicenseTemplateClient(rpcClient, wallet);
    this.licenseTokenReadOnlyClient = new LicenseTokenReadOnlyClient(rpcClient);
    this.ipAssetRegistryClient = new IpAssetRegistryClient(rpcClient, wallet);
    this.groupingModuleClient = new GroupingModuleClient(rpcClient, wallet);
    this.coreMetadataModuleClient = new CoreMetadataModuleClient(rpcClient, wallet);
    this.licensingModuleClient = new LicensingModuleClient(rpcClient, wallet);
    this.licenseRegistryReadOnlyClient = new LicenseRegistryReadOnlyClient(rpcClient);
  }
  /** Registers a Group IPA.
   * @param request - The request object containing necessary data to register group.
   *   @param request.groupPool The address specifying how royalty will be split amongst the pool of IPs in the group.
   *   @param request.txOptions [Optional] This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, and if waitForTransaction is true, includes group id.
   * @emits PGroupRegistered (groupId, groupPool);
   */
  public async registerGroup(request: RegisterGroupRequest): Promise<RegisterGroupResponse> {
    try {
      const object: GroupingModuleRegisterGroupRequest = {
        groupPool: getAddress(request.groupPool, "request.groupPool"),
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData: this.groupingModuleClient.registerGroupEncode(object),
        };
      } else {
        const txHash = await this.groupingModuleClient.registerGroup(object);
        if (request.txOptions?.waitForTransaction) {
          const txReceipt = await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          const { groupId } =
            this.groupingModuleEventClient.parseTxIpGroupRegisteredEvent(txReceipt)[0];
          return { txHash, groupId: groupId };
        }
        return { txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register group");
    }
  }
  /** Mint an NFT from a SPGNFT collection, register it with metadata as an IP, attach license terms to the registered IP, and add it to a group IP.
   * @param request - The request object containing necessary data to mint and register Ip and attach license and add to group.
   *   @param request.nftContract The address of the NFT collection.
   *   @param request.groupId The ID of the group IP to add the newly registered IP.
   *   @param request.licenseTermsId The ID of the registered license terms that will be attached to the new IP.
   *   @param request.recipient [Optional] The address of the recipient of the minted NFT,default value is your wallet address.
   *   @param request.licenseTemplate [Optional] The address of the license template to be attached to the new group IP,default value is Programmable IP License.
   * . @param request.deadline [Optional] The deadline for the signature in seconds, default value is 1000s.
   *   @param request.ipMetadata - [Optional] The desired metadata for the newly minted NFT and newly registered IP.
   *   @param request.ipMetadata.ipMetadataURI [Optional] The URI of the metadata for the IP.
   *   @param request.ipMetadata.ipMetadataHash [Optional] The hash of the metadata for the IP.
   *   @param request.ipMetadata.nftMetadataURI [Optional] The URI of the metadata for the NFT.
   *   @param request.ipMetadata.nftMetadataHash [Optional] The hash of the metadata for the IP NFT.
   *   @param request.txOptions [Optional] This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, and if waitForTransaction is true, includes IP ID, token ID.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, resolverAddr, metadataProviderAddress, metadata)
   */
  public async mintAndRegisterIpAndAttachLicenseAndAddToGroup(
    request: MintAndRegisterIpAndAttachLicenseAndAddToGroupRequest,
  ): Promise<MintAndRegisterIpAndAttachLicenseAndAddToGroupResponse> {
    try {
      const { groupId, recipient, spgNftContract, deadline, licenseTemplate } = request;
      const isRegistered = await this.ipAssetRegistryClient.isRegistered({
        id: getAddress(groupId, "groupId"),
      });
      if (!isRegistered) {
        throw new Error(`Group IP ${groupId} is not registered.`);
      }
      const ipAccount = new IpAccountImplClient(this.rpcClient, this.wallet, groupId);
      const { result: state } = await ipAccount.state();
      const blockTimestamp = (await this.rpcClient.getBlock()).timestamp;
      const calculatedDeadline = getDeadline(blockTimestamp, deadline);
      const sigAddToGroupSignature = await getPermissionSignature({
        ipId: groupId,
        deadline: calculatedDeadline,
        state,
        wallet: this.wallet as WalletClient,
        chainId: chain[this.chainId],
        permissions: [
          {
            ipId: groupId,
            signer: getAddress(this.groupingWorkflowsClient.address, "groupingWorkflowsClient"),
            to: getAddress(this.groupingModuleClient.address, "groupingModuleClient"),
            permission: AccessPermission.ALLOW,
            func: "function addIp(address,address[])",
          },
        ],
      });

      const object: GroupingWorkflowsMintAndRegisterIpAndAttachLicenseAndAddToGroupRequest = {
        ...request,
        spgNftContract: getAddress(spgNftContract, "request.spgNftContract"),
        recipient:
          (recipient && getAddress(recipient, "request.recipient")) || this.wallet.account!.address,
        licenseTemplate:
          (licenseTemplate && getAddress(licenseTemplate, "request.licenseTemplate")) ||
          this.licenseTemplateClient.address,
        licenseTermsId: BigInt(request.licenseTermsId),
        ipMetadata: {
          ipMetadataURI: request.ipMetadata?.ipMetadataURI || "",
          ipMetadataHash: request.ipMetadata?.ipMetadataHash || zeroHash,
          nftMetadataURI: request.ipMetadata?.nftMetadataURI || "",
          nftMetadataHash: request.ipMetadata?.nftMetadataHash || zeroHash,
        },
        sigAddToGroup: {
          signer: getAddress(this.wallet.account!.address, "wallet.account.address"),
          deadline: calculatedDeadline,
          signature: sigAddToGroupSignature,
        },
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData:
            this.groupingWorkflowsClient.mintAndRegisterIpAndAttachLicenseAndAddToGroupEncode(
              object,
            ),
        };
      } else {
        const txHash =
          await this.groupingWorkflowsClient.mintAndRegisterIpAndAttachLicenseAndAddToGroup(object);
        if (request.txOptions?.waitForTransaction) {
          const receipt = await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          const log = this.ipAssetRegistryClient.parseTxIpRegisteredEvent(receipt)[0];
          return { txHash, ipId: log.ipId, tokenId: log.tokenId };
        }
        return { txHash };
      }
    } catch (error) {
      handleError(error, "Failed to mint and register IP and attach license and add to group");
    }
  }
  /** Register an NFT as IP with metadata, attach license terms to the registered IP, and add it to a group IP.
   * @param request - The request object containing necessary data to register ip and attach license and add to group.
   *   @param request.spgNftContract The address of the NFT collection.
   *   @param request.tokenId The ID of the NFT.
   *   @param request.groupId The ID of the group IP to add the newly registered IP.
   *   @param request.licenseTermsId The ID of the registered license terms that will be attached to the new IP.
   *   @param request.licenseTemplate [Optional] The address of the license template to be attached to the new group IP,default value is Programmable IP License.
   * . @param request.deadline [Optional] The deadline for the signature in seconds, default is 1000s.
   *   @param request.ipMetadata - [Optional] The desired metadata for the newly minted NFT and newly registered IP.
   *   @param request.ipMetadata.ipMetadataURI [Optional] The URI of the metadata for the IP.
   *   @param request.ipMetadata.ipMetadataHash [Optional] The hash of the metadata for the IP.
   *   @param request.ipMetadata.nftMetadataURI [Optional] The URI of the metadata for the NFT.
   *   @param request.ipMetadata.nftMetadataHash [Optional] The hash of the metadata for the IP NFT.
   *   @param request.txOptions [Optional] This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, and if waitForTransaction is true, includes IP ID, token ID.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, resolverAddr, metadataProviderAddress, metadata)
   */
  public async registerIpAndAttachLicenseAndAddToGroup(
    request: RegisterIpAndAttachLicenseAndAddToGroupRequest,
  ): Promise<RegisterIpAndAttachLicenseAndAddToGroupResponse> {
    try {
      const ipIdAddress = await this.ipAssetRegistryClient.ipId({
        chainId: BigInt(chain[this.chainId]),
        tokenContract: getAddress(request.nftContract, "nftContract"),
        tokenId: BigInt(request.tokenId),
      });
      const isRegistered = await this.ipAssetRegistryClient.isRegistered({
        id: getAddress(request.groupId, "request.groupId"),
      });
      if (!isRegistered) {
        throw new Error(`Group IP ${request.groupId} is not registered.`);
      }
      const ipAccount = new IpAccountImplClient(this.rpcClient, this.wallet, request.groupId);
      const { result: state } = await ipAccount.state();
      const blockTimestamp = (await this.rpcClient.getBlock()).timestamp;
      const calculatedDeadline = getDeadline(blockTimestamp, request.deadline);
      const object: GroupingWorkflowsRegisterIpAndAttachLicenseAndAddToGroupRequest = {
        nftContract: getAddress(request.nftContract, "request.nftContract"),
        groupId: request.groupId,
        licenseTemplate:
          (request.licenseTemplate &&
            getAddress(request.licenseTemplate, "request.licenseTemplate")) ||
          this.licenseTemplateClient.address,
        licenseTermsId: BigInt(request.licenseTermsId),
        ipMetadata: {
          ipMetadataURI: request.ipMetadata?.ipMetadataURI || "",
          ipMetadataHash: request.ipMetadata?.ipMetadataHash || zeroHash,
          nftMetadataURI: request.ipMetadata?.nftMetadataURI || "",
          nftMetadataHash: request.ipMetadata?.nftMetadataHash || zeroHash,
        },
        tokenId: BigInt(request.tokenId),
        sigAddToGroup: {
          signer: getAddress(this.wallet.account!.address, "wallet.account.address"),
          deadline: calculatedDeadline,
          signature: await getPermissionSignature({
            ipId: getAddress(request.groupId, "request.groupId"),
            deadline: calculatedDeadline,
            state,
            wallet: this.wallet as WalletClient,
            chainId: chain[this.chainId],
            permissions: [
              {
                ipId: getAddress(request.groupId, "request.groupId"),
                signer: getAddress(this.groupingWorkflowsClient.address, "groupingWorkflowsClient"),
                to: getAddress(this.groupingModuleClient.address, "groupingModuleClient"),
                permission: AccessPermission.ALLOW,
                func: "function addIp(address,address[])",
              },
            ],
          }),
        },
        sigMetadataAndAttach: {
          signer: getAddress(this.wallet.account!.address, "wallet.account.address"),
          deadline: calculatedDeadline,
          signature: await getPermissionSignature({
            ipId: ipIdAddress,
            deadline: calculatedDeadline,
            state: toHex(0, { size: 32 }),
            wallet: this.wallet as WalletClient,
            permissionFunc: "setBatchPermissions",
            chainId: chain[this.chainId],
            permissions: [
              {
                ipId: ipIdAddress,
                signer: getAddress(this.groupingWorkflowsClient.address, "groupingWorkflowsClient"),
                to: getAddress(this.coreMetadataModuleClient.address, "coreMetadataModuleAddress"),
                permission: AccessPermission.ALLOW,
                func: "function setAll(address,string,bytes32,bytes32)",
              },
              {
                ipId: ipIdAddress,
                signer: getAddress(this.groupingWorkflowsClient.address, "groupingWorkflowsClient"),
                to: getAddress(this.licensingModuleClient.address, "licensingModuleAddress"),
                permission: AccessPermission.ALLOW,
                func: "function attachLicenseTerms(address,address,uint256)",
              },
            ],
          }),
        },
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData:
            this.groupingWorkflowsClient.registerIpAndAttachLicenseAndAddToGroupEncode(object),
        };
      }
      const txHash = await this.groupingWorkflowsClient.registerIpAndAttachLicenseAndAddToGroup(
        object,
      );
      if (request.txOptions?.waitForTransaction) {
        const receipt = await this.rpcClient.waitForTransactionReceipt({
          ...request.txOptions,
          hash: txHash,
        });
        const log = this.ipAssetRegistryClient.parseTxIpRegisteredEvent(receipt)[0];
        return { txHash, ipId: log.ipId, tokenId: log.tokenId };
      }
      return { txHash };
    } catch (error) {
      handleError(error, "Failed to register IP and attach license and add to group");
    }
  }
  /** Register a group IP with a group reward pool and attach license terms to the group IP.
   * @param request - The request object containing necessary data to register group and attach license.
   *   @param request.groupPool The address specifying how royalty will be split amongst the pool of IPs in the group.
   *   @param request.licenseTermsId The ID of the registered license terms that will be attached to the new group IP.
   *   @param request.licenseTemplate [Optional] The address of the license template to be attached to the new group IP, default value is Programmable IP License.
   *   @param request.txOptions [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, and if waitForTransaction is true, includes group id.
   * @emits PGroupRegistered (groupId, groupPool);
   */
  public async registerGroupAndAttachLicense(
    request: RegisterGroupAndAttachLicenseRequest,
  ): Promise<RegisterGroupAndAttachLicenseResponse> {
    try {
      const object = {
        groupPool: getAddress(request.groupPool, "request.groupPool"),
        licenseTemplate:
          (request.licenseTemplate &&
            getAddress(request.licenseTemplate, "request.licenseTemplate")) ||
          this.licenseTemplateClient.address,
        licenseTermsId: BigInt(request.licenseTermsId),
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData: this.groupingWorkflowsClient.registerGroupAndAttachLicenseEncode(object),
        };
      }
      const txHash = await this.groupingWorkflowsClient.registerGroupAndAttachLicense(object);
      if (request.txOptions?.waitForTransaction) {
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({
          ...request.txOptions,
          hash: txHash,
        });
        const { groupId } =
          this.groupingModuleEventClient.parseTxIpGroupRegisteredEvent(txReceipt)[0];
        return { txHash, groupId: groupId };
      }
      return { txHash };
    } catch (error) {
      handleError(error, "Failed to register group and attach license");
    }
  }
  /** Register a group IP with a group reward pool, attach license terms to the group IP, and add individual IPs to the group IP.
   * @param request - The request object containing necessary data to register group and attach license and add ips.
   *   @param request.pIds must have the same PIL terms as the group IP.
   *   @param request.groupPool The address specifying how royalty will be split amongst the pool of IPs in the group.
   *   @param request.licenseTermsId The ID of the registered license terms that will be attached to the new group IP.
   *   @param request.licenseTemplate [Optional] The address of the license template to be attached to the new group IP,default value is Programmable IP License.
   *   @param request.txOptions [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, and if waitForTransaction is true, includes group id.
   * @emits PGroupRegistered (groupId, groupPool);
   */
  public async registerGroupAndAttachLicenseAndAddIps(
    request: RegisterGroupAndAttachLicenseAndAddIpsRequest,
  ): Promise<RegisterGroupAndAttachLicenseAndAddIpsResponse> {
    try {
      for (let i = 0; i < request.ipIds.length; i++) {
        const isRegistered = await this.ipAssetRegistryClient.isRegistered({
          id: getAddress(request.ipIds[i], `request.ipIds${i}`),
        });
        if (!isRegistered) {
          throw new Error(`IP ${request.ipIds[i]} is not registered.`);
        }
      }

      request.licenseTemplate =
        (request.licenseTemplate &&
          getAddress(request.licenseTemplate, "request.licenseTemplate")) ||
        this.licenseTemplateClient.address;
      for (let i = 0; i < request.ipIds.length; i++) {
        const isAttachedLicenseTerms =
          await this.licenseRegistryReadOnlyClient.hasIpAttachedLicenseTerms({
            ipId: request.ipIds[i],
            licenseTemplate: request.licenseTemplate,
            licenseTermsId: BigInt(request.licenseTermsId),
          });
        if (!isAttachedLicenseTerms) {
          throw new Error(
            `License terms must be attached to IP ${request.ipIds[i]} before adding to group.`,
          );
        }
      }
      const object: GroupingWorkflowsRegisterGroupAndAttachLicenseAndAddIpsRequest = {
        groupPool: getAddress(request.groupPool, "request.groupPool"),
        ipIds: request.ipIds,
        licenseTemplate: request.licenseTemplate,
        licenseTermsId: BigInt(request.licenseTermsId),
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData:
            this.groupingWorkflowsClient.registerGroupAndAttachLicenseAndAddIpsEncode(object),
        };
      }
      const txHash = await this.groupingWorkflowsClient.registerGroupAndAttachLicenseAndAddIps(
        object,
      );
      if (request.txOptions?.waitForTransaction) {
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({
          ...request.txOptions,
          hash: txHash,
        });
        const { groupId } =
          this.groupingModuleEventClient.parseTxIpGroupRegisteredEvent(txReceipt)[0];
        return { txHash, groupId: groupId };
      }
      return { txHash };
    } catch (error) {
      handleError(error, "Failed to register group and attach license and add ips");
    }
  }
}
