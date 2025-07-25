import { MAX_ROYALTY_TOKEN } from "../constants/common";
import { RevShareType } from "../types/common";

export const getRevenueShare = (
  revShare: number | string,
  type: RevShareType = RevShareType.COMMERCIAL_REVENUE_SHARE,
): number => {
  const revShareNumber = Number(revShare);
  if (isNaN(revShareNumber)) {
    throw new Error(`${type} must be a valid number.`);
  }

  if (revShareNumber < 0 || revShareNumber > 100) {
    throw new Error(`${type} must be between 0 and 100.`);
  }
  return (revShareNumber / 100) * MAX_ROYALTY_TOKEN;
};
