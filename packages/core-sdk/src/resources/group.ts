import { PublicClient, toHex, WalletClient, zeroAddress } from "viem";

import {
  coreMetadataModuleAbi,
  CoreMetadataModuleClient,
  groupingModuleAbi,
  GroupingModuleAddIpRequest,
  GroupingModuleClaimRewardRequest,
  GroupingModuleClient,
  GroupingModuleCollectRoyaltiesRequest,
  GroupingModuleEventClient,
  GroupingModuleRegisterGroupRequest,
  GroupingModuleRemoveIpRequest,
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
  RoyaltyModuleEventClient,
  SimpleWalletClient,
} from "../abi/generated";
import { RevShareType } from "../types/common";
import { ChainIds } from "../types/config";
import { TransactionResponse } from "../types/options";
import {
  AddIpRequest,
  ClaimRewardRequest,
  ClaimRewardResponse,
  CollectAndDistributeGroupRoyaltiesRequest,
  CollectAndDistributeGroupRoyaltiesResponse,
  CollectRoyaltiesRequest,
  CollectRoyaltiesResponse,
  GetClaimableRewardRequest,
  LicenseData,
  LicenseDataInput,
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
  RemoveIpsFromGroupRequest,
} from "../types/resources/group";
import { AccessPermission } from "../types/resources/permission";
import { handleError } from "../utils/errors";
import { getFunctionSignature } from "../utils/getFunctionSignature";
import { getIpMetadataForWorkflow } from "../utils/getIpMetadataForWorkflow";
import { getRevenueShare } from "../utils/royalty";
import { getDeadline, getPermissionSignature } from "../utils/sign";
import { waitForTxReceipt } from "../utils/txOptions";
import { validateAddress, validateAddresses } from "../utils/utils";
import { validateLicenseConfig } from "../utils/validateLicenseConfig";

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
  public royaltyModuleEventClient: RoyaltyModuleEventClient;

  private readonly rpcClient: PublicClient;
  private readonly wallet: SimpleWalletClient;
  private readonly chainId: ChainIds;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, chainId: ChainIds) {
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
    this.royaltyModuleEventClient = new RoyaltyModuleEventClient(rpcClient);
  }

  /** Registers a Group IPA.
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/modules/grouping/IGroupingModule.sol#L14 | `IPGroupRegistered`} event.
   */
  public async registerGroup(request: RegisterGroupRequest): Promise<RegisterGroupResponse> {
    try {
      const object: GroupingModuleRegisterGroupRequest = {
        groupPool: validateAddress(request.groupPool),
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData: this.groupingModuleClient.registerGroupEncode(object),
        };
      } else {
        const txHash = await this.groupingModuleClient.registerGroup(object);
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({
          ...request.txOptions,
          hash: txHash,
        });
        const { groupId } =
          this.groupingModuleEventClient.parseTxIpGroupRegisteredEvent(txReceipt)[0];
        return { txHash, groupId: groupId };
      }
    } catch (error) {
      return handleError(error, "Failed to register group");
    }
  }

  /** Mint an NFT from a SPGNFT collection, register it with metadata as an IP, attach license terms to the registered IP, and add it to a group IP.
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/registries/IIPAssetRegistry.sol#L17 | `IPRegistered`} event.
   */
  public async mintAndRegisterIpAndAttachLicenseAndAddToGroup(
    request: MintAndRegisterIpAndAttachLicenseAndAddToGroupRequest,
  ): Promise<MintAndRegisterIpAndAttachLicenseAndAddToGroupResponse> {
    try {
      const { groupId, recipient, spgNftContract, deadline } = request;
      const isRegistered = await this.ipAssetRegistryClient.isRegistered({
        id: validateAddress(groupId),
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
        chainId: this.chainId,
        permissions: [
          {
            ipId: groupId,
            signer: validateAddress(this.groupingWorkflowsClient.address),
            to: validateAddress(this.groupingModuleClient.address),
            permission: AccessPermission.ALLOW,
            func: getFunctionSignature(groupingModuleAbi, "addIp"),
          },
        ],
      });
      const object: GroupingWorkflowsMintAndRegisterIpAndAttachLicenseAndAddToGroupRequest = {
        ...request,
        allowDuplicates: request.allowDuplicates || true,
        spgNftContract: validateAddress(spgNftContract),
        recipient: validateAddress(recipient || this.wallet.account!.address),
        maxAllowedRewardShare: BigInt(
          getRevenueShare(request.maxAllowedRewardShare, RevShareType.MAX_ALLOWED_REWARD_SHARE),
        ),
        licensesData: this.getLicenseData(request.licenseData),
        ipMetadata: getIpMetadataForWorkflow(request.ipMetadata),
        sigAddToGroup: {
          signer: validateAddress(this.wallet.account!.address),
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
        const receipt = await this.rpcClient.waitForTransactionReceipt({
          ...request.txOptions,
          hash: txHash,
        });
        const log = this.ipAssetRegistryClient.parseTxIpRegisteredEvent(receipt)[0];
        return { txHash, ipId: log.ipId, tokenId: log.tokenId };
      }
    } catch (error) {
      return handleError(
        error,
        "Failed to mint and register IP and attach license and add to group",
      );
    }
  }

  /** Register an NFT as IP with metadata, attach license terms to the registered IP, and add it to a group IP.
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/registries/IIPAssetRegistry.sol#L17 | `IPRegistered`} event.
   */
  public async registerIpAndAttachLicenseAndAddToGroup(
    request: RegisterIpAndAttachLicenseAndAddToGroupRequest,
  ): Promise<RegisterIpAndAttachLicenseAndAddToGroupResponse> {
    try {
      const ipIdAddress = await this.ipAssetRegistryClient.ipId({
        chainId: BigInt(this.chainId),
        tokenContract: validateAddress(request.nftContract),
        tokenId: BigInt(request.tokenId),
      });
      const isRegistered = await this.ipAssetRegistryClient.isRegistered({
        id: validateAddress(request.groupId),
      });
      if (!isRegistered) {
        throw new Error(`Group IP ${request.groupId} is not registered.`);
      }
      const ipAccount = new IpAccountImplClient(this.rpcClient, this.wallet, request.groupId);
      const { result: state } = await ipAccount.state();
      const blockTimestamp = (await this.rpcClient.getBlock()).timestamp;
      const calculatedDeadline = getDeadline(blockTimestamp, request.deadline);

      const { signature: sigAddToGroupSignature } = await getPermissionSignature({
        ipId: request.groupId,
        deadline: calculatedDeadline,
        state,
        wallet: this.wallet as WalletClient,
        chainId: this.chainId,
        permissions: [
          {
            ipId: request.groupId,
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
        chainId: this.chainId,
        permissions: [
          {
            ipId: ipIdAddress,
            signer: this.groupingWorkflowsClient.address,
            to: validateAddress(this.coreMetadataModuleClient.address),
            permission: AccessPermission.ALLOW,
            func: getFunctionSignature(coreMetadataModuleAbi, "setAll"),
          },
          {
            ipId: ipIdAddress,
            signer: this.groupingWorkflowsClient.address,
            to: validateAddress(this.licensingModuleClient.address),
            permission: AccessPermission.ALLOW,
            func: getFunctionSignature(licensingModuleAbi, "attachLicenseTerms"),
          },
          {
            ipId: ipIdAddress,
            signer: this.groupingWorkflowsClient.address,
            to: this.licensingModuleClient.address,
            permission: AccessPermission.ALLOW,
            func: getFunctionSignature(licensingModuleAbi, "setLicensingConfig"),
          },
        ],
      });
      const object: GroupingWorkflowsRegisterIpAndAttachLicenseAndAddToGroupRequest = {
        nftContract: request.nftContract,
        groupId: request.groupId,
        licensesData: this.getLicenseData(request.licenseData),
        ipMetadata: getIpMetadataForWorkflow(request.ipMetadata),
        tokenId: BigInt(request.tokenId),
        maxAllowedRewardShare: BigInt(
          getRevenueShare(request.maxAllowedRewardShare, RevShareType.MAX_ALLOWED_REWARD_SHARE),
        ),
        sigAddToGroup: {
          signer: validateAddress(this.wallet.account!.address),
          deadline: calculatedDeadline,
          signature: sigAddToGroupSignature,
        },
        sigMetadataAndAttachAndConfig: {
          signer: this.wallet.account!.address,
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
      const receipt = await this.rpcClient.waitForTransactionReceipt({
        ...request.txOptions,
        hash: txHash,
      });
      const log = this.ipAssetRegistryClient.parseTxIpRegisteredEvent(receipt)[0];
      return { txHash, ipId: log.ipId, tokenId: log.tokenId };
    } catch (error) {
      return handleError(error, "Failed to register IP and attach license and add to group");
    }
  }

  /** Register a group IP with a group reward pool and attach license terms to the group IP.
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/modules/grouping/IGroupingModule.sol#L14 | `IPGroupRegistered`} event.
   */
  public async registerGroupAndAttachLicense(
    request: RegisterGroupAndAttachLicenseRequest,
  ): Promise<RegisterGroupAndAttachLicenseResponse> {
    try {
      const object: GroupingWorkflowsRegisterGroupAndAttachLicenseRequest = {
        groupPool: validateAddress(request.groupPool),
        licenseData: this.getLicenseData(request.licenseData)[0],
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return {
          encodedTxData: this.groupingWorkflowsClient.registerGroupAndAttachLicenseEncode(object),
        };
      }
      const txHash = await this.groupingWorkflowsClient.registerGroupAndAttachLicense(object);
      const txReceipt = await this.rpcClient.waitForTransactionReceipt({
        ...request.txOptions,
        hash: txHash,
      });
      const { groupId } =
        this.groupingModuleEventClient.parseTxIpGroupRegisteredEvent(txReceipt)[0];
      return { txHash, groupId: groupId };
    } catch (error) {
      return handleError(error, "Failed to register group and attach license");
    }
  }

  /** Register a group IP with a group reward pool, attach license terms to the group IP, and add individual IPs to the group IP.
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/modules/grouping/IGroupingModule.sol#L14 | `IPGroupRegistered`} event.
   */
  public async registerGroupAndAttachLicenseAndAddIps(
    request: RegisterGroupAndAttachLicenseAndAddIpsRequest,
  ): Promise<RegisterGroupAndAttachLicenseAndAddIpsResponse> {
    try {
      const object: GroupingWorkflowsRegisterGroupAndAttachLicenseAndAddIpsRequest = {
        groupPool: validateAddress(request.groupPool),
        ipIds: request.ipIds,
        licenseData: this.getLicenseData(request.licenseData)[0],
        maxAllowedRewardShare: BigInt(getRevenueShare(request.maxAllowedRewardShare)),
      };
      for (let i = 0; i < request.ipIds.length; i++) {
        const isRegistered = await this.ipAssetRegistryClient.isRegistered({
          id: validateAddress(request.ipIds[i]),
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
      const txReceipt = await this.rpcClient.waitForTransactionReceipt({
        ...request.txOptions,
        hash: txHash,
      });
      const { groupId } =
        this.groupingModuleEventClient.parseTxIpGroupRegisteredEvent(txReceipt)[0];
      return { txHash, groupId: groupId };
    } catch (error) {
      return handleError(error, "Failed to register group and attach license and add ips");
    }
  }

  /**
   * Collect royalties for the entire group and distribute the rewards to each member IP's royalty vault.
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/modules/grouping/IGroupingModule.sol#L38 | `CollectedRoyaltiesToGroupPool`} event.
   */
  public async collectAndDistributeGroupRoyalties({
    groupIpId,
    currencyTokens,
    memberIpIds,
    txOptions,
  }: CollectAndDistributeGroupRoyaltiesRequest): Promise<CollectAndDistributeGroupRoyaltiesResponse> {
    try {
      if (!currencyTokens.length) {
        throw new Error("At least one currency token is required.");
      }

      if (!memberIpIds.length) {
        throw new Error("At least one member IP ID is required.");
      }

      if (currencyTokens.some((token) => token === zeroAddress)) {
        throw new Error("Currency token cannot be the zero address.");
      }
      const collectAndClaimParams = {
        groupIpId: validateAddress(groupIpId),
        currencyTokens: validateAddresses(currencyTokens),
        memberIpIds: validateAddresses(memberIpIds),
      };
      const isGroupRegistered = await this.ipAssetRegistryClient.isRegistered({
        id: collectAndClaimParams.groupIpId,
      });
      if (!isGroupRegistered) {
        throw new Error(
          `The group IP with ID ${collectAndClaimParams.groupIpId} is not registered.`,
        );
      }
      await Promise.all(
        collectAndClaimParams.memberIpIds.map(async (ipId) => {
          const isMemberRegistered = await this.ipAssetRegistryClient.isRegistered({
            id: ipId,
          });
          if (!isMemberRegistered) {
            throw new Error(`Member IP with ID ${ipId} is not registered .`);
          }
        }),
      );

      const txHash = await this.groupingWorkflowsClient.collectRoyaltiesAndClaimReward(
        collectAndClaimParams,
      );
      const { receipt } = await waitForTxReceipt({
        txHash,
        txOptions,
        rpcClient: this.rpcClient,
      });
      if (!receipt) {
        return { txHash };
      }
      const collectedRoyalties = this.groupingModuleEventClient
        .parseTxCollectedRoyaltiesToGroupPoolEvent(receipt)
        .map(({ groupId, amount, token }) => ({
          groupId,
          amount,
          token,
        }));
      const royaltiesDistributed = this.royaltyModuleEventClient
        .parseTxRoyaltyPaidEvent(receipt)
        .map(({ receiverIpId, amount, token, amountAfterFee }) => ({
          ipId: receiverIpId,
          amount,
          token,
          amountAfterFee,
        }));
      return { txHash, collectedRoyalties, royaltiesDistributed };
    } catch (error) {
      return handleError(error, "Failed to collect and distribute group royalties");
    }
  }

  /**
   * Adds IPs to group.
   * The function must be called by the Group IP owner or an authorized operator.
   */
  public async addIpsToGroup({
    groupIpId,
    ipIds,
    maxAllowedRewardSharePercentage,
    txOptions,
  }: AddIpRequest): Promise<TransactionResponse> {
    try {
      const addIpParam: GroupingModuleAddIpRequest = {
        groupIpId: validateAddress(groupIpId),
        ipIds: validateAddresses(ipIds),
        maxAllowedRewardShare: BigInt(
          getRevenueShare(
            maxAllowedRewardSharePercentage || 100,
            RevShareType.MAX_ALLOWED_REWARD_SHARE,
          ),
        ),
      };
      const txHash = await this.groupingModuleClient.addIp(addIpParam);
      return await waitForTxReceipt({
        txHash,
        txOptions,
        rpcClient: this.rpcClient,
      });
    } catch (error) {
      return handleError(error, "Failed to add IP to group");
    }
  }

  /**
   * Returns the available reward for each IP in the group.
   */
  public async getClaimableReward({
    groupIpId,
    currencyToken,
    memberIpIds,
  }: GetClaimableRewardRequest): Promise<bigint[]> {
    try {
      const claimableReward = await this.groupingModuleClient.getClaimableReward({
        groupId: validateAddress(groupIpId),
        ipIds: validateAddresses(memberIpIds),
        token: validateAddress(currencyToken),
      });
      // The result is cast as bigint[] because the `claimableReward` array is of type `readonly bigint[]`.
      return claimableReward as bigint[];
    } catch (error) {
      return handleError(error, "Failed to get claimable reward");
    }
  }

  /**
   * Removes IPs from group.
   * The function must be called by the Group IP owner or an authorized operator.
   */
  public async removeIpsFromGroup({
    groupIpId,
    ipIds,
    txOptions,
  }: RemoveIpsFromGroupRequest): Promise<TransactionResponse> {
    try {
      const removeIpParam: GroupingModuleRemoveIpRequest = {
        groupIpId: validateAddress(groupIpId),
        ipIds: validateAddresses(ipIds),
      };
      const txHash = await this.groupingModuleClient.removeIp(removeIpParam);
      return await waitForTxReceipt({
        txHash,
        txOptions,
        rpcClient: this.rpcClient,
      });
    } catch (error) {
      return handleError(error, "Failed to remove IPs from group");
    }
  }

  /**
   * Claims reward.
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/modules/grouping/IGroupingModule.sol#L31 | `ClaimedReward`} event.
   */
  public async claimReward({
    groupIpId,
    currencyToken,
    memberIpIds,
    txOptions,
  }: ClaimRewardRequest): Promise<ClaimRewardResponse> {
    try {
      const claimRewardParam: GroupingModuleClaimRewardRequest = {
        groupId: validateAddress(groupIpId),
        ipIds: validateAddresses(memberIpIds),
        token: validateAddress(currencyToken),
      };
      const txHash = await this.groupingModuleClient.claimReward(claimRewardParam);
      const { receipt } = await waitForTxReceipt({
        txHash,
        txOptions,
        rpcClient: this.rpcClient,
      });
      if (!receipt) {
        return { txHash };
      }
      const claimedReward = this.groupingModuleEventClient.parseTxClaimedRewardEvent(receipt);
      return { txHash, claimedReward };
    } catch (error) {
      return handleError(error, "Failed to claim reward");
    }
  }

  /**
   * Collects royalties into the pool, making them claimable by group member IPs.
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/modules/grouping/IGroupingModule.sol#L38 | `CollectedRoyaltiesToGroupPool`} event.
   */
  public async collectRoyalties({
    groupIpId,
    currencyToken,
    txOptions,
  }: CollectRoyaltiesRequest): Promise<CollectRoyaltiesResponse> {
    try {
      const collectRoyaltiesParam: GroupingModuleCollectRoyaltiesRequest = {
        groupId: validateAddress(groupIpId),
        token: validateAddress(currencyToken),
      };
      const txHash = await this.groupingModuleClient.collectRoyalties(collectRoyaltiesParam);
      const { receipt } = await waitForTxReceipt({
        txHash,
        txOptions,
        rpcClient: this.rpcClient,
      });
      if (!receipt) {
        return { txHash };
      }
      const collectedRoyalties =
        this.groupingModuleEventClient.parseTxCollectedRoyaltiesToGroupPoolEvent(receipt)[0].amount;
      return { txHash, collectedRoyalties };
    } catch (error) {
      return handleError(error, "Failed to collect royalties");
    }
  }

  private getLicenseData(licenseData: LicenseDataInput[] | LicenseDataInput): LicenseData[] {
    const isArray = Array.isArray(licenseData);
    if ((isArray && licenseData.length === 0) || !licenseData) {
      throw new Error("License data is required.");
    }
    const licenseDataArray = isArray ? licenseData : [licenseData];
    return licenseDataArray.map((item) => ({
      licenseTemplate: validateAddress(item.licenseTemplate || this.licenseTemplateClient.address),
      licenseTermsId: BigInt(item.licenseTermsId),
      licensingConfig: validateLicenseConfig(item.licensingConfig),
    }));
  }
}
