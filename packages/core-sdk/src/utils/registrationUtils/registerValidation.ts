import { Address, PublicClient, toHex, zeroAddress } from "viem";

import {
  IpAssetRegistryClient,
  LicenseRegistryReadOnlyClient,
  piLicenseTemplateAddress,
  PiLicenseTemplateReadOnlyClient,
  RoyaltyModuleReadOnlyClient,
  SpgnftImplReadOnlyClient,
  totalLicenseTokenLimitHookAddress,
} from "../../abi/generated";
import { MAX_ROYALTY_TOKEN } from "../../constants/common";
import { DeadlineInput, RevShareType } from "../../types/common";
import { ChainIds } from "../../types/config";
import {
  DerivativeData,
  LicenseTermsData,
  MaxRtsInput,
  RoyaltyShare,
} from "../../types/resources/ipAsset";
import { LicenseTerms, LicenseTermsDataInput } from "../../types/resources/license";
import {
  GetIpIdAddressConfig,
  ValidateDerivativeDataConfig,
} from "../../types/utils/registerHelper";
import { TokenSpender } from "../../types/utils/token";
import { PILFlavor } from "../pilFlavor";
import { getRevenueShare } from "../royalty";
import { getDeadline } from "../sign";
import { chain, validateAddress } from "../utils";
import { validateLicenseConfig } from "../validateLicenseConfig";

export const getPublicMinting = async (
  spgNftContract: Address,
  rpcClient: PublicClient,
): Promise<boolean> => {
  const spgNftContractImpl = new SpgnftImplReadOnlyClient(rpcClient, spgNftContract);
  return await spgNftContractImpl.publicMinting();
};

export const validateLicenseTermsData = async (
  licenseTermsData: LicenseTermsDataInput[],
  rpcClient: PublicClient,
  chainId: ChainIds,
): Promise<{
  licenseTerms: LicenseTerms[];
  licenseTermsData: LicenseTermsData[];
  maxLicenseTokens: bigint[];
}> => {
  const licenseTerms: LicenseTerms[] = [];
  const processedLicenseTermsData: LicenseTermsData[] = [];
  const maxLicenseTokens: bigint[] = [];
  for (let i = 0; i < licenseTermsData.length; i++) {
    let licenseTerm: LicenseTerms;
    const licenseTermsDataInput = licenseTermsData[i];
    if (licenseTermsDataInput.terms) {
      licenseTerm = PILFlavor.validateLicenseTerms(licenseTermsDataInput.terms, chainId);
      licenseTerm.commercialRevShare = getRevenueShare(licenseTerm.commercialRevShare);
      const royaltyModuleReadOnlyClient = new RoyaltyModuleReadOnlyClient(rpcClient);
      if (validateAddress(licenseTerm.royaltyPolicy) !== zeroAddress) {
        const isWhitelistedArbitrationPolicy =
          await royaltyModuleReadOnlyClient.isWhitelistedRoyaltyPolicy({
            royaltyPolicy: licenseTerm.royaltyPolicy,
          });
        if (!isWhitelistedArbitrationPolicy) {
          throw new Error(`The royalty policy ${licenseTerm.royaltyPolicy} is not whitelisted.`);
        }
      }

      if (validateAddress(licenseTerm.currency) !== zeroAddress) {
        const isWhitelistedRoyaltyToken =
          await royaltyModuleReadOnlyClient.isWhitelistedRoyaltyToken({
            token: licenseTerm.currency,
          });
        if (!isWhitelistedRoyaltyToken) {
          throw new Error(`The currency token ${licenseTerm.currency} is not whitelisted.`);
        }
      }
    } else if (licenseTermsDataInput.licenseTermsId !== undefined) {
      const piLicenseTemplateReadOnlyClient = new PiLicenseTemplateReadOnlyClient(rpcClient);
      const response = await piLicenseTemplateReadOnlyClient.getLicenseTerms({
        selectedLicenseTermsId: BigInt(licenseTermsDataInput.licenseTermsId),
      });
      licenseTerm = response.terms;
    } else {
      throw new Error("Either terms or licenseTermsId must be provided.");
    }

    const licensingConfig = validateLicenseConfig(licenseTermsData[i].licensingConfig);
    if (licensingConfig.mintingFee > 0 && licenseTerm.royaltyPolicy === zeroAddress) {
      throw new Error("A royalty policy must be provided when the minting fee is greater than 0.");
    }

    const maxLicenseTokensValue = licenseTermsData[i].maxLicenseTokens;
    if (maxLicenseTokensValue !== undefined) {
      if (maxLicenseTokensValue < 0) {
        throw new Error("The max license tokens must be greater than or equal to 0.");
      }
      licensingConfig.licensingHook = totalLicenseTokenLimitHookAddress[chainId];
      maxLicenseTokens[i] = BigInt(maxLicenseTokensValue);
    }
    licenseTerms.push(licenseTerm);
    processedLicenseTermsData.push({
      terms: licenseTerm,
      licensingConfig: licensingConfig,
    });
  }
  return { licenseTerms, licenseTermsData: processedLicenseTermsData, maxLicenseTokens };
};

