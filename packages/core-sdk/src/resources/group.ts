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
  LicenseTokenReadOnlyClient,
  LicensingModuleClient,
  PiLicenseTemplateClient,
  SimpleWalletClient,
} from "../abi/generated";
import { RegisterIpResponse } from "../types/resources/ipAsset";
import { AccessPermission } from "../types/resources/permission";
import { handleError } from "../utils/errors";
import { getPermissionSignature, getDeadline } from "../utils/sign";
import { chain, getAddress } from "../utils/utils";
import { SupportedChainIds } from "../types/config";
import {
  MintAndRegisterIpAndAttachLicenseAndAddToGroupRequest,
  RegisterGroupAndAttachLicenseAndAddIpsRequest,
  RegisterGroupAndAttachLicenseAndAddIpsResponse,
  RegisterGroupAndAttachLicenseRequest,
  RegisterGroupAndAttachLicenseResponse,
  RegisterGroupRequest,
  RegisterGroupResponse,
  RegisterIpAndAttachLicenseAndAddToGroupRequest,
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
  }
  /** Registers a Group IPA.
   * @param request - The request object containing necessary data to register group.
   *   @param request.groupPool The address of the group pool.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
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

  public async mintAndRegisterIpAndAttachLicenseAndAddToGroup(
    request: MintAndRegisterIpAndAttachLicenseAndAddToGroupRequest,
  ): Promise<RegisterIpResponse> {
    try {
      //TODO: Invalid signature
      const { groupId, recipient, spgNftContract, deadline, licenseTemplate } = request;
      const ipAccount = new IpAccountImplClient(this.rpcClient, this.wallet, groupId);
      const { result: state } = await ipAccount.state();
      const sigAddToGroupSignature = await getPermissionSignature({
        ipId: groupId,
        deadline: getDeadline(deadline),
        state,
        wallet: this.wallet as WalletClient,
        chainId: chain[this.chainId],
        permissions: [
          {
            ipId: groupId,
            signer: getAddress(this.groupingWorkflowsClient.address, "groupingWorkflowsClient"),
            to: getAddress(this.groupingModuleClient.address, "groupingModuleClient"),
            permission: AccessPermission.ALLOW,
            func: "function addIp(address, address[])",
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
          deadline: getDeadline(request.deadline),
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

  public async registerIpAndAttachLicenseAndAddToGroup(
    request: RegisterIpAndAttachLicenseAndAddToGroupRequest,
  ): Promise<RegisterGroupResponse> {
    try {
      //TODO: Invalid signature
      const ipAccount = new IpAccountImplClient(this.rpcClient, this.wallet, request.groupId);
      const { result: state } = await ipAccount.state();
      const object: GroupingWorkflowsRegisterIpAndAttachLicenseAndAddToGroupRequest = {
        nftContract: getAddress(request.nftContract, "request.nftContract"),
        groupId: getAddress(request.groupId, "request.groupId"),
        licenseTemplate: getAddress(request.licenseTemplate, "request.licenseTemplate"),
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
          deadline: getDeadline(request.deadline),
          signature: await getPermissionSignature({
            ipId: getAddress(request.groupId, "request.groupId"),
            deadline: getDeadline(request.deadline),
            state,
            wallet: this.wallet as WalletClient,
            chainId: chain[this.chainId],
            permissions: [
              {
                ipId: getAddress(request.groupId, "request.groupId"),
                signer: getAddress(this.groupingWorkflowsClient.address, "groupingWorkflowsClient"),
                to: getAddress(this.groupingModuleClient.address, "groupingModuleClient"),
                permission: AccessPermission.ALLOW,
                func: "function addIp(address, address[])",
              },
            ],
          }),
        },
        sigMetadataAndAttach: {
          signer: getAddress(this.wallet.account!.address, "wallet.account.address"),
          deadline: getDeadline(request.deadline),
          signature: await getPermissionSignature({
            ipId: getAddress(request.groupId, "request.groupId"),
            deadline: getDeadline(request.deadline),
            state: toHex(0, { size: 32 }),
            wallet: this.wallet as WalletClient,
            chainId: chain[this.chainId],
            permissions: [
              {
                ipId: getAddress(request.groupId, "request.groupId"),
                signer: getAddress(this.groupingWorkflowsClient.address, "groupingWorkflowsClient"),
                to: getAddress(this.coreMetadataModuleClient.address, "coreMetadataModuleAddress"),
                permission: AccessPermission.ALLOW,
                func: "function setAll(address,string,bytes32,bytes32)",
              },
              {
                ipId: getAddress(request.groupId, "request.groupId"),
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
        return { txHash, groupId: log.ipId };
      }
      return { txHash };
    } catch (error) {
      handleError(error, "Failed to register IP and attach license and add to group");
    }
  }
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

  public async registerGroupAndAttachLicenseAndAddIps(
    request: RegisterGroupAndAttachLicenseAndAddIpsRequest,
  ): Promise<RegisterGroupAndAttachLicenseAndAddIpsResponse> {
    try {
      //TODO: LicensingModule__LicenseTermsNotFound
      const object: GroupingWorkflowsRegisterGroupAndAttachLicenseAndAddIpsRequest = {
        groupPool: getAddress(request.groupPool, "request.groupPool"),
        ipIds: request.ipIds.map((ipId) => getAddress(ipId, "request.ipId")),
        licenseTemplate:
          (request.licenseTemplate &&
            getAddress(request.licenseTemplate, "request.licenseTemplate")) ||
          this.licenseTemplateClient.address,
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
