import { Address, PublicClient, zeroAddress } from "viem";

import {
  licensingModuleAbi,
  licensingModuleAddress,
  LicensingModulePredictMintingLicenseFeeRequest,
  LicensingModulePredictMintingLicenseFeeResponse,
  SpgnftImplReadOnlyClient,
} from "../abi/generated";
import { ChainIds } from "../types/config";
import { CalculateDerivativeMintingFeeConfig } from "../types/utils/registerHelper";
import { WIP_TOKEN_ADDRESS } from "../constants/common";

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

export const calculateDerivativeMintingFee = async ({
  derivData,
  rpcClient,
  chainId,
  wallet,
  sender,
}: CalculateDerivativeMintingFeeConfig): Promise<bigint> => {
  const walletAddress = sender || wallet.account!.address;
  let totalDerivativeMintingFee = 0n;
  for (let i = 0; i < derivData.parentIpIds.length; i++) {
    const derivativeMintingFee = await calculateLicenseWipMintFee({
      predictMintingFeeRequest: {
        licensorIpId: derivData.parentIpIds[i],
        licenseTemplate: derivData.licenseTemplate,
        licenseTermsId: derivData.licenseTermsIds[i],
        receiver: walletAddress,
        amount: 1n,
        royaltyContext: zeroAddress,
      },
      rpcClient,
      chainId,
      walletAddress,
    });
    totalDerivativeMintingFee += derivativeMintingFee;
  }
  return totalDerivativeMintingFee;
};

export const calculateLicenseWipMintFee = async ({
  predictMintingFeeRequest,
  rpcClient,
  chainId,
  walletAddress,
}: PredictMintingLicenseFeeParams) => {
  const fee = await predictMintingLicenseFee({
    predictMintingFeeRequest,
    rpcClient,
    chainId,
    walletAddress,
  });
  if (fee.currencyToken !== WIP_TOKEN_ADDRESS) {
    return 0n;
  }
  return fee.tokenAmount;
};
export const calculateSPGWipMintFee = async (spgNftClient: SpgnftImplReadOnlyClient) => {
  const token = await spgNftClient.mintFeeToken();
  if (token !== WIP_TOKEN_ADDRESS) {
    return 0n;
  }
  return await spgNftClient.mintFee();
};
