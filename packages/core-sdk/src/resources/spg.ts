import { PublicClient, getAddress, toHex, zeroAddress } from "viem";

import {
  PiLicenseTemplateClient,
  RoyaltyPolicyLapClient,
  SimpleWalletClient,
  SpgClient,
  SpgMintAndRegisterIpAndAttachPilTermsRequest,
  SpgRegisterIpAndMakeDerivativeRequest,
} from "../abi/generated";
import { handleError } from "../utils/errors";
import {
  CreateSPGNFTCollectionRequest,
  CreateSPGNFTCollectionResponse,
  MintAndRegisterIpAndAttachPilTermsRequest,
  RegisterIpAndMakeDerivativeRequest,
} from "../types/resources/spg";
import { PIL_TYPE } from "../types/resources/license";
import { getLicenseTermByType } from "../utils/getLicenseTermsByType";

export class SPGClient {
  public spgClient: SpgClient;
  public royaltyPolicyLAPClient: RoyaltyPolicyLapClient;
  public licenseTemplateClient: PiLicenseTemplateClient;
  private readonly rpcClient: PublicClient;
  private readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient) {
    this.rpcClient = rpcClient;
    this.wallet = wallet;
    this.spgClient = new SpgClient(rpcClient, wallet);
    this.royaltyPolicyLAPClient = new RoyaltyPolicyLapClient(rpcClient, wallet);
    this.licenseTemplateClient = new PiLicenseTemplateClient(rpcClient, wallet);
  }

  /**
   * Creates a new SPG NFT Collection.
   * @param request - The request object containing necessary data to create a SPG NFT Collection.
   *   @param request.name - The name of the collection.
   *   @param request.symbol - The symbol of the collection.
   *   @param request.maxSupply - The maximum supply of the collection.
   *   @param request.mintCost - The cost to mint a token.
   *   @param request.mintToken - The token to mint.
   *   @param request.owner - The owner of the collection.
   *   @param request.txOptions - Optional transaction options.
   * @returns A Promise that resolves to a CreateSPGNFTCollectionResponse containing the transaction hash and collection address.
   * @emits CollectionCreated (nftContract);
   */
  public async createSPGNFTCollection(
    request: CreateSPGNFTCollectionRequest,
  ): Promise<CreateSPGNFTCollectionResponse> {
    try {
      if (BigInt(request.mintCost) < 0n) {
        throw new Error("Mint cost is greater than 0.");
      }

      const txHash = await this.spgClient.createCollection({
        name: request.name,
        symbol: request.symbol,
        maxSupply: request.maxSupply,
        mintCost: BigInt(request.mintCost),
        mintToken: (request.mintToken && getAddress(request.mintToken)) ?? zeroAddress,
        owner: (request.owner && getAddress(request.owner)) || this.wallet.account!.address,
      });

      if (request.txOptions?.waitForTransaction) {
        const txReceipt = await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        const targetLogs = this.spgClient.parseTxCollectionCreatedEvent(txReceipt);
        return {
          txHash: txHash,
          nftContract: targetLogs[0].nftContract,
        };
      }
      return { txHash: txHash };
    } catch (error) {
      handleError(error, "Failed to create a SPG NFT collection");
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
  public async registerDerivativeIp(request: RegisterIpAndMakeDerivativeRequest) {
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
  public async mintAndRegisterIpAndAttachPilTerms(
    request: MintAndRegisterIpAndAttachPilTermsRequest,
  ) {
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
}
