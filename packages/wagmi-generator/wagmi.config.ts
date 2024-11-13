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
        [odysseyChainId]: "0xf709c8001E94e2ca6F98b7fFBCd5BD3943E46D81",
      },
    },
    {
      name: "DisputeModule",
      address: {
        [odysseyChainId]: "0x692B47fa72eE7Ac0Ec617ea384a0cAD41098F712",
      },
    },
    {
      name: "IPAccountImpl",
      address: {
        [odysseyChainId]: "0x24F08796561d6E1AC08e82b68BF4d9500B374Af6",
      },
    },
    {
      name: "IPAssetRegistry",
      address: {
        [odysseyChainId]: "0x28E59E91C0467e89fd0f0438D47Ca839cDfEc095",
      },
    },
    {
      name: "IpRoyaltyVaultImpl",
      address: {
        [odysseyChainId]: "0x1081250219B16cc3903Aa2d2d1403A75c6A2F9f5",
      },
    },
    {
      name: "LicenseRegistry",
      address: {
        [odysseyChainId]: "0xBda3992c49E98392e75E78d82B934F3598bA495f",
      },
    },
    {
      name: "LicenseToken",
      address: {
        [odysseyChainId]: "0xB138aEd64814F2845554f9DBB116491a077eEB2D",
      },
    },
    {
      name: "LicensingModule",
      address: {
        [odysseyChainId]: "0x5a7D9Fa17DE09350F481A53B470D798c1c1aabae",
      },
    },
    {
      name: "PILicenseTemplate",
      address: {
        [odysseyChainId]: "0x58E2c909D557Cd23EF90D14f8fd21667A5Ae7a93",
      },
    },
    {
      name: "ModuleRegistry",
      address: {
        [odysseyChainId]: "0x9F18c5723BC4Ee447CF9B01a8543D3b08b7F09C7",
      },
    },
    {
      name: "RoyaltyModule",
      address: {
        [odysseyChainId]: "0xEa6eD700b11DfF703665CCAF55887ca56134Ae3B",
      },
    },
    {
      name: "RoyaltyPolicyLAP",
      address: {
        [odysseyChainId]: "0x28b4F70ffE5ba7A26aEF979226f77Eb57fb9Fdb6",
      },
    },
    {
      name: "RoyaltyPolicyLRP",
      address: {
        [odysseyChainId]: "0x7D2d9af4E4ab14Afcfd86436BC348928B40963Dd",
      },
    },
    {
      name: "SPGNFTBeacon",
      address: {
        [odysseyChainId]: "0x4b913A9da52806A0fd0b031bdf32fa33634d082a",
      },
    },
    {
      name: "SPGNFTImpl",
      address: {
        [odysseyChainId]: "0x32c03CD2B4CC3456aCD86C7d5BA8E0405665DbF9",
      },
    },
    {
      name: "CoreMetadataModule",
      address: {
        [odysseyChainId]: "0x89630Ccf23277417FBdfd3076C702F5248267e78",
      },
    },
    {
      name: "DerivativeWorkflows",
      address: {
        [odysseyChainId]: "0xa8815CEB96857FFb8f5F8ce920b1Ae6D70254C7B",
      },
    },
    {
      name: "GroupingWorkflows",
      address: {
        [odysseyChainId]: "0xcd754994eBE5Ce16D432C1f936f98ac0d4aABA0e",
      },
    },
    {
      name: "RegistrationWorkflows",
      address: {
        [odysseyChainId]: "0xde13Be395E1cd753471447Cf6A656979ef87881c",
      },
    },
    {
      name: "RoyaltyWorkflows",
      address: {
        [odysseyChainId]: "0xAf922379B8e1abc6B0D78547128579221C7F7A22",
      },
    },
    {
      name: "LicenseAttachmentWorkflows",
      address: {
        [odysseyChainId]: "0x44Bad1E4035a44eAC1606B222873E4a85E8b7D9c",
      },
    },
    {
      name: "GroupingModule",
      address: {
        [odysseyChainId]: "0xa731948cfE05135ad77d48C71f75066333Da78Bf",
      },
    },
    {
      name: "EvenSplitGroupPool",
      address: {
        [odysseyChainId]: "0xC384B56fD62d6679Cd62A2fE0dA3fe4560f33391",
      },
    },
    {
      name: "MockERC20",
      address: {
        [odysseyChainId]: "0x12A8b0DcC6e3bB0915638361D9D49942Da07F455",
      },
    },
    {
      name: "Multicall3",
      address: {
        [odysseyChainId]: "0xca11bde05977b3631167028862be2a173976ca11",
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
            "setLicensingConfig",
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
            "multicall",
          ],
          RegistrationWorkflows: [
            "createCollection",
            "mintAndRegisterIp",
            "registerIp",
            "CollectionCreated",
            "multicall",
          ],
          LicenseAttachmentWorkflows: [
            "registerPILTermsAndAttach",
            "registerIpAndAttachPILTerms",
            "mintAndRegisterIpAndAttachPILTerms",
            "multicall",
          ],
          RoyaltyWorkflows: [
            "transferToVaultAndSnapshotAndClaimByTokenBatch",
            "transferToVaultAndSnapshotAndClaimBySnapshotBatch",
            "snapshotAndClaimByTokenBatch",
            "snapshotAndClaimBySnapshotBatch",
          ],
          Multicall3: ["aggregate3"],
        },
      }),
    ],
  };
});
