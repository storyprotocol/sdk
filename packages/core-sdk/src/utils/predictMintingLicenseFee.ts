import { Address, PublicClient } from "viem";

import {
  licensingModuleAbi,
  licensingModuleAddress,
  LicensingModulePredictMintingLicenseFeeRequest,
  LicensingModulePredictMintingLicenseFeeResponse,
} from "../abi/generated";
import { ChainIds } from "../types/config";

export type PredictMintingLicenseFeeParams = {
  predictMintingFeeRequest: LicensingModulePredictMintingLicenseFeeRequest;
  rpcClient: PublicClient;
  chainId: ChainIds;
  walletAddress: Address;
};
/**
 * Predict the minting license fee.
 *
 * @remarks
 * The method passes `walletAddress` to the `readContract` function so the smart contract can verify
 * if the wallet is the owner of the IP ID. The wallet address is required when using the default license terms ID.
 */
export const predictMintingLicenseFee = async ({
  predictMintingFeeRequest,
  rpcClient,
  chainId,
  walletAddress,
}: PredictMintingLicenseFeeParams): Promise<LicensingModulePredictMintingLicenseFeeResponse> => {
  const result = await rpcClient.readContract({
    abi: licensingModuleAbi,
    address: licensingModuleAddress[chainId],
    functionName: "predictMintingLicenseFee",
    args: [
      predictMintingFeeRequest.licensorIpId,
      predictMintingFeeRequest.licenseTemplate,
      predictMintingFeeRequest.licenseTermsId,
      predictMintingFeeRequest.amount,
      predictMintingFeeRequest.receiver,
      predictMintingFeeRequest.royaltyContext,
    ],
    account: walletAddress,
  });
  return {
    currencyToken: result[0],
    tokenAmount: result[1],
  };
};
