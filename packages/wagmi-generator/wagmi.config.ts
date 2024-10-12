import { defineConfig } from "@wagmi/cli";
import { sdk } from "./sdk";
import type { Evaluate } from "@wagmi/cli/src/types";
import type { ContractConfig } from "@wagmi/cli/src/config";
import { resolveProxyContracts } from "./resolveProxyContracts";
import { optimizedBlockExplorer } from "./optimizedBlockExplorer";
const iliadChainId = 1513;
import "dotenv/config";

export default defineConfig(async () => {
  const contracts: Evaluate<Omit<ContractConfig, "abi">>[] = [
    {
      name: "AccessController",
      address: {
        [iliadChainId]: "0xa8bF970E95278A7aF475CE13C24cdcC3a2234a3D",
      },
    },
    {
      name: "DisputeModule",
      address: {
        [iliadChainId]: "0xD082824B244Edcc5Bb5e67cD96a7d5a189c7E247",
      },
    },
    {
      name: "IPAccountImpl",
      address: {
        [iliadChainId]: "0x778159888076ADF6A574081346AF5837453885dE",
      },
    },
    {
      name: "IPAssetRegistry",
      address: {
        [iliadChainId]: "0x1a9d0d28a0422F26D31Be72Edc6f13ea4371E11B",
      },
    },
    {
      name: "IpRoyaltyVaultImpl",
      address: {
        [iliadChainId]: "0x9b7Ae229653251c6090324800D7E46435853C069",
      },
    },
    {
      name: "LicenseRegistry",
      address: {
        [iliadChainId]: "0xedf8e338F05f7B1b857C3a8d3a0aBB4bc2c41723",
      },
    },
    {
      name: "LicenseToken",
      address: {
        [iliadChainId]: "0xc7A302E03cd7A304394B401192bfED872af501BE",
      },
    },
    {
      name: "LicensingModule",
      address: {
        [iliadChainId]: "0xd81fd78f557b457b4350cB95D20b547bFEb4D857",
      },
    },
    {
      name: "PILicenseTemplate",
      address: {
        [iliadChainId]: "0x0752f61E59fD2D39193a74610F1bd9a6Ade2E3f9",
      },
    },
    {
      name: "ModuleRegistry",
      address: {
        [iliadChainId]: "0x7b3ba7839F5754B02531Aa84680637f78CB476c0",
      },
    },
    {
      name: "RoyaltyModule",
      address: {
        [iliadChainId]: "0x3C27b2D7d30131D4b58C3584FD7c86e3358744de",
      },
    },
    {
      name: "RoyaltyPolicyLAP",
      address: {
        [iliadChainId]: "0x4074CEC2B3427f983D14d0C5E962a06B7162Ab92",
      },
    },
    {
      name: "RoyaltyPolicyLRP",
      address: {
        [iliadChainId]: "0x7F6a8f43EC6059eC80C172441CEe3423988a0be9",
      },
    },
    {
      name: "SPG",
      address: {
        [iliadChainId]: "0xAceb5E631d743AF76aF69414eC8D356c13435E59",
      },
    },
    {
      name: "SPGNFTBeacon",
      address: {
        [iliadChainId]: "0x769A0F5197D427a7fC4378317437e924c8c74b33",
      },
    },
    {
      name: "SPGNFTImpl",
      address: {
        [iliadChainId]: "0x92C7c6805DF9B936888e5daC865111dF028846E5",
      },
    },
    {
      name: "CoreMetadataModule",
      address: {
        [iliadChainId]: "0x56eFacFCcacfdEbd1d6E3C4071CaCDEbA0902f04",
      },
    },
    {
      name: "DerivativeWorkflows",
      address: {
        [iliadChainId]: "0xdAe4A3134c33C4aD24cF2907C8f73Acdb58649be",
      },
    },
    {
      name: "GroupingWorkflows",
      address: {
        [iliadChainId]: "0x81d717d320Af60805c85B5aD60b506D6e9920584",
      },
    },
    {
      name: "RegistrationWorkflows",
      address: {
        [iliadChainId]: "0x601C24bFA5Ae435162A5dC3cd166280C471d16c8",
      },
    },
    {
      name: "RoyaltyWorkflows",
      address: {
        [iliadChainId]: "0x24f571e4982163bC166E594De289D6b754cB82A5",
      },
    },
    {
      name: "LicenseAttachmentWorkflows",
      address: {
        [iliadChainId]: "0x96D26F998a56D6Ee34Fb581d26aAEb94e71e3929",
      },
    },
    {
      name: "GroupingModule",
      address: {
        [iliadChainId]: "0x26Eb59B900FD158396931d2349Fd6B08f0390e76",
      },
    },
    {
      name: "MockEvenSplitGroupPool",
      address: {
        [iliadChainId]: "0x69e0D5123bc0539a87a9dDcE82E803575e35cbb4",
      },
    },
  ];
  return {
    out: "../core-sdk/src/abi/generated.ts",
    contracts: [],
    plugins: [
      optimizedBlockExplorer({
        baseUrl: "https://testnet.storyscan.xyz/api",
        name: "iliad",
        getAddress: await resolveProxyContracts({
          baseUrl: "https://testnet.storyrpc.io",
          contracts: contracts,
          chainId: iliadChainId,
        }),
        contracts: contracts,
      }),
      sdk({
        permissionLessSDK: true,
        whiteList: {
          AccessController: [
            "PermissionSet",
            "setPermission",
            "setAllPermissions",
            "setBatchPermissions",
          ],
          DisputeModule: [
            "DisputeCancelled",
            "DisputeRaised",
            "DisputeResolved",
            "cancelDispute",
            "raiseDispute",
            "resolveDispute",
          ],
          IPAccountImpl: ["execute", "executeWithSig", "state", "token"],
          IPAssetRegistry: [
            "IPRegistered",
            "ipId",
            "isRegistered",
            "register",
            "IPAccountRegistered",
          ],
          IpRoyaltyVaultImpl: [
            "claimRevenueBySnapshotBatch",
            "claimRevenueByTokenBatch",
            "claimableRevenue",
            "collectRoyaltyTokens",
            "ipId",
            "RoyaltyTokensCollected",
            "snapshot",
            "SnapshotCompleted",
            "RevenueTokenClaimed",
          ],
          PiLicenseTemplate: [
            "getLicenseTermsId",
            "registerLicenseTerms",
            "LicenseTermsRegistered",
          ],
          LicensingModule: [
            "attachLicenseTerms",
            "mintLicenseTokens",
            "LicenseTokensMinted",
            "registerDerivativeWithLicenseTokens",
            "registerDerivative",
            "getLicenseTerms",
            "LicenseTermsAttached",
            "predictMintingLicenseFee",
          ],
          ModuleRegistry: ["isRegistered", "getDefaultLicenseTerms"],
          RoyaltyModule: [
            "payRoyaltyOnBehalf",
            "isWhitelistedRoyaltyPolicy",
            "isWhitelistedRoyaltyToken",
            "ipRoyaltyVaults",
          ],
          RoyaltyPolicyLAP: ["onRoyaltyPayment", "getRoyaltyData"],
          LicenseToken: ["ownerOf"],
          SPG: ["CollectionCreated"],
          GroupingWorkflows: [
            "mintAndRegisterIpAndAttachLicenseAndAddToGroup",
            "registerIpAndAttachLicenseAndAddToGroup",
            "registerGroupAndAttachLicense",
            "registerGroupAndAttachLicenseAndAddIps",
          ],
          DerivativeWorkflows: [
            "mintAndRegisterIpAndMakeDerivativeWithLicenseTokens",
            "registerIpAndMakeDerivative",
            "mintAndRegisterIpAndMakeDerivative",
            "registerIpAndMakeDerivativeWithLicenseTokens",
            "mintAndRegisterIpAndMakeDerivativeWithLicenseTokens",
          ],
          RegistrationWorkflows: [
            "createCollection",
            "mintAndRegisterIp",
            "registerIp",
            "CollectionCreated",
          ],
          LicenseAttachmentWorkflows: [
            "registerPILTermsAndAttach",
            "registerIpAndAttachPILTerms",
            "mintAndRegisterIpAndAttachPILTerms",
          ],
          RoyaltyWorkflows: [
            "transferToVaultAndSnapshotAndClaimByTokenBatch",
            "transferToVaultAndSnapshotAndClaimBySnapshotBatch",
            "snapshotAndClaimByTokenBatch",
            "snapshotAndClaimBySnapshotBatch",
          ],
        },
      }),
    ],
  };
});