export const getRoyaltyShares = (
  royaltyShares: RoyaltyShare[],
): { royaltyShares: RoyaltyShare[]; totalAmount: number } => {
  let actualTotal = 0;
  let sum = 0;
  const shares = royaltyShares.map((share) => {
    if (share.percentage <= 0) {
      throw new Error("The percentage of the royalty shares must be greater than 0.");
    }

    if (share.percentage > 100) {
      throw new Error("The percentage of the royalty shares must be less than or equal to 100.");
    }
    sum += share.percentage;
    if (sum > 100) {
      throw new Error("The sum of the royalty shares cannot exceeds 100.");
    }
    // use Math.trunc to avoid precision issues
    const value = Math.trunc(share.percentage * 10 ** 6);
    actualTotal += value;
    return { ...share, percentage: value };
  });
  // use Math.trunc to avoid precision issues
  return { royaltyShares: shares, totalAmount: Math.trunc(actualTotal) };
};

export const validateDerivativeData = async ({
  derivativeDataInput,
  rpcClient,
  wallet,
  chainId,
}: ValidateDerivativeDataConfig): Promise<DerivativeData> => {
  const licenseTemplateAddress = piLicenseTemplateAddress[chainId];
  const ipAssetRegistryClient = new IpAssetRegistryClient(rpcClient, wallet);
  const licenseRegistryReadOnlyClient = new LicenseRegistryReadOnlyClient(rpcClient);
  const derivativeData: DerivativeData = {
    parentIpIds: derivativeDataInput.parentIpIds,
    licenseTermsIds: derivativeDataInput.licenseTermsIds.map((id) => BigInt(id)),
    licenseTemplate: validateAddress(derivativeDataInput.licenseTemplate || licenseTemplateAddress),
    royaltyContext: zeroAddress,
    maxMintingFee: BigInt(derivativeDataInput.maxMintingFee ?? 0),
    maxRts: validateMaxRts(derivativeDataInput.maxRts),
    maxRevenueShare: getRevenueShare(
      derivativeDataInput.maxRevenueShare ?? 100,
      RevShareType.MAX_REVENUE_SHARE,
    ),
  };
  if (derivativeData.parentIpIds.length === 0) {
    throw new Error("The parent IP IDs must be provided.");
  }

  if (derivativeData.licenseTermsIds.length === 0) {
    throw new Error("The license terms IDs must be provided.");
  }

  if (derivativeData.parentIpIds.length !== derivativeData.licenseTermsIds.length) {
    throw new Error("The number of parent IP IDs must match the number of license terms IDs.");
  }

  if (derivativeData.maxMintingFee < 0) {
    throw new Error(`The maxMintingFee must be greater than 0.`);
  }

  for (let i = 0; i < derivativeData.parentIpIds.length; i++) {
    const parentId = derivativeData.parentIpIds[i];
    const isParentIpRegistered = await ipAssetRegistryClient.isRegistered({
      id: validateAddress(parentId),
    });
    if (!isParentIpRegistered) {
      throw new Error(`The parent IP with id ${parentId} is not registered.`);
    }
    const isAttachedLicenseTerms = await licenseRegistryReadOnlyClient.hasIpAttachedLicenseTerms({
      ipId: parentId,
      licenseTemplate: derivativeData.licenseTemplate,
      licenseTermsId: derivativeData.licenseTermsIds[i],
    });
    if (!isAttachedLicenseTerms) {
      throw new Error(
        `License terms id ${derivativeData.licenseTermsIds[i]} must be attached to the parent ipId ${derivativeData.parentIpIds[i]} before registering derivative.`,
      );
    }
    const { royaltyPercent } = await licenseRegistryReadOnlyClient.getRoyaltyPercent({
      ipId: parentId,
      licenseTemplate: derivativeData.licenseTemplate,
      licenseTermsId: derivativeData.licenseTermsIds[i],
    });
    if (derivativeData.maxRevenueShare !== 0 && royaltyPercent > derivativeData.maxRevenueShare) {
      throw new Error(
        `The royalty percent for the parent IP with id ${parentId} is greater than the maximum revenue share ${derivativeData.maxRevenueShare}.`,
      );
    }
  }
  return derivativeData;
};

