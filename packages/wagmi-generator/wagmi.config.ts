import { defineConfig } from "@wagmi/cli";
import { sdk } from "./sdk";
import type { Evaluate } from "@wagmi/cli/src/types";
import type { ContractConfig } from "@wagmi/cli/src/config";
import { resolveProxyContracts } from "./resolveProxyContracts";
import { optimizedBlockExplorer } from "./optimizedBlockExplorer";
const odysseyChainId = 1516;
import "dotenv/config";

export default defineConfig(async () => {
  const contracts: Evaluate<Omit<ContractConfig, "abi">>[] = [
    {
      name: "AccessController",
      address: {
        [odysseyChainId]: "0xa8bF970E95278A7aF475CE13C24cdcC3a2234a3D",
      },
    },
    {
      name: "DisputeModule",
      address: {
        [odysseyChainId]: "0xD082824B244Edcc5Bb5e67cD96a7d5a189c7E247",
      },
    },
    {
      name: "IPAccountImpl",
      address: {
        [odysseyChainId]: "0x778159888076ADF6A574081346AF5837453885dE",
      },
    },
    {
      name: "IPAssetRegistry",
      address: {
        [odysseyChainId]: "0x1a9d0d28a0422F26D31Be72Edc6f13ea4371E11B",
      },
    },
    {
      name: "IpRoyaltyVaultImpl",
      address: {
        [odysseyChainId]: "0x9b7Ae229653251c6090324800D7E46435853C069",
      },
    },
    {
      name: "LicenseRegistry",
      address: {
        [odysseyChainId]: "0xedf8e338F05f7B1b857C3a8d3a0aBB4bc2c41723",
      },
    },
    {
      name: "LicenseToken",
      address: {
        [odysseyChainId]: "0xc7A302E03cd7A304394B401192bfED872af501BE",
      },
    },
    {
      name: "LicensingModule",
      address: {
        [odysseyChainId]: "0xd81fd78f557b457b4350cB95D20b547bFEb4D857",
      },
    },
    {
      name: "PILicenseTemplate",
      address: {
        [odysseyChainId]: "0x0752f61E59fD2D39193a74610F1bd9a6Ade2E3f9",
      },
    },
    {
      name: "ModuleRegistry",
      address: {
        [odysseyChainId]: "0x7b3ba7839F5754B02531Aa84680637f78CB476c0",
      },
    },
    {
      name: "RoyaltyModule",
      address: {
        [odysseyChainId]: "0x3C27b2D7d30131D4b58C3584FD7c86e3358744de",
      },
    },
    {
      name: "RoyaltyPolicyLAP",
      address: {
        [odysseyChainId]: "0x4074CEC2B3427f983D14d0C5E962a06B7162Ab92",
      },
    },
    {
      name: "RoyaltyPolicyLRP",
      address: {
        [odysseyChainId]: "0x7F6a8f43EC6059eC80C172441CEe3423988a0be9",
      },
    },
    {
      name: "SPGNFTBeacon",
      address: {
        [odysseyChainId]: "0xD753c698aE69194C851d60BF759d537DE7477696",
      },
    },
    {
      name: "SPGNFTImpl",
      address: {
        [odysseyChainId]: "0xA12e66a4429c9B7f38893c9b00E80646e0e76446",
      },
    },
    {
      name: "CoreMetadataModule",
      address: {
        [odysseyChainId]: "0x56eFacFCcacfdEbd1d6E3C4071CaCDEbA0902f04",
      },
    },
    {
      name: "DerivativeWorkflows",
      address: {
        [odysseyChainId]: "0xE0e1d222E024bF14B1e0A4b48fC6e6B6F8ebaEB3",
      },
    },
    {
      name: "GroupingWorkflows",
      address: {
        [odysseyChainId]: "0xfAa9CCd49DCDfB9a950CBF036cD6082e623a6bcC",
      },
    },
    {
      name: "RegistrationWorkflows",
      address: {
        [odysseyChainId]: "0x8D8E0d24E7B6420d3209EfA185Fa451c95D8316A",
      },
    },
    {
      name: "RoyaltyWorkflows",
      address: {
        [odysseyChainId]: "0x19E435b1C0857375F9423C8ba508203054CE1d9F",
      },
    },
    {
      name: "LicenseAttachmentWorkflows",
      address: {
        [odysseyChainId]: "0xC7A40c41Cbe44C6B326447081877d69F98127C59",
      },
    },
    {
      name: "GroupingModule",
      address: {
        [odysseyChainId]: "0x26Eb59B900FD158396931d2349Fd6B08f0390e76",
      },
    },
    {
      name: "EvenSplitGroupPool",
      address: {
        [odysseyChainId]: "0x764842EaEFDc176B673Bd44e6F5c3Db38F8baA54",
      },
    },
    // {
    //   name: "ArbitrationPolicySP",
    //   address: {
    //     [odysseyChainId]: "0x8038697357F63415e848785e45B00eB60BcD797b",
    //   },
    // },
    {
      name: "MockERC20",
      address: {
        [odysseyChainId]: "0x2C30F1a7fD58806f57930063850BCBcFf81b46e8",
      },
    },
  ];
  return {
    out: "../core-sdk/src/abi/generated.ts",
    contracts: [],
    plugins: [
      optimizedBlockExplorer({
        baseUrl: "https://odyssey-testnet-explorer.storyscan.xyz/api",
        name: "Odyssey",
        getAddress: await resolveProxyContracts({
          baseUrl: "https://odyssey.storyrpc.io/",
          contracts: contracts,
          chainId: odysseyChainId,
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
            "claimRevenueByTokenBatch",
            "claimableRevenue",
            "collectRoyaltyTokens",
            "ipId",
            "RoyaltyTokensCollected",
            "snapshot",
            "SnapshotCompleted",
            "RevenueTokenClaimed",
            "claimRevenueOnBehalfBySnapshotBatch",
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
