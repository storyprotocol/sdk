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
        [iliadChainId]: "0xbcaD7EA76Ee68Cc507874e9050a7E7D7ff07BB09",
      },
    },
    {
      name: "DisputeModule",
      address: {
        [iliadChainId]: "0x26525b4A1c2261A27B9ee89D512c2f7DceF85f4a",
      },
    },
    {
      name: "IPAccountImpl",
      address: {
        [iliadChainId]: "0xaE2D8F01920DB2328BEd676652154c9D2Cb863fa",
      },
    },
    {
      name: "IPAssetRegistry",
      address: {
        [iliadChainId]: "0x14CAB45705Fe73EC6d126518E59Fe3C61a181E40",
      },
    },
    {
      name: "IpRoyaltyVaultImpl",
      address: {
        [iliadChainId]: "0x604dc8E58f720DEB345B2F3e08B2B354eA6CE498",
      },
    },
    {
      name: "LicenseRegistry",
      address: {
        [iliadChainId]: "0x4D71a082DE74B40904c1d89d9C3bfB7079d4c542",
      },
    },
    {
      name: "LicenseToken",
      address: {
        [iliadChainId]: "0xd8aEF404432a2b3363479A6157285926B6B3b743",
      },
    },
    {
      name: "LicensingModule",
      address: {
        [iliadChainId]: "0xC8f165950411504eA130692B87A7148e469f7090",
      },
    },
    {
      name: "PILicenseTemplate",
      address: {
        [iliadChainId]: "0xbB7ACFBE330C56aA9a3aEb84870743C3566992c3",
      },
    },
    {
      name: "ModuleRegistry",
      address: {
        [iliadChainId]: "0x47bEae573B73F8BF1B4fa4Af065c39743871003f",
      },
    },
    {
      name: "RoyaltyModule",
      address: {
        [iliadChainId]: "0xaCb5764E609aa3a5ED36bA74ba59679246Cb0963",
      },
    },
    {
      name: "RoyaltyPolicyLAP",
      address: {
        [iliadChainId]: "0x793Df8d32c12B0bE9985FFF6afB8893d347B6686",
      },
    },
    {
      name: "RoyaltyPolicyLRP",
      address: {
        [iliadChainId]: "0x1eF035c7054bd45e25B2a29A06a37b1350F50596",
      },
    },
    {
      name: "SPGNFTBeacon",
      address: {
        [iliadChainId]: "0x02324ca8f369abB445F50c4cE79e956e49AC75d8",
      },
    },
    {
      name: "SPGNFTImpl",
      address: {
        [iliadChainId]: "0xC8E4376Da033cE244027B03f9b94dc0d7005D67E",
      },
    },
    {
      name: "CoreMetadataModule",
      address: {
        [iliadChainId]: "0xa71Bd7aff91Da5E27A6f96c546D489F6e0870E45",
      },
    },
    {
      name: "DerivativeWorkflows",
      address: {
        [iliadChainId]: "0xC022C70DA8c23Ae8e36B3de9039Ed24E4E42a127",
      },
    },
    {
      name: "GroupingWorkflows",
      address: {
        [iliadChainId]: "0x426fF4F7E9Debe565F5Fe6F53334Ad3982295E20",
      },
    },
    {
      name: "RegistrationWorkflows",
      address: {
        [iliadChainId]: "0xF403fcCAAE6C503D0CC1D25904A0B2cCd5B96C6F",
      },
    },
    {
      name: "RoyaltyWorkflows",
      address: {
        [iliadChainId]: "0xc757921ee0f7c8E935d44BFBDc2602786e0eda6C",
      },
    },
    {
      name: "LicenseAttachmentWorkflows",
      address: {
        [iliadChainId]: "0x1B95144b62B4566501482e928aa435Dd205fE71B",
      },
    },
    {
      name: "GroupingModule",
      address: {
        [iliadChainId]: "0xaB7a16Ad9e46656C59e6071d920feeE7A3416ECf",
      },
    },
    {
      name: "EvenSplitGroupPool",
      address: {
        [iliadChainId]: "0xA1dB7AB14900Cd9eF9A7eBA931A206250F403a14",
      },
    },
    {
      name: "ArbitrationPolicySP",
      address: {
        [iliadChainId]: "0x8038697357F63415e848785e45B00eB60BcD797b",
      },
    },
    {
      name: "MockERC20",
      address: {
        [iliadChainId]: "0x91f6F05B08c16769d3c85867548615d270C42fC7",
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