export const validateMaxRts = (maxRts: MaxRtsInput | undefined): number => {
  if (maxRts === undefined) {
    return MAX_ROYALTY_TOKEN;
  } else if (maxRts < 0 || maxRts > MAX_ROYALTY_TOKEN) {
    throw new Error(`The maxRts must be greater than 0 and less than ${MAX_ROYALTY_TOKEN}.`);
  }
  return maxRts;
};

export const getIpIdAddress = async ({
  nftContract,
  tokenId,
  rpcClient,
  wallet,
  chainId,
}: GetIpIdAddressConfig): Promise<Address> => {
  const ipAssetRegistryClient = new IpAssetRegistryClient(rpcClient, wallet);
  const ipId = await ipAssetRegistryClient.ipId({
    chainId: BigInt(chain[chainId]),
    tokenContract: validateAddress(nftContract),
    tokenId: BigInt(tokenId),
  });
  return ipId;
};

export const getCalculatedDeadline = async (
  rpcClient: PublicClient,
  requestDeadline?: DeadlineInput,
): Promise<bigint> => {
  const blockTimestamp = (await rpcClient.getBlock()).timestamp;
  return getDeadline(blockTimestamp, requestDeadline);
};

export const mergeSpenders = (
  previousSpenders: TokenSpender[],
  newSpenders: TokenSpender[],
): TokenSpender[] => {
  if (!newSpenders || newSpenders.length === 0) {
    return previousSpenders;
  }

  return newSpenders.reduce(
    (acc, spender) => {
      if (!spender || !spender.address) {
        return acc;
      }

      const existingSpender = acc.find(
        (s) => s.address === spender.address && s.token === spender.token,
      );
      if (!existingSpender) {
        acc.push({ ...spender, amount: spender.amount || 0n });
      } else {
        existingSpender.amount = (existingSpender.amount || 0n) + (spender.amount || 0n);
      }

      return acc;
    },
    [...previousSpenders],
  );
};

export const hasMinterRole = async (
  spgNftContract: Address,
  rpcClient: PublicClient,
  walletAddress: Address,
): Promise<boolean> => {
  const spgNftContractImpl = new SpgnftImplReadOnlyClient(rpcClient, spgNftContract);
  const minterRole = toHex(1, { size: 32 });
  return await spgNftContractImpl.hasRole({
    role: minterRole,
    account: walletAddress,
  });
};
