import { PublicClient, WalletClient, toHex } from "viem";

import {
  coreMetadataModuleAbi,
  CoreMetadataModuleClient,
  groupingModuleAbi,
  GroupingModuleClient,
  GroupingModuleEventClient,
  GroupingModuleRegisterGroupRequest,
  GroupingWorkflowsClient,
  GroupingWorkflowsMintAndRegisterIpAndAttachLicenseAndAddToGroupRequest,
  GroupingWorkflowsRegisterGroupAndAttachLicenseAndAddIpsRequest,
  GroupingWorkflowsRegisterGroupAndAttachLicenseRequest,
  GroupingWorkflowsRegisterIpAndAttachLicenseAndAddToGroupRequest,
  IpAccountImplClient,
  IpAssetRegistryClient,
  LicenseRegistryReadOnlyClient,
  LicenseTokenReadOnlyClient,
  licensingModuleAbi,
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
  InnerLicenseData,
  LicenseData,
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
import { getFunctionSignature } from "../utils/getFunctionSignature";
import { validateLicenseConfig } from "../utils/validateLicenseConfig";
import { getIpMetadataForWorkflow } from "../utils/getIpMetadataForWorkflow";
import { getRevenueShare } from "../utils/licenseTermsHelper";

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
  /**  Mint an NFT from a SPGNFT collection, register it with metadata as an IP, attach license terms to the registered IP, and add it to a group IP.
   * @param request - The request object containing necessary data to mint and register Ip and attach license and add to group.
   *   @param request.nftContract The address of the NFT collection.
   *   @param request.groupId The ID of the group IP to add the newly registered IP.
   *   @param request.maxAllowedRewardShare The maximum reward share percentage that can be allocated to each member IP.
   *   @param {Array} request.licenseData licenseData The data of the license and its configuration to be attached to the new group IP.
   *      @param request.licenseData.licenseTermsId The ID of the registered license terms that will be attached to the new group IP.
   *      @param request.licenseData.licenseTemplate [Optional] The address of the license template to be attached to the new group IP, default value is Programmable IP License.
   *      @param request.licenseData.licensingConfig The licensing configuration for the IP.
   *     @param {Object} request.licenseTermsData.licensingConfig The PIL terms and licensing configuration data to attach to the IP.
   *       @param request.licenseTermsData.licensingConfig.isSet Whether the configuration is set or not.
   *       @param request.licenseTermsData.licensingConfig.mintingFee The minting fee to be paid when minting license tokens.
   *       @param request.licenseTermsData.licensingConfig.licensingHook The hook contract address for the licensing module, or address(0) if none
   *       @param request.licenseTermsData.licensingConfig.hookData The data to be used by the licensing hook.
   *       @param request.licenseTermsData.licensingConfig.commercialRevShare The commercial revenue share percentage.
   *       @param request.licenseTermsData.licensingConfig.disabled Whether the licensing is disabled or not.
   *       @param request.licenseTermsData.licensingConfig.expectMinimumGroupRewardShare The minimum percentage of the group’s reward share (from 0 to 100%, represented as 100 * 10 ** 6) that can be allocated to the IP when it is added to the group.
   *       If the remaining reward share in the group is less than the minimumGroupRewardShare,the IP cannot be added to the group.
   *       @param request.licenseTermsData.licensingConfig.expectGroupRewardPool The address of the expected group reward pool. The IP can only be added to a group with this specified reward pool address, or address(0) if the IP does not want to be added to any group.
   *   @param request.allowDuplicates Set to true to allow minting an NFT with a duplicate metadata hash.
   *   @param request.recipient [Optional] The address of the recipient of the minted NFT,default value is your wallet address.
   * . @param request.deadline [Optional] The deadline for the signature in seconds, default value is 1000s.
   *   @param {Object} request.ipMetadata - [Optional] The desired metadata for the newly minted NFT and newly registered IP.
   *     @param request.ipMetadata.ipMetadataURI [Optional] The URI of the metadata for the IP.
   *     @param request.ipMetadata.ipMetadataHash [Optional] The hash of the metadata for the IP.
   *     @param request.ipMetadata.nftMetadataURI [Optional] The URI of the metadata for the NFT.
   *     @param request.ipMetadata.nftMetadataHash [Optional] The hash of the metadata for the IP NFT.
   *   @param request.txOptions [Optional] This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, and if waitForTransaction is true, includes IP ID, token ID.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, resolverAddr, metadataProviderAddress, metadata)
   */
  public async mintAndRegisterIpAndAttachLicenseAndAddToGroup(
    request: MintAndRegisterIpAndAttachLicenseAndAddToGroupRequest,
  ): Promise<MintAndRegisterIpAndAttachLicenseAndAddToGroupResponse> {
    try {
      const { groupId, recipient, spgNftContract, deadline } = request;
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
      const { signature: sigAddToGroupSignature } = await getPermissionSignature({
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
            func: getFunctionSignature(groupingModuleAbi, "addIp"),
          },
        ],
      });
      const object: GroupingWorkflowsMintAndRegisterIpAndAttachLicenseAndAddToGroupRequest = {
        ...request,
        spgNftContract: getAddress(spgNftContract, "request.spgNftContract"),
        recipient:
          (recipient && getAddress(recipient, "request.recipient")) || this.wallet.account!.address,
        maxAllowedRewardShare: BigInt(getRevenueShare(request.maxAllowedRewardShare)),
        licensesData: this.getLicenseData(request.licenseData),
        ipMetadata: getIpMetadataForWorkflow(request.ipMetadata),
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
   *   @param request.maxAllowedRewardShare The maximum reward share percentage that can be allocated to each member IP.
   *   @param request.groupId The ID of the group IP to add the newly registered IP.
   *    @param {Array} request.licenseData licenseData The data of the license and its configuration to be attached to the new group IP.
   *      @param request.licenseData.licenseTermsId The ID of the registered license terms that will be attached to the new group IP.
   *      @param request.licenseData.licenseTemplate [Optional] The address of the license template to be attached to the new group IP, default value is Programmable IP License.
   *      @param request.licenseData.licensingConfig The licensing configuration for the IP.
   *      @param {Object} request.licenseTermsData.licensingConfig The PIL terms and licensing configuration data to attach to the IP.
   *        @param request.licenseTermsData.licensingConfig.isSet Whether the configuration is set or not.
   *        @param request.licenseTermsData.licensingConfig.mintingFee The minting fee to be paid when minting license tokens.
   *        @param request.licenseTermsData.licensingConfig.licensingHook The hook contract address for the licensing module, or address(0) if none
   *        @param request.licenseTermsData.licensingConfig.hookData The data to be used by the licensing hook.
   *        @param request.licenseTermsData.licensingConfig.commercialRevShare The commercial revenue share percentage.
   *        @param request.licenseTermsData.licensingConfig.disabled Whether the licensing is disabled or not.
   *        @param request.licenseTermsData.licensingConfig.expectMinimumGroupRewardShare The minimum percentage of the group’s reward share (from 0 to 100%, represented as 100 * 10 ** 6) that can be allocated to the IP when it is added to the group.
   *        If the remaining reward share in the group is less than the minimumGroupRewardShare,the IP cannot be added to the group.
   *        @param request.licenseTermsData.licensingConfig.expectGroupRewardPool The address of the expected group reward pool. The IP can only be added to a group with this specified reward pool address, or address(0) if the IP does not want to be added to any group.
   * . @param request.deadline [Optional] The deadline for the signature in seconds, default is 1000s.
   *   @param {Object} request.ipMetadata - [Optional] The desired metadata for the newly minted NFT and newly registered IP.
   *     @param request.ipMetadata.ipMetadataURI [Optional] The URI of the metadata for the IP.
   *     @param request.ipMetadata.ipMetadataHash [Optional] The hash of the metadata for the IP.
   *     @param request.ipMetadata.nftMetadataURI [Optional] The URI of the metadata for the NFT.
   *     @param request.ipMetadata.nftMetadataHash [Optional] The hash of the metadata for the IP NFT.
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

      const { signature: sigAddToGroupSignature } = await getPermissionSignature({
        ipId: getAddress(request.groupId, "request.groupId"),
        deadline: calculatedDeadline,
        state,
        wallet: this.wallet as WalletClient,
        chainId: chain[this.chainId],
        permissions: [
          {
            ipId: getAddress(request.groupId, "request.groupId"),
            signer: this.groupingWorkflowsClient.address,
            to: this.groupingModuleClient.address,
            permission: AccessPermission.ALLOW,
            func: getFunctionSignature(groupingModuleAbi, "addIp"),
          },
        ],
      });
      const { signature: sigMetadataAndAttachSignature } = await getPermissionSignature({
        ipId: ipIdAddress,
        deadline: calculatedDeadline,
        state: toHex(0, { size: 32 }),
        wallet: this.wallet as WalletClient,
        chainId: chain[this.chainId],
        permissions: [
          {
            ipId: ipIdAddress,
            signer: this.groupingWorkflowsClient.address,
            to: getAddress(this.coreMetadataModuleClient.address, "coreMetadataModuleAddress"),
            permission: AccessPermission.ALLOW,
            func: getFunctionSignature(coreMetadataModuleAbi, "setAll"),
          },
          {
            ipId: ipIdAddress,
            signer: this.groupingWorkflowsClient.address,
            to: getAddress(this.licensingModuleClient.address, "licensingModuleAddress"),
            permission: AccessPermission.ALLOW,
            func: getFunctionSignature(licensingModuleAbi, "attachLicenseTerms"),
          },
          {
            ipId: ipIdAddress,
            signer: this.groupingWorkflowsClient.address,
            to: getAddress(this.licensingModuleClient.address, "licensingModuleAddress"),
            permission: AccessPermission.ALLOW,
            func: getFunctionSignature(licensingModuleAbi, "setLicensingConfig"),
          },
        ],
      });
      const object: GroupingWorkflowsRegisterIpAndAttachLicenseAndAddToGroupRequest = {
        nftContract: getAddress(request.nftContract, "request.nftContract"),
        groupId: request.groupId,
        licensesData: this.getLicenseData(request.licenseData),
        ipMetadata: getIpMetadataForWorkflow(request.ipMetadata),
        tokenId: BigInt(request.tokenId),
        maxAllowedRewardShare: BigInt(getRevenueShare(request.maxAllowedRewardShare)),
        sigAddToGroup: {
          signer: getAddress(this.wallet.account!.address, "wallet.account.address"),
          deadline: calculatedDeadline,
          signature: sigAddToGroupSignature,
        },
        sigMetadataAndAttachAndConfig: {
          signer: getAddress(this.wallet.account!.address, "wallet.account.address"),
          deadline: calculatedDeadline,
          signature: sigMetadataAndAttachSignature,
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
   *    @param {Object} request.licenseData licenseData The data of the license and its configuration to be attached to the new group IP.
   *      @param request.licenseData.licenseTermsId The ID of the registered license terms that will be attached to the new group IP.
   *      @param request.licenseData.licenseTemplate [Optional] The address of the license template to be attached to the new group IP, default value is Programmable IP License.
   *      @param request.licenseData.licensingConfig The licensing configuration for the IP.
   *      @param {Object} request.licenseTermsData.licensingConfig The PIL terms and licensing configuration data to attach to the IP.
   *        @param request.licenseTermsData.licensingConfig.isSet Whether the configuration is set or not.
   *        @param request.licenseTermsData.licensingConfig.mintingFee The minting fee to be paid when minting license tokens.
   *        @param request.licenseTermsData.licensingConfig.licensingHook The hook contract address for the licensing module, or address(0) if none
   *        @param request.licenseTermsData.licensingConfig.hookData The data to be used by the licensing hook.
   *        @param request.licenseTermsData.licensingConfig.commercialRevShare The commercial revenue share percentage.
   *        @param request.licenseTermsData.licensingConfig.disabled Whether the licensing is disabled or not.
   *        @param request.licenseTermsData.licensingConfig.expectMinimumGroupRewardShare The minimum percentage of the group’s reward share (from 0 to 100%, represented as 100 * 10 ** 6) that can be allocated to the IP when it is added to the group.
   *        If the remaining reward share in the group is less than the minimumGroupRewardShare,the IP cannot be added to the group.
   *        @param request.licenseTermsData.licensingConfig.expectGroupRewardPool The address of the expected group reward pool. The IP can only be added to a group with this specified reward pool address, or address(0) if the IP does not want to be added to any group.
   *   @param request.txOptions [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, and if waitForTransaction is true, includes group id.
   * @emits PGroupRegistered (groupId, groupPool);
   */
  public async registerGroupAndAttachLicense(
    request: RegisterGroupAndAttachLicenseRequest,
  ): Promise<RegisterGroupAndAttachLicenseResponse> {
    try {
      const object: GroupingWorkflowsRegisterGroupAndAttachLicenseRequest = {
        groupPool: getAddress(request.groupPool, "request.groupPool"),
        licenseData: this.getLicenseData(request.licenseData)[0],
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
   *   @param request.ipIds must have the same PIL terms as the group IP.
   *   @param request.ipIds The IP IDs of the IPs to be added to the group.
   *   @param request.groupPool The address specifying how royalty will be split amongst the pool of IPs in the group.
   *   @param request.maxAllowedRewardShare The maximum reward share percentage that can be allocated to each member IP.
   *   @param {Object} request.licenseData licenseData The data of the license and its configuration to be attached to the new group IP.
   *      @param request.licenseData.licenseTermsId The ID of the registered license terms that will be attached to the new group IP.
   *      @param request.licenseData.licenseTemplate [Optional] The address of the license template to be attached to the new group IP, default value is Programmable IP License.
   *      @param request.licenseData.licensingConfig The licensing configuration for the IP.
   *      @param {Object} request.licenseTermsData.licensingConfig The PIL terms and licensing configuration data to attach to the IP.
   *        @param request.licenseTermsData.licensingConfig.isSet Whether the configuration is set or not.
   *        @param request.licenseTermsData.licensingConfig.mintingFee The minting fee to be paid when minting license tokens.
   *        @param request.licenseTermsData.licensingConfig.licensingHook The hook contract address for the licensing module, or address(0) if none
   *        @param request.licenseTermsData.licensingConfig.hookData The data to be used by the licensing hook.
   *        @param request.licenseTermsData.licensingConfig.commercialRevShare The commercial revenue share percentage.
   *        @param request.licenseTermsData.licensingConfig.disabled Whether the licensing is disabled or not.
   *        @param request.licenseTermsData.licensingConfig.expectMinimumGroupRewardShare The minimum percentage of the group’s reward share (from 0 to 100%, represented as 100 * 10 ** 6) that can be allocated to the IP when it is added to the group.
   *        If the remaining reward share in the group is less than the minimumGroupRewardShare,the IP cannot be added to the group.
   *        @param request.licenseTermsData.licensingConfig.expectGroupRewardPool The address of the expected group reward pool. The IP can only be added to a group with this specified reward pool address, or address(0) if the IP does not want to be added to any group.
   *   @param request.txOptions [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a transaction hash, and if encodedTxDataOnly is true, includes encoded transaction data, and if waitForTransaction is true, includes group id.
   * @emits PGroupRegistered (groupId, groupPool);
   */
  public async registerGroupAndAttachLicenseAndAddIps(
    request: RegisterGroupAndAttachLicenseAndAddIpsRequest,
  ): Promise<RegisterGroupAndAttachLicenseAndAddIpsResponse> {
    try {
      const object: GroupingWorkflowsRegisterGroupAndAttachLicenseAndAddIpsRequest = {
        groupPool: getAddress(request.groupPool, "request.groupPool"),
        ipIds: request.ipIds,
        licenseData: this.getLicenseData(request.licenseData)[0],
        maxAllowedRewardShare: BigInt(getRevenueShare(request.maxAllowedRewardShare)),
      };
      for (let i = 0; i < request.ipIds.length; i++) {
        const isRegistered = await this.ipAssetRegistryClient.isRegistered({
          id: getAddress(request.ipIds[i], `request.ipIds${i}`),
        });
        if (!isRegistered) {
          throw new Error(`IP ${request.ipIds[i]} is not registered.`);
        }
      }
      for (let i = 0; i < request.ipIds.length; i++) {
        const isAttachedLicenseTerms =
          await this.licenseRegistryReadOnlyClient.hasIpAttachedLicenseTerms({
            ipId: request.ipIds[i],
            licenseTemplate: object.licenseData.licenseTemplate,
            licenseTermsId: object.licenseData.licenseTermsId,
          });
        if (!isAttachedLicenseTerms) {
          throw new Error(
            `License terms must be attached to IP ${request.ipIds[i]} before adding to group.`,
          );
        }
      }

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

  private getLicenseData(licenseData: LicenseData[] | LicenseData): InnerLicenseData[] {
    const isArray = Array.isArray(licenseData);
    if ((isArray && licenseData.length === 0) || !licenseData) {
      throw new Error("License data is required.");
    }
    const licenseDataArray = isArray ? licenseData : [licenseData];
    return licenseDataArray.map((item, index) => ({
      licenseTemplate:
        (item.licenseTemplate &&
          getAddress(
            item.licenseTemplate,
            `request.licenseData.licenseTemplate${isArray ? `[${index}]` : ""}`,
          )) ||
        this.licenseTemplateClient.address,
      licenseTermsId: BigInt(item.licenseTermsId),
      licensingConfig: validateLicenseConfig(item.licensingConfig),
    }));
  }
}
