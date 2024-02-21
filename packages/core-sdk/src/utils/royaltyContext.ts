import { StoryAPIClient } from "../clients/storyAPI";
import { RoyaltyContext } from "../types/resources/royalty";
import { typedDataToBytes } from "./utils";
import { Hex } from "../types/common";

export async function computeRoyaltyContext(
  licenseIds: string[],
  storyClient: StoryAPIClient,
): Promise<RoyaltyContext> {
  const royaltyContext: RoyaltyContext = {
    targetAncestors: [],
    targetRoyaltyAmount: [],
    parentAncestors1: [],
    parentAncestors2: [],
    parentAncestorsRoyalties1: [],
    parentAncestorsRoyalties2: [],
  };

  for (let i = 0; i < licenseIds.length; i++) {
    const licenseData = await storyClient.getLicense(licenseIds[i]);
    const royaltyPolicy = await storyClient.getRoyaltyPolicy(licenseData.licensorIpId);
    const policy = await storyClient.getPolicy(licenseData.policyId);

    if (royaltyPolicy) {
      const targetRoyaltyAmount = royaltyPolicy.targetRoyaltyAmount.map((e) => parseInt(e));
      if (i === 0) {
        royaltyContext.parentAncestors1 = royaltyPolicy.targetAncestors;
        royaltyContext.parentAncestorsRoyalties1 = targetRoyaltyAmount;
      } else {
        royaltyContext.parentAncestors2 = royaltyPolicy.targetAncestors;
        royaltyContext.parentAncestorsRoyalties2 = targetRoyaltyAmount;
      }
      updateRoyaltyContext(
        royaltyContext,
        [licenseData.licensorIpId],
        [parseInt(policy.pil.commercialRevShare)],
      );
      updateRoyaltyContext(royaltyContext, royaltyPolicy.targetAncestors, targetRoyaltyAmount);
    }
  }
  return royaltyContext;
}

export function encodeRoyaltyContext(royaltyContext: RoyaltyContext): Hex {
  return typedDataToBytes({
    interface: "(address[], uint32[], address[], address[], uint32[], uint32[])",
    data: [
      [
        royaltyContext.targetAncestors,
        royaltyContext.targetRoyaltyAmount,
        royaltyContext.parentAncestors1,
        royaltyContext.parentAncestors2,
        royaltyContext.parentAncestorsRoyalties1,
        royaltyContext.parentAncestorsRoyalties2,
      ],
    ],
  });
}

function updateRoyaltyContext(
  royaltyContext: RoyaltyContext,
  targetAncestors: string[],
  targetRoyaltyAccounts: number[],
) {
  for (let i = 0; i < targetAncestors.length; i++) {
    const index = royaltyContext.targetAncestors.indexOf(targetAncestors[i]);
    if (index === -1) {
      royaltyContext.targetAncestors.push(targetAncestors[i]);
      royaltyContext.targetRoyaltyAmount.push(targetRoyaltyAccounts[i]);
    } else {
      royaltyContext.targetRoyaltyAmount[index] += targetRoyaltyAccounts[i];
    }
  }
}
