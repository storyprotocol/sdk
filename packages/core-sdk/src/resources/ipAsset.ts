import {
  Hex,
  PublicClient,
  zeroAddress,
  Address,
  encodeFunctionData,
  LocalAccount,
  toFunctionSelector,
  zeroHash,
} from "viem";

import { chain, getCustomAddress } from "../utils/utils";
import { SupportedChainIds } from "../types/config";
import { handleError } from "../utils/errors";
import {
  CreateIpAssetWithPilTermsRequest,
  CreateIpAssetWithPilTermsResponse,
  RegisterDerivativeRequest,
  RegisterDerivativeResponse,
  RegisterDerivativeWithLicenseTokensRequest,
  RegisterDerivativeWithLicenseTokensResponse,
  RegisterIpAndAttachPilTermsRequest,
  RegisterIpAndAttachPilTermsResponse,
  RegisterIpAndMakeDerivativeRequest,
  RegisterIpAndMakeDerivativeResponse,
  RegisterIpResponse,
  RegisterRequest,
} from "../types/resources/ipAsset";
import {
  AccessControllerClient,
  CoreMetadataModuleClient,
  IpAssetRegistryClient,
  LicenseRegistryReadOnlyClient,
  LicenseTokenReadOnlyClient,
  LicensingModuleClient,
  PiLicenseTemplateClient,
  RoyaltyPolicyLapClient,
  SimpleWalletClient,
  SpgClient,
  SpgMintAndRegisterIpAndAttachPilTermsRequest,
  SpgRegisterIpAndAttachPilTermsRequest,
  SpgRegisterIpAndMakeDerivativeRequest,
  SpgRegisterIpRequest,
  accessControllerAbi,
} from "../abi/generated";
import { getLicenseTermByType } from "../utils/getLicenseTermsByType";
import { getDeadline, getPermissionSignature } from "../utils/sign";

