import { Hex, PublicClient, getAddress, zeroAddress,toHex } from "viem";

import { chain } from "../utils/utils";
import { SupportedChainIds } from "../types/config";
import { handleError } from "../utils/errors";
import {
  CreateIpAssetWithPilTermsRequest,
  RegisterDerivativeRequest,
  RegisterDerivativeResponse,
  RegisterDerivativeWithLicenseTokensRequest,
  RegisterDerivativeWithLicenseTokensResponse,
  RegisterIpAndMakeDerivativeRequest,
  RegisterIpResponse,
  RegisterRequest,
} from "../types/resources/ipAsset";
import {
  IpAssetRegistryClient,
  LicenseRegistryReadOnlyClient,
  LicenseTokenReadOnlyClient,
  LicensingModuleClient,
  PiLicenseTemplateClient,
  RoyaltyPolicyLapClient,
  SimpleWalletClient,
  SpgClient,
  SpgMintAndRegisterIpAndAttachPilTermsRequest,
  SpgRegisterIpAndMakeDerivativeRequest,
} from "../abi/generated";
import { PIL_TYPE } from "../types/resources/license";
import { getLicenseTermByType } from "../utils/getLicenseTermsByType";

export class IPAssetClient {
  public licensingModuleClient: LicensingModuleClient;
  public ipAssetRegistryClient: IpAssetRegistryClient;
  public licenseTemplateClient: PiLicenseTemplateClient;
  public licenseRegistryReadOnlyClient: LicenseRegistryReadOnlyClient;
  public licenseTokenReadOnlyClient: LicenseTokenReadOnlyClient;
  public royaltyPolicyLAPClient: RoyaltyPolicyLapClient;
  public spgClient: SpgClient;
  private readonly rpcClient: PublicClient;
  private readonly wallet: SimpleWalletClient;
  private readonly chainId: SupportedChainIds;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, chainId: SupportedChainIds) {
    this.licensingModuleClient = new LicensingModuleClient(rpcClient, wallet);
    this.ipAssetRegistryClient = new IpAssetRegistryClient(rpcClient, wallet);
    this.licenseTemplateClient = new PiLicenseTemplateClient(rpcClient, wallet);
    this.licenseRegistryReadOnlyClient = new LicenseRegistryReadOnlyClient(rpcClient);
    this.licenseTokenReadOnlyClient = new LicenseTokenReadOnlyClient(rpcClient);
    this.royaltyPolicyLAPClient = new RoyaltyPolicyLapClient(rpcClient, wallet);
    this.spgClient = new SpgClient(rpcClient, wallet);
    this.rpcClient = rpcClient;
    this.wallet = wallet;
    this.chainId = chainId;
  }

  /**
   * Registers an NFT as IP, creating a corresponding IP record.
   * @param request - The request object that contains all data needed to register IP.
   *   @param request.tokenContract The address of the NFT.
   *   @param request.tokenId The token identifier of the NFT.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash and optional IP ID if waitForTxn is set to true.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, resolverAddr, metadataProviderAddress, metadata)
   */
  public async register(request: RegisterRequest): Promise<RegisterIpResponse> {
    try {
      const tokenId = BigInt(request.tokenId);
      const ipId = await this.isNFTRegistered(request.tokenContract, tokenId);
      if (ipId !== "0x") {
        return { ipId: ipId };
      }
      const txHash = await this.ipAssetRegistryClient.register({
        tokenContract: getAddress(request.tokenContract),
        tokenId,
        chainid: BigInt(chain[this.chainId]),
      });
      if (request.txOptions?.waitForTransaction) {
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        const targetLogs = this.ipAssetRegistryClient.parseTxIpRegisteredEvent(txReceipt);
        return { txHash: txHash, ipId: targetLogs[0].ipId };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register IP");
    }
  }

  /**
   * Registers a derivative directly with parent IP's license terms, without needing license tokens,
   * and attaches the license terms of the parent IPs to the derivative IP.
   * The license terms must be attached to the parent IP before calling this function.
   * All IPs attached default license terms by default.
   * The derivative IP owner must be the caller or an authorized operator.
   * @param request - The request object that contains all data needed to register derivative IP.
   *   @param request.childIpId The derivative IP ID.
   *   @param request.parentIpIds The parent IP IDs.
   *   @param request.licenseTermsIds The IDs of the license terms that the parent IP supports.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash.
   */
  public async registerDerivative(
    request: RegisterDerivativeRequest,
  ): Promise<RegisterDerivativeResponse> {
    try {
      const isChildIpIdRegistered = await this.isRegistered(request.childIpId);
      if (!isChildIpIdRegistered) {
        throw new Error(`The child IP with id ${request.childIpId} is not registered.`);
      }
      for (const parentId of request.parentIpIds) {
        const isParentIpIdRegistered = await this.isRegistered(getAddress(parentId));
        if (!isParentIpIdRegistered) {
          throw new Error(`The parent IP with id ${parentId} is not registered.`);
        }
      }
      if (request.parentIpIds.length !== request.licenseTermsIds.length) {
        throw new Error("Parent IP IDs and License terms IDs must be provided in pairs.");
      }
      for (let i = 0; i < request.parentIpIds.length; i++) {
        const isAttachedLicenseTerms =
          await this.licenseRegistryReadOnlyClient.hasIpAttachedLicenseTerms({
            ipId: getAddress(request.parentIpIds[i]),
            licenseTemplate:
              (request.licenseTemplate && getAddress(request.licenseTemplate)) ||
              this.licenseTemplateClient.address,
            licenseTermsId: BigInt(request.licenseTermsIds[i]),
          });
        if (!isAttachedLicenseTerms) {
          throw new Error(
            `License terms id ${request.licenseTermsIds[i]} must be attached to the parent ipId ${request.parentIpIds[i]} before registering derivative.`,
          );
        }
      }

      const txHash = await this.licensingModuleClient.registerDerivative({
        childIpId: request.childIpId,
        parentIpIds: request.parentIpIds,
        licenseTermsIds: request.licenseTermsIds.map((id) => BigInt(id)),
        licenseTemplate: request.licenseTemplate || this.licenseTemplateClient.address,
        royaltyContext: zeroAddress,
      });
      if (request.txOptions?.waitForTransaction) {
        await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        return { txHash };
      } else {
        return { txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register derivative");
    }
  }

  /**
   * Registers a derivative with license tokens.
   * the derivative IP is registered with license tokens minted from the parent IP's license terms.
   * the license terms of the parent IPs issued with license tokens are attached to the derivative IP.
   * the caller must be the derivative IP owner or an authorized operator.
   * @param request - The request object that contains all data needed to register derivative license tokens.
   *   @param request.childIpId The derivative IP ID.
   *   @param request.licenseTokenIds The IDs of the license tokens.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash.
   */
  public async registerDerivativeWithLicenseTokens(
    request: RegisterDerivativeWithLicenseTokensRequest,
  ): Promise<RegisterDerivativeWithLicenseTokensResponse> {
    try {
      const isChildIpIdRegistered = await this.isRegistered(request.childIpId);
      if (!isChildIpIdRegistered) {
        throw new Error(`The child IP with id ${request.childIpId} is not registered.`);
      }
      for (const licenseTokenId of request.licenseTokenIds) {
        const tokenOwnerAddress = await this.licenseTokenReadOnlyClient.ownerOf({
          tokenId: BigInt(licenseTokenId),
        });
        if (!tokenOwnerAddress) {
          throw new Error(`License token id ${licenseTokenId} must be owned by the caller.`);
        }
      }
      const txHash = await this.licensingModuleClient.registerDerivativeWithLicenseTokens({
        childIpId: getAddress(request.childIpId),
        licenseTokenIds: request.licenseTokenIds.map((id) => BigInt(id)),
        royaltyContext: zeroAddress,
      });
      if (request.txOptions?.waitForTransaction) {
        await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        return { txHash: txHash };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register derivative with license tokens");
    }
  }

  /**
   * Mint an NFT from a collection and register it as an IP.
   * @param request - The request object that contains all data needed to mint and register ip.
   *   @param request.nftContract The address of the NFT collection.
   *   @param request.pilType The type of the PIL.
   *   @param request.metadata - The metadata for the IP.
   *   @param request.metadataURI The URI of the metadata for the IP.
   *   @param request.metadata [Optional] The metadata for the IP.
   *   @param request.nftMetadata The metadata for the IP NFT.
   *   @param request.recipient [Optional] The address of the recipient of the minted NFT.
   *   @param request.mintingFee [Optional] The fee to be paid when minting a license.
   *   @param request.commercialRevShare [Optional] Percentage of revenue that must be shared with the licensor.
   *   @param request.currency [Optional] The ERC20 token to be used to pay the minting fee. the token must be registered in story protocol.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash.
   */
  public async createIpAssetWithPilTerms(request: CreateIpAssetWithPilTermsRequest) {
    try {
      if (request.pilType === undefined || request.pilType === null) {
        throw new Error("PIL type is required.");
      }
      if (
        request.pilType === PIL_TYPE.COMMERCIAL_USE &&
        (!request.mintingFee || !request.currency)
      ) {
        throw new Error("Minting fee and currency are required for commercial use PIL.");
      }
      if (
        request.pilType === PIL_TYPE.COMMERCIAL_REMIX &&
        (!request.mintingFee || !request.currency || !request.commercialRevShare)
      ) {
        throw new Error(
          "Minting fee, currency and commercialRevShare are required for commercial remix PIL.",
        );
      }
      const licenseTerm = getLicenseTermByType(request.pilType, {
        mintingFee: request.mintingFee,
        currency: request.currency && getAddress(request.currency),
        royaltyPolicyLAPAddress: this.royaltyPolicyLAPClient.address,
        commercialRevShare: request.commercialRevShare,
      });
      const object: SpgMintAndRegisterIpAndAttachPilTermsRequest = {
        nftContract: getAddress(request.nftContract),
        recipient:
          (request.recipient && getAddress(request.recipient)) || this.wallet.account!.address,

        terms: licenseTerm,
        metadata: {
          metadataURI: "",
          metadataHash: toHex("", { size: 32 }),
          nftMetadataHash: toHex("", { size: 32 }),
        },
      };
      if (
        request.metadata &&
        !request.metadata.metadataURI &&
        !request.metadata.metadata &&
        !request.metadata.nftMetadata
      ) {
        object.metadata = {
          metadataURI: request.metadata.metadataURI,
          metadataHash: toHex(request.metadata.metadata, { size: 32 }),
          nftMetadataHash: toHex(request.metadata.nftMetadata, { size: 32 }),
        };
      }
      const txHash = await this.spgClient.mintAndRegisterIpAndAttachPilTerms(object);
      return txHash;
    } catch (error) {
      handleError(error, "Failed to mint and register IP and attach PIL terms");
    }
  }
  /**
   * Register the given NFT as a derivative IP with metadata without using license tokens.
   * @param request - The request object that contains all data needed to register derivative IP.
   *   @param request.nftContract The address of the NFT collection.
   *   @param request.tokenId The ID of the NFT.
   *   @param request.derivData The derivative data to be used for registerDerivative.
   *   @param request.derivData.parentIpIds The IDs of the parent IPs to link the registered derivative IP.
   *   @param request.derivData.licenseTemplate [Optional] The address of the license template to be used for the linking.
   *   @param request.derivData.licenseTermsIds The IDs of the license terms to be used for the linking.
   *   @param request.sigRegister Signature data for registerDerivative for the IP via the Licensing Module.
   *   @param request.sigRegister.signer The address of the signer for execution with signature.
   *   @param request.sigRegister.deadline The deadline for the signature.
   *   @param request.sigRegister.signature The signature for the execution via IP Account.
   *   @param request.metadata [Optional] The desired metadata for the newly registered IP.
   *   @param request.metadata.metadataURI The URI of the metadata for the IP.
   *   @param request.metadata.metadata The metadata for the IP.
   *   @param request.metadata.nftMetadata The the metadata for the IP NFT.
   *   @param request.sigMetadata [Optional] Signature data for setAll (metadata) for the IP via the Core Metadata Module.
   *   @param request.sigMetadata.signer The address of the signer for execution with signature.
   *   @param request.sigMetadata.deadline The deadline for the signature.
   *   @param request.sigMetadata.signature The signature for the execution via IP Account.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash.
   */
  private async registerDerivativeIp(request: RegisterIpAndMakeDerivativeRequest) {
    try {
      const object: SpgRegisterIpAndMakeDerivativeRequest = {
        nftContract: getAddress(request.nftContract),
        tokenId: BigInt(request.tokenId),
        derivData: {
          parentIpIds: request.derivData.parentIpIds.map((id) => getAddress(id)),
          licenseTermsIds: request.derivData.licenseTermsIds.map((id) => BigInt(id)),
          licenseTemplate:
            (request.derivData.licenseTemplate && getAddress(request.derivData.licenseTemplate)) ||
            this.licenseTemplateClient.address,
          royaltyContext: zeroAddress,
        },
        sigRegister: {
          signer: getAddress(request.sigRegister.signer),
          deadline: BigInt(request.sigRegister.deadline),
          signature: request.sigRegister.signature,
        },
        sigMetadata: {
          signer: zeroAddress,
          deadline: BigInt(0),
          signature: zeroAddress,
        },
        metadata: {
          metadataURI: "",
          metadataHash: toHex("", { size: 32 }),
          nftMetadataHash: toHex("", { size: 32 }),
        },
      };
      if (
        request.sigMetadata &&
        request.sigMetadata.signature &&
        request.sigMetadata.signature !== zeroAddress &&
        request.sigMetadata.signer &&
        request.sigMetadata.signer !== zeroAddress &&
        request.sigMetadata.deadline
      ) {
        object.sigMetadata = {
          signer: getAddress(request.sigMetadata.signer),
          deadline: BigInt(request.sigMetadata.deadline),
          signature: request.sigMetadata.signature,
        };
      }
      if (
        request.metadata &&
        request.metadata.metadata &&
        request.metadata.metadataURI &&
        request.metadata.nftMetadata
      ) {
        object.metadata = {
          metadataURI: request.metadata.metadataURI,
          metadataHash: toHex(request.metadata.metadata, { size: 32 }),
          nftMetadataHash: toHex(request.metadata.nftMetadata, { size: 32 }),
        };
      }

      const txHash = await this.spgClient.registerIpAndMakeDerivative(object);
      return txHash;
    } catch (error) {
      handleError(error, "Failed to register derivative IP");
    }
  }
  private async isNFTRegistered(tokenAddress: Hex, tokenId: bigint): Promise<Hex> {
    const ipId = await this.ipAssetRegistryClient.ipId({
      chainId: BigInt(chain[this.chainId]),
      tokenContract: getAddress(tokenAddress),
      tokenId: tokenId,
    });
    const isRegistered = await this.ipAssetRegistryClient.isRegistered({ id: ipId });
    return isRegistered ? ipId : "0x";
  }

  private async isRegistered(ipId: Hex): Promise<boolean> {
    return await this.ipAssetRegistryClient.isRegistered({ id: getAddress(ipId) });
  }
}
