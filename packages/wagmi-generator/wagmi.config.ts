import { defineConfig } from "@wagmi/cli";
import { sdk } from "./sdk";
import type { Evaluate } from "@wagmi/cli/src/types";
import type { ContractConfig } from "@wagmi/cli/src/config";
import { resolveProxyContracts } from "./resolveProxyContracts";
import {optimizedBlockExplorer} from "./optimizedBlockExplorer";
const sepoliaChainId = 11155111;
const storyTestnetChainId = 1513;
import "dotenv/config";

export default defineConfig(async () => {
  const contracts: Evaluate<Omit<ContractConfig, "abi">>[] = [
    {
      name: "AccessController",
      address: {
        [sepoliaChainId]: "0xF9936a224b3Deb6f9A4645ccAfa66f7ECe83CF0A",
        [storyTestnetChainId]: "0x01d470c28822d3701Db6325333cEE9737524776E",
      },
    },
    {
      name: "DisputeModule",
      address: {
        [sepoliaChainId]: "0xEB7B1dd43B81A7be1fA427515a2b173B454A9832",
        [storyTestnetChainId]: "0xDae11663438a0958E7075F604E3a5eEe77FD3878",
      },
    },
    {
      name: "IPAccountImpl",
      address: {
        [sepoliaChainId]: "0x36a5f0D61f6Bab3C6Dde211E5a6762Cb18a8060d",
        [storyTestnetChainId]: "0x8F763c16753e830a8020c80f9F0131Eb8Ef52879",
      },
    },
    {
      name: "IPAssetRegistry",
      address: {
        [sepoliaChainId]: "0xd43fE0d865cb5C26b1351d3eAf2E3064BE3276F6",
        [storyTestnetChainId]: "0xe34A78B3d658aF7ad69Ff1EFF9012ECa025a14Be",
      },
    },
    {
      name: "IpRoyaltyVaultImpl",
      address: {
        [sepoliaChainId]: "0xD6c2AfB61085f1359d47159f2271BDD0EeBf19C2",
        [storyTestnetChainId]: "0xfb5b5B61c9a437E06Ba87367aaBf3766d091E3D1",
      },
    },
    {
      name: "LicenseRegistry",
      address: {
        [sepoliaChainId]: "0x4f4b1bf7135C7ff1462826CCA81B048Ed19562ed",
        [storyTestnetChainId]: "0xF542AF9a5A6E4A85a4f084D38B322516ec336097",
      },
    },
    {
      name: "LicenseToken",
      address: {
        [sepoliaChainId]: "0x1333c78A821c9a576209B01a16dDCEF881cAb6f2",
        [storyTestnetChainId]: "0xB31FE33De46A1FA5d4Ec669EDB049892E0A1EB4C",
      },
    },
    {
      name: "LicensingModule",
      address: {
        [sepoliaChainId]: "0xe89b0EaA8a0949738efA80bB531a165FB3456CBe",
        [storyTestnetChainId]: "0xf49da534215DA7b48E57A41d41dac25C912FCC60",
      },
    },
    {
      name: "PILicenseTemplate",
      address: {
        [sepoliaChainId]: "0x260B6CB6284c89dbE660c0004233f7bB99B5edE7",
        [storyTestnetChainId]: "0x8BB1ADE72E21090Fc891e1d4b88AC5E57b27cB31",
      },
    },
    {
      name: "ModuleRegistry",
      address: {
        [sepoliaChainId]: "0x2E0a668289D5C4Da6a2264aC8DF03cd600c7aAB8",
        [storyTestnetChainId]: "0x008ac202A8545D10f25707439bE4c139Be4Df75F",
      },
    },
    {
      name: "RoyaltyModule",
      address: {
        [sepoliaChainId]: "0xFAE961dd2b87CD5818dbCDc2591e6AB0b50E96b0",
        [storyTestnetChainId]: "0x968beb5432c362c12b5Be6967a5d6F1ED5A63F01",
      },
    },
    {
      name: "RoyaltyPolicyLAP",
      address: {
        [sepoliaChainId]: "0xAAbaf349C7a2A84564F9CC4Ac130B3f19A718E86",
        [storyTestnetChainId]: "0x61A5c7570f5bDB118D65053Ba60DE87e050E664e",
      },
    },
    {
      name: "SPG",
      address: {
        [sepoliaChainId]: "0x69415CE984A79a3Cfbe3F51024C63b6C107331e3",
        [storyTestnetChainId]: "0x69415CE984A79a3Cfbe3F51024C63b6C107331e3",
      },
    },
    {
      name: "SPGNFTBeacon",
      address: {
        [sepoliaChainId]: "0x027D258659FBdda9033f9c008AF166239EBa67c1",
        [storyTestnetChainId]: "0x027D258659FBdda9033f9c008AF166239EBa67c1",
      },
    },
    {
      name: "SPGNFTImpl",
      address: {
        [sepoliaChainId]: "0xDb6480C00B570324A122A6B35F9CAC0F87BDb3e6",
        [storyTestnetChainId]: "0xDb6480C00B570324A122A6B35F9CAC0F87BDb3e6",
      },
    },
    {
      name: "CoreMetadataModule",
      address: {
        [sepoliaChainId]: "0xDa498A3f7c8a88cb72201138C366bE3778dB9575",
        [storyTestnetChainId]: "0x290F414EA46b361ECFB6b430F98346CB593D02b9",
      },
    },
  ];
  return {
    out: "../core-sdk/src/abi/generated.ts",
    contracts: [],
    plugins: [
      optimizedBlockExplorer({
        baseUrl: "https://api-sepolia.etherscan.io/api",
        name: "Etherscan",
        getAddress: await resolveProxyContracts({
          baseUrl: "https://rpc.sepolia.org",
          contracts: contracts,
          chainId: sepoliaChainId,
        }),
        contracts: contracts,
        apiKey: process.env.API_KEY,
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