export class IPAssetClient {
  public licensingModuleClient: LicensingModuleClient;
  public ipAssetRegistryClient: IpAssetRegistryClient;
  public licenseTemplateClient: PiLicenseTemplateClient;
  public licenseRegistryReadOnlyClient: LicenseRegistryReadOnlyClient;
  public licenseTokenReadOnlyClient: LicenseTokenReadOnlyClient;
  public royaltyPolicyLAPClient: RoyaltyPolicyLapClient;
  public accessControllerClient: AccessControllerClient;
  public coreMetadataModuleClient: CoreMetadataModuleClient;
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
    this.accessControllerClient = new AccessControllerClient(rpcClient, wallet);
    this.coreMetadataModuleClient = new CoreMetadataModuleClient(rpcClient, wallet);
    this.spgClient = new SpgClient(rpcClient, wallet);
    this.rpcClient = rpcClient;
    this.wallet = wallet;
    this.chainId = chainId;
  }

  /**
   * Registers an NFT as IP, creating a corresponding IP record.
   * @param request - The request object that contains all data needed to register IP.
   *   @param request.nftContract The address of the NFT.
   *   @param request.tokenId The token identifier of the NFT.
   *   @param request.metadata - [Optional] The metadata for the IP.
   *   @param request.metadata.metadataURI [Optional] The URI of the metadata for the IP.
   *   @param request.metadata.metadataHash [Optional] The metadata for the IP.
   *   @param request.metadata.nftMetadataHash [Optional] The metadata for the IP NFT.
   *   @param request.deadline [Optional] The deadline for the signature in milliseconds, default is 1000ms.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash and optional IP ID if waitForTxn is set to true.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, resolverAddr, metadataProviderAddress, metadata)
   */
  public async register(request: RegisterRequest): Promise<RegisterIpResponse> {
    try {
      const tokenId = BigInt(request.tokenId);
      const ipIdAddress = await this.getIpIdAddress(request.nftContract, tokenId);
      const isRegistered = await this.isNftRegistered(ipIdAddress);
      if (isRegistered) {
        return { ipId: ipIdAddress };
      }
      const object: SpgRegisterIpRequest = {
        tokenId,
        nftContract: getCustomAddress(request.nftContract, "request.nftContract"),
        metadata: {
          metadataURI: "",
          metadataHash: zeroHash,
          nftMetadataHash: zeroHash,
        },
        sigMetadata: {
          signer: zeroAddress,
          deadline: BigInt(0),
          signature: zeroHash,
        },
      };
      if (
        request.metadata &&
        (request.metadata.metadataHash !== zeroHash ||
          request.metadata.metadataURI !== "" ||
          request.metadata.nftMetadataHash !== zeroHash)
      ) {
        object.metadata = {
          metadataURI: request.metadata.metadataURI || object.metadata.metadataURI,
          metadataHash: request.metadata.metadataHash || object.metadata.metadataHash,
          nftMetadataHash: request.metadata.nftMetadataHash || object.metadata.nftMetadataHash,
        };
        const calculatedDeadline = getDeadline(request.deadline);
        const signature = await getPermissionSignature({
          ipId: ipIdAddress,
          deadline: calculatedDeadline,
          nonce: 1,
          account: this.wallet.account as LocalAccount,
          chainId: chain[this.chainId],
          data: encodeFunctionData({
            abi: accessControllerAbi,
            functionName: "setPermission",
            args: [
              getCustomAddress(ipIdAddress, "ipIdAddress"),
              getCustomAddress(this.spgClient.address, "spgAddress"),
              getCustomAddress(this.coreMetadataModuleClient.address, "coreMetadataModuleAddress"),
              toFunctionSelector("function setAll(address,string,bytes32,bytes32)"),
              1,
            ],
          }),
        });
        object.sigMetadata = {
          signer: getCustomAddress(this.wallet.account!.address, "wallet.account.address"),
          deadline: calculatedDeadline,
          signature,
        };
      }
      let txHash: Hex;
      if (request.metadata) {
        txHash = await this.spgClient.registerIp(object);
      } else {
        txHash = await this.ipAssetRegistryClient.register({
          tokenContract: object.nftContract,
          tokenId: object.tokenId,
          chainid: chain[this.chainId],
        });
      }
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
        const isParentIpIdRegistered = await this.isRegistered(
          getCustomAddress(parentId, "request.parentIpIds"),
        );
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
            ipId: getCustomAddress(request.parentIpIds[i], "request.parentIpIds"),
            licenseTemplate:
              (request.licenseTemplate &&
                getCustomAddress(request.licenseTemplate, "request.licenseTemplate")) ||
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
      request.licenseTokenIds = request.licenseTokenIds.map((id) => BigInt(id));
      for (const licenseTokenId of request.licenseTokenIds) {
        const tokenOwnerAddress = await this.licenseTokenReadOnlyClient.ownerOf({
          tokenId: licenseTokenId,
        });
        if (!tokenOwnerAddress) {
          throw new Error(`License token id ${licenseTokenId} must be owned by the caller.`);
        }
      }
      const txHash = await this.licensingModuleClient.registerDerivativeWithLicenseTokens({
        childIpId: getCustomAddress(request.childIpId, "request.childIpId"),
        licenseTokenIds: request.licenseTokenIds,
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
   *   @param request.metadata - [Optional] The metadata for the IP.
   *   @param request.metadata.metadataURI [Optional] The URI of the metadata for the IP.
   *   @param request.metadata.metadataHash [Optional] The metadata for the IP.
   *   @param request.metadata.nftMetadataHash [Optional] The metadata for the IP NFT.
   *   @param request.recipient [Optional] The address of the recipient of the minted NFT.
   *   @param request.mintingFee [Optional] The fee to be paid when minting a license.
   *   @param request.commercialRevShare [Optional] Percentage of revenue that must be shared with the licensor.
   *   @param request.currency [Optional] The ERC20 token to be used to pay the minting fee. the token must be registered in story protocol.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash and optional IP ID, Token ID, License Terms Id if waitForTxn is set to true.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, name, uri, registrationDate)
   * @emits LicenseTermsAttached (caller, ipId, licenseTemplate, licenseTermsId)
   */
  public async mintAndRegisterIpAssetWithPilTerms(
    request: CreateIpAssetWithPilTermsRequest,
  ): Promise<CreateIpAssetWithPilTermsResponse> {
    try {
      if (request.pilType === undefined || request.pilType === null) {
        throw new Error("PIL type is required.");
      }
      const licenseTerm = getLicenseTermByType(request.pilType, {
        mintingFee: request.mintingFee,
        currency: request.currency,
        royaltyPolicyLAPAddress: this.royaltyPolicyLAPClient.address,
        commercialRevShare: request.commercialRevShare,
      });
      const object: SpgMintAndRegisterIpAndAttachPilTermsRequest = {
        nftContract: getCustomAddress(request.nftContract, "request.nftContract"),
        recipient:
          (request.recipient && getCustomAddress(request.recipient, "request.recipient")) ||
          this.wallet.account!.address,

        terms: licenseTerm,
        metadata: {
          metadataURI: "",
          metadataHash: zeroHash,
          nftMetadataHash: zeroHash,
        },
      };
      if (
        request.metadata &&
        (request.metadata.metadataHash !== zeroHash ||
          request.metadata.metadataURI !== "" ||
          request.metadata.nftMetadataHash !== zeroHash)
      ) {
        object.metadata = {
          metadataURI: request.metadata.metadataURI || object.metadata.metadataURI,
          metadataHash: request.metadata.metadataHash || object.metadata.metadataHash,
          nftMetadataHash: request.metadata.nftMetadataHash || object.metadata.nftMetadataHash,
        };
      }
      const txHash = await this.spgClient.mintAndRegisterIpAndAttachPilTerms(object);
      if (request.txOptions?.waitForTransaction) {
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        const iPRegisteredLog = this.ipAssetRegistryClient.parseTxIpRegisteredEvent(txReceipt)[0];
        const licenseTermsId =
          this.licensingModuleClient.parseTxLicenseTermsAttachedEvent(txReceipt)[0].licenseTermsId;
        return {
          txHash: txHash,
          ipId: iPRegisteredLog.ipId,
          licenseTermsId,
          tokenId: iPRegisteredLog.tokenId,
        };
      }
      return { txHash };
    } catch (error) {
      handleError(error, "Failed to mint and register IP and attach PIL terms");
    }
  }
  /**
   * Register a given NFT as an IP and attach Programmable IP License Terms.R.
   * @param request - The request object that contains all data needed to mint and register ip.
   *   @param request.nftContract The address of the NFT collection.
   *   @param request.tokenId The ID of the NFT.
   *   @param request.pilType The type of the PIL.
   *   @param request.metadata - [Optional] The desired metadata for the newly registered IP.
   *   @param request.metadata.metadataURI [Optional] The the metadata for the IP hash.
   *   @param request.metadata.metadataHash [Optional] The metadata for the IP.
   *   @param request.metadata.nftMetadataHash [Optional] The metadata for the IP NFT.
   *   @param request.deadline [Optional] The deadline for the signature in milliseconds, default is 1000ms.
   *   @param request.mintingFee [Optional] The fee to be paid when minting a license.
   *   @param request.commercialRevShare [Optional] Percentage of revenue that must be shared with the licensor.
   *   @param request.currency [Optional] The ERC20 token to be used to pay the minting fee. the token must be registered in story protocol.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash and optional IP ID, License Terms Id if waitForTxn is set to true.
   * @emits LicenseTermsAttached (caller, ipId, licenseTemplate, licenseTermsId)
   */
  public async registerIpAndAttachPilTerms(
    request: RegisterIpAndAttachPilTermsRequest,
  ): Promise<RegisterIpAndAttachPilTermsResponse> {
    try {
      if (request.pilType === undefined || request.pilType === null) {
        throw new Error("PIL type is required.");
      }
      request.tokenId = BigInt(request.tokenId);
      const ipIdAddress = await this.getIpIdAddress(request.nftContract, request.tokenId);
      const isRegistered = await this.isNftRegistered(ipIdAddress);
      if (isRegistered) {
        throw new Error(`The NFT with id ${request.tokenId} is already registered as IP.`);
      }
      const licenseTerm = getLicenseTermByType(request.pilType, {
        mintingFee: request.mintingFee,
        currency: request.currency,
        royaltyPolicyLAPAddress: this.royaltyPolicyLAPClient.address,
        commercialRevShare: request.commercialRevShare,
      });
      const calculatedDeadline = getDeadline(request.deadline);
      const sigAttachSignature = await getPermissionSignature({
        ipId: ipIdAddress,
        deadline: calculatedDeadline,
        nonce: 2,
        account: this.wallet.account as LocalAccount,
        chainId: chain[this.chainId],
        data: encodeFunctionData({
          abi: accessControllerAbi,
          functionName: "setPermission",
          args: [
            getCustomAddress(ipIdAddress, "ipIdAddress"),
            getCustomAddress(this.spgClient.address, "spgAddress"),
            getCustomAddress(this.licensingModuleClient.address, "licensingModuleAddress"),
            toFunctionSelector("function attachLicenseTerms(address,address,uint256)"),
            1,
          ],
        }),
      });
      const object: SpgRegisterIpAndAttachPilTermsRequest = {
        nftContract: getCustomAddress(request.nftContract, "request.nftContract"),
        tokenId: request.tokenId,
        terms: licenseTerm,
        metadata: {
          metadataURI: "",
          metadataHash: zeroHash,
          nftMetadataHash: zeroHash,
        },
        sigMetadata: {
          signer: zeroAddress,
          deadline: BigInt(0),
          signature: zeroHash,
        },
        sigAttach: {
          signer: getCustomAddress(this.wallet.account!.address, "wallet.account.address"),
          deadline: calculatedDeadline,
          signature: sigAttachSignature,
        },
      };

      if (
        request.metadata &&
        (request.metadata.metadataHash !== zeroHash ||
          request.metadata.metadataURI !== "" ||
          request.metadata.nftMetadataHash !== zeroHash)
      ) {
        object.metadata = {
          metadataURI: request.metadata.metadataURI || object.metadata.metadataURI,
          metadataHash: request.metadata.metadataHash || object.metadata.metadataHash,
          nftMetadataHash: request.metadata.nftMetadataHash || object.metadata.nftMetadataHash,
        };
        const signature = await getPermissionSignature({
          ipId: ipIdAddress,
          deadline: calculatedDeadline,
          nonce: 1,
          account: this.wallet.account as LocalAccount,
          chainId: chain[this.chainId],
          data: encodeFunctionData({
            abi: accessControllerAbi,
            functionName: "setPermission",
            args: [
              getCustomAddress(ipIdAddress, "ipIdAddress"),
              getCustomAddress(this.spgClient.address, "spgAddress"),
              getCustomAddress(this.coreMetadataModuleClient.address, "coreMetadataModuleAddress"),
              toFunctionSelector("function setAll(address,string,bytes32,bytes32)"),
              1,
            ],
          }),
        });
        object.sigMetadata = {
          signer: getCustomAddress(this.wallet.account!.address, "wallet.account.address"),
          deadline: calculatedDeadline,
          signature,
        };
      }
      const txHash = await this.spgClient.registerIpAndAttachPilTerms(object);
      if (request.txOptions?.waitForTransaction) {
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        const log = this.licensingModuleClient.parseTxLicenseTermsAttachedEvent(txReceipt)[0];
        return { txHash, licenseTermsId: log.licenseTermsId, ipId: log.ipId };
      }
      return { txHash };
    } catch (error) {
      handleError(error, "Failed to register IP and attach PIL terms");
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
   *   @param request.metadata - [Optional] The desired metadata for the newly registered IP.
   *   @param request.metadata.metadataURI [Optional] The URI of the metadata for the IP.
   *   @param request.metadata.metadataHash [Optional] The metadata for the IP.
   *   @param request.metadata.nftMetadataHash [Optional] The the metadata for the IP NFT.
   *   @param request.deadline [Optional] The deadline for the signature in milliseconds,default is 1000ms.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash and optional IP ID if waitForTxn is set to true.
   * @emits IPRegistered (ipId, chainId, tokenContract, tokenId, name, uri, registrationDate)
   */
  public async registerDerivativeIp(
    request: RegisterIpAndMakeDerivativeRequest,
  ): Promise<RegisterIpAndMakeDerivativeResponse> {
    try {
      const tokenId = BigInt(request.tokenId);
      const ipIdAddress = await this.getIpIdAddress(request.nftContract, tokenId);
      const isRegistered = await this.isNftRegistered(ipIdAddress);
      if (isRegistered) {
        throw new Error(`The NFT with id ${tokenId} is already registered as IP.`);
      }
      if (request.derivData.parentIpIds.length !== request.derivData.licenseTermsIds.length) {
        throw new Error("Parent IP IDs and License terms IDs must be provided in pairs.");
      }
      for (let i = 0; i < request.derivData.parentIpIds.length; i++) {
        const isAttachedLicenseTerms =
          await this.licenseRegistryReadOnlyClient.hasIpAttachedLicenseTerms({
            ipId: getCustomAddress(
              request.derivData.parentIpIds[i],
              "request.derivData.parentIpIds",
            ),
            licenseTemplate:
              (request.derivData.licenseTemplate &&
                getCustomAddress(
                  request.derivData.licenseTemplate,
                  "request.derivData.licenseTemplate",
                )) ||
              this.licenseTemplateClient.address,
            licenseTermsId: BigInt(request.derivData.licenseTermsIds[i]),
          });
        if (!isAttachedLicenseTerms) {
          throw new Error(
            `License terms id ${request.derivData.licenseTermsIds[i]} must be attached to the parent ipId ${request.derivData.parentIpIds[i]} before registering derivative.`,
          );
        }
      }
      const calculatedDeadline = getDeadline(request.deadline);

      const sigRegisterSignature = await getPermissionSignature({
        ipId: ipIdAddress,
        deadline: calculatedDeadline,
        nonce: 2,
        account: this.wallet.account as LocalAccount,
        chainId: chain[this.chainId],
        data: encodeFunctionData({
          abi: accessControllerAbi,
          functionName: "setPermission",
          args: [
            getCustomAddress(ipIdAddress, "ipIdAddress"),
            getCustomAddress(this.spgClient.address, "spgAddress"),
            getCustomAddress(this.licensingModuleClient.address, "licensingModuleAddress"),
            toFunctionSelector(
              "function registerDerivative(address,address[],uint256[],address,bytes)",
            ),
            1,
          ],
        }),
      });
      const object: SpgRegisterIpAndMakeDerivativeRequest = {
        nftContract: getCustomAddress(request.nftContract, "request.nftContract"),
        tokenId: BigInt(request.tokenId),
        derivData: {
          parentIpIds: request.derivData.parentIpIds.map((id) =>
            getCustomAddress(id, "request.derivData.parentIpIds"),
          ),
          licenseTermsIds: request.derivData.licenseTermsIds.map((id) => BigInt(id)),
          licenseTemplate:
            (request.derivData.licenseTemplate &&
              getCustomAddress(
                request.derivData.licenseTemplate,
                "request.derivData.licenseTemplate",
              )) ||
            this.licenseTemplateClient.address,
          royaltyContext: zeroAddress,
        },
        sigRegister: {
          signer: getCustomAddress(this.wallet.account!.address, "wallet.account.address"),
          deadline: calculatedDeadline,
          signature: sigRegisterSignature,
        },
        metadata: {
          metadataURI: "",
          metadataHash: zeroHash,
          nftMetadataHash: zeroHash,
        },
        sigMetadata: {
          signer: zeroAddress,
          deadline: BigInt(0),
          signature: zeroHash,
        },
      };
      if (
        request.metadata &&
        (request.metadata.metadataHash !== zeroHash ||
          request.metadata.metadataURI !== "" ||
          request.metadata.nftMetadataHash !== zeroHash)
      ) {
        object.metadata = {
          metadataURI: request.metadata.metadataURI || object.metadata.metadataURI,
          metadataHash: request.metadata.metadataHash || object.metadata.metadataHash,
          nftMetadataHash: request.metadata.nftMetadataHash || object.metadata.nftMetadataHash,
        };
        const signature = await getPermissionSignature({
          ipId: ipIdAddress,
          deadline: calculatedDeadline,
          nonce: 1,
          account: this.wallet.account as LocalAccount,
          chainId: chain[this.chainId],
          data: encodeFunctionData({
            abi: accessControllerAbi,
            functionName: "setPermission",
            args: [
              getCustomAddress(ipIdAddress, "ipIdAddress"),
              getCustomAddress(this.spgClient.address, "spgAddress"),
              getCustomAddress(this.coreMetadataModuleClient.address, "coreMetadataModuleAddress"),
              toFunctionSelector("function setAll(address,string,bytes32,bytes32)"),
              1,
            ],
          }),
        });
        object.sigMetadata = {
          signer: getCustomAddress(this.wallet.account!.address, "wallet.account.address"),
          deadline: calculatedDeadline,
          signature,
        };
      }
      const txHash = await this.spgClient.registerIpAndMakeDerivative(object);
      if (request.txOptions?.waitForTransaction) {
        const receipt = await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        const log = this.ipAssetRegistryClient.parseTxIpRegisteredEvent(receipt)[0];
        return { txHash, ipId: log.ipId };
      }
      return { txHash };
    } catch (error) {
      handleError(error, "Failed to register derivative IP");
    }
  }

  private async getIpIdAddress(
    nftContract: Address,
    tokenId: bigint | string | number,
  ): Promise<Address> {
    const ipId = await this.ipAssetRegistryClient.ipId({
      chainId: chain[this.chainId],
      tokenContract: getCustomAddress(nftContract, "nftContract"),
      tokenId: BigInt(tokenId),
    });
    return ipId;
  }

  private async isNftRegistered(ipId: Address): Promise<boolean> {
    return await this.ipAssetRegistryClient.isRegistered({ id: ipId });
  }

  private async isRegistered(ipId: Hex): Promise<boolean> {
    return await this.ipAssetRegistryClient.isRegistered({ id: getCustomAddress(ipId, "ipId") });
  }
}
