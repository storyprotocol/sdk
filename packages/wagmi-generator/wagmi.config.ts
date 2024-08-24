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
        [iliadChainId]: "0x01d470c28822d3701Db6325333cEE9737524776E",
      },
    },
    {
      name: "DisputeModule",
      address: {
        [iliadChainId]: "0xDae11663438a0958E7075F604E3a5eEe77FD3878",
      },
    },
    {
      name: "IPAccountImpl",
      address: {
        [iliadChainId]: "0x8F763c16753e830a8020c80f9F0131Eb8Ef52879",
      },
    },
    {
      name: "IPAssetRegistry",
      address: {
        [iliadChainId]: "0xe34A78B3d658aF7ad69Ff1EFF9012ECa025a14Be",
      },
    },
    {
      name: "IpRoyaltyVaultImpl",
      address: {
        [iliadChainId]: "0xfb5b5B61c9a437E06Ba87367aaBf3766d091E3D1",
      },
    },
    {
      name: "LicenseRegistry",
      address: {
        [iliadChainId]: "0xF542AF9a5A6E4A85a4f084D38B322516ec336097",
      },
    },
    {
      name: "LicenseToken",
      address: {
        [iliadChainId]: "0xB31FE33De46A1FA5d4Ec669EDB049892E0A1EB4C",
      },
    },
    {
      name: "LicensingModule",
      address: {
        [iliadChainId]: "0xf49da534215DA7b48E57A41d41dac25C912FCC60",
      },
    },
    {
      name: "PILicenseTemplate",
      address: {
        [iliadChainId]: "0x8BB1ADE72E21090Fc891e1d4b88AC5E57b27cB31",
      },
    },
    {
      name: "ModuleRegistry",
      address: {
        [iliadChainId]: "0x008ac202A8545D10f25707439bE4c139Be4Df75F",
      },
    },
    {
      name: "RoyaltyModule",
      address: {
        [iliadChainId]: "0x968beb5432c362c12b5Be6967a5d6F1ED5A63F01",
      },
    },
    {
      name: "RoyaltyPolicyLAP",
      address: {
        [iliadChainId]: "0x61A5c7570f5bDB118D65053Ba60DE87e050E664e",
      },
    },
    {
      name: "SPG",
      address: {
        [iliadChainId]: "0x69415CE984A79a3Cfbe3F51024C63b6C107331e3",
      },
    },
    {
      name: "SPGNFTBeacon",
      address: {
        [iliadChainId]: "0x027D258659FBdda9033f9c008AF166239EBa67c1",
      },
    },
    {
      name: "SPGNFTImpl",
      address: {
        [iliadChainId]: "0xDb6480C00B570324A122A6B35F9CAC0F87BDb3e6",
      },
    },
    {
      name: "CoreMetadataModule",
      address: {
        [iliadChainId]: "0x290F414EA46b361ECFB6b430F98346CB593D02b9",
      },
    },
  ];
  return {
    out: "../core-sdk/src/abi/generated.ts",
    contracts: [],
    plugins: [
      optimizedBlockExplorer({
        baseUrl: "https://testnet.storyscan.xyz",
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
          IPAccountImpl: ["execute", "executeWithSig", "state"],
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
          ],
          ModuleRegistry: ["isRegistered"],
          RoyaltyModule: ["payRoyaltyOnBehalf"],
          RoyaltyPolicyLAP: ["onRoyaltyPayment", "getRoyaltyData"],
          LicenseToken: ["ownerOf"],
          SPG: [
            "createCollection",
            "CollectionCreated",
            "mintAndRegisterIp",
            "registerPILTermsAndAttach",
            "mintAndRegisterIpAndAttachPILTerms",
            "registerIpAndAttachPILTerms",
            "mintAndRegisterIpAndMakeDerivative",
            "registerIpAndMakeDerivative",
            "mintAndRegisterIpAndMakeDerivativeWithLicenseTokens",
            "registerIpAndMakeDerivativeWithLicenseTokens",
            "registerIp",
          ],
        },
      }),
    ],
  };
});
