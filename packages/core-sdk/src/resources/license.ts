import { PublicClient, WalletClient } from "viem";

import { StoryAPIClient } from "../clients/storyAPI";
import { LicenseRegistryEventClient, LicensingModuleClient } from "../abi/generated";

export class LicenseClient {
  private readonly wallet: WalletClient;
  private readonly rpcClient: PublicClient;
  private readonly storyClient: StoryAPIClient;
  public licenseRegistryClient: LicenseRegistryEventClient;
  public licensingModuleClient: LicensingModuleClient;

  constructor(rpcClient: PublicClient, wallet: WalletClient, storyClient: StoryAPIClient) {
    this.wallet = wallet;
    this.rpcClient = rpcClient;
    this.storyClient = storyClient;
    this.licenseRegistryClient = new LicenseRegistryEventClient(this.rpcClient);
    this.licensingModuleClient = new LicensingModuleClient(this.rpcClient, this.wallet);
  }

  // /**
  //  * Mints license NFTs representing a policy granted by a set of ipIds (licensors). This NFT needs to be
  //  * burned in order to link a derivative IP with its parents. If this is the first combination of policy and
  //  * licensors, a new licenseId will be created. If not, the license is fungible and an id will be reused.
  //  * @dev Only callable by the licensing module.
  //  * @param request The request object containing necessary data to mint a license.
  //  *   @param request.policyId The ID of the policy to be minted
  //  *   @param request.licensorIpId_ The ID of the IP granting the license (ie. licensor)
  //  *   @param request.mintAmount Number of licenses to mint. License NFT is fungible for same policy and same licensors
  //  *   @param request.receiver Receiver address of the minted license NFT(s).
  //  * @returns licenseId The ID of the minted license NFT(s).
  //  */
  // public async mintLicense(request: MintLicenseRequest): Promise<MintLicenseResponse> {
  //   try {
  //     const royaltyContext: RoyaltyContext = {
  //       targetAncestors: [],
  //       targetRoyaltyAmount: [],
  //       parentAncestors1: [],
  //       parentAncestors2: [],
  //       parentAncestorsRoyalties1: [],
  //       parentAncestorsRoyalties2: [],
  //     };
  //
  //     const royaltyPolicy = await this.storyClient.getRoyaltyPolicy(request.licensorIpId);
  //     if (royaltyPolicy) {
  //       royaltyContext.targetAncestors.push(...royaltyPolicy.targetAncestors);
  //       const targetRoyaltyAmount = royaltyPolicy.targetRoyaltyAmount.map((e) => parseInt(e));
  //       royaltyContext.targetRoyaltyAmount.push(...targetRoyaltyAmount);
  //     }
  //
  //     const txHash = await this.licensingModuleClient.mintLicense({
  //       policyId: parseToBigInt(request.policyId),
  //       licensorIpId: request.licensorIpId,
  //       amount: parseToBigInt(request.mintAmount),
  //       receiver: getAddress(request.receiverAddress),
  //       royaltyContext: encodeRoyaltyContext(royaltyContext),
  //     });
  //
  //     if (request.txOptions?.waitForTransaction) {
  //       const txReceipt = await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
  //       const targetLogs = this.licenseRegistryClient.parseTxTransferSingleEvent(txReceipt);
  //
  //       return { txHash: txHash, licenseId: targetLogs[0].id.toString() };
  //     } else {
  //       return { txHash: txHash };
  //     }
  //   } catch (error) {
  //     handleError(error, "Failed to mint license");
  //   }
  // }

  // public async linkIpToParent(request: LinkIpToParentRequest): Promise<LinkIpToParentResponse> {
  //   try {
  //     const ipAccountClient = new IpAccountImplClient(
  //       this.rpcClient,
  //       this.wallet,
  //       getAddress(request.childIpId),
  //     );
  //
  //     const licenseIds: bigint[] = [];
  //     request.licenseIds.forEach(function (licenseId) {
  //       licenseIds.push(parseToBigInt(licenseId));
  //     });
  //
  //     const royaltyContext: RoyaltyContext = await computeRoyaltyContext(
  //       request.licenseIds,
  //       this.storyClient,
  //     );
  //
  //     const txHash = await ipAccountClient.execute({
  //       to: this.licensingModuleClient.address,
  //       value: parseToBigInt(0),
  //       data: encodeFunctionData({
  //         abi: licensingModuleAbi,
  //         functionName: "linkIpToParents",
  //         args: [licenseIds, getAddress(request.childIpId), encodeRoyaltyContext(royaltyContext)],
  //       }),
  //     });
  //
  //     if (request.txOptions?.waitForTransaction) {
  //       await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
  //       return { txHash: txHash, success: true };
  //     } else {
  //       return { txHash: txHash };
  //     }
  //   } catch (error) {
  //     handleError(error, "Failed to link IP to parents");
  //   }
  // }
}
