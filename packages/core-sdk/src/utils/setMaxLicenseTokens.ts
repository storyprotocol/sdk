import { Address, Hash } from "viem";

import { TotalLicenseTokenLimitHookClient } from "../abi/generated";
import { LicenseTermsDataInput } from "../types/resources/license";

export type SetMaxLicenseTokens = {
  maxLicenseTokensData: (LicenseTermsDataInput | { maxLicenseTokens: bigint })[];
  licensorIpId: Address;
  licenseTermsIds: bigint[];
  totalLicenseTokenLimitHookClient: TotalLicenseTokenLimitHookClient;
  templateAddress: Address;
};

export const setMaxLicenseTokens = async ({
  maxLicenseTokensData,
  licensorIpId,
  licenseTermsIds,
  totalLicenseTokenLimitHookClient,
  templateAddress,
}: SetMaxLicenseTokens): Promise<Hash[]> => {
  const licenseTermsMaxLimitTxHashes: Hash[] = [];
  for (let i = 0; i < maxLicenseTokensData.length; i++) {
    const maxLicenseTokens = maxLicenseTokensData[i].maxLicenseTokens;
    if (maxLicenseTokens === undefined || maxLicenseTokens < 0n) {
      continue;
    }
    const txHash = await totalLicenseTokenLimitHookClient.setTotalLicenseTokenLimit({
      licensorIpId,
      licenseTemplate: templateAddress,
      licenseTermsId: licenseTermsIds[i],
      limit: BigInt(maxLicenseTokens),
    });
    if (txHash) {
      licenseTermsMaxLimitTxHashes.push(txHash);
    }
  }
  return licenseTermsMaxLimitTxHashes;
};
