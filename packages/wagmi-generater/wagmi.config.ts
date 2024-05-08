import { defineConfig } from "@wagmi/cli";
import { blockExplorer } from "@wagmi/cli/plugins";
import { sdk } from "./sdk";
import type { Evaluate } from "@wagmi/cli/src/types";
import type { ContractConfig } from "@wagmi/cli/src/config";
import { resolveProxyContracts } from "./resolveProxyContracts";
const storyTestnetId = 1513;
const sepoliaChainId = 11155111;
import "dotenv/config";

export default defineConfig(async () => {
  const contracts: Evaluate<Omit<ContractConfig, "abi">>[] = [
    {
      name: "AccessController",
      address: {
        [sepoliaChainId]: "0xF9936a224b3Deb6f9A4645ccAfa66f7ECe83CF0A",
        // [storyTestnetId]: "0x7e253Df9b0fC872746877Fa362b2cAf32712d770",
      },
    },
    {
      name: "DisputeModule",
      address: {
        [sepoliaChainId]: "0xEB7B1dd43B81A7be1fA427515a2b173B454A9832",
        // [storyTestnetId]: "0x6d54456Ae5DCbDC0C9E2713cC8E650fE4f445c7C",
      },
    },
    {
      name: "IPAccountImpl",
      address: {
        [sepoliaChainId]: "0x36a5f0D61f6Bab3C6Dde211E5a6762Cb18a8060d",
        // [storyTestnetId]: "0x38cAfD16502B1d61c6399A18d6Fa1Ea8CEca3678",
      },
    },
    {
      name: "IPAssetRegistry",
      address: {
        [sepoliaChainId]: "0xd43fE0d865cb5C26b1351d3eAf2E3064BE3276F6",
        // [storyTestnetId]: "0x862de97662a1231FFc14038eC1BE93aB129D2169",
      },
    },
    {
      name: "IpRoyaltyVaultImpl",
      address: {
        [sepoliaChainId]: "0xD6c2AfB61085f1359d47159f2271BDD0EeBf19C2",
        // [storyTestnetId]: "0x8Be22cc2D13ADF496a417D9C616dA4a253c68Af8",
      },
    },
    {
      name: "LicenseRegistry",
      address: {
        [sepoliaChainId]: "0x4f4b1bf7135C7ff1462826CCA81B048Ed19562ed",
        // [storyTestnetId]: "0x0c3D467537FAd845a78728CEdc3D9447338c5422",
      },
    },
    {
      name: "LicenseToken",
      address: {
        [sepoliaChainId]: "0x1333c78A821c9a576209B01a16dDCEF881cAb6f2",
        // [storyTestnetId]: "0xD40b7bCA204f96a346021e31c9ad54FF495226e7",
      },
    },
    {
      name: "LicensingModule",
      address: {
        [sepoliaChainId]: "0xe89b0EaA8a0949738efA80bB531a165FB3456CBe",
        // [storyTestnetId]: "0xEeDDE5529122b621105798860F235c28FD3aBA40",
      },
    },
    {
      name: "PILicenseTemplate",
      address: {
        [sepoliaChainId]: "0x260B6CB6284c89dbE660c0004233f7bB99B5edE7",
        // [storyTestnetId]: "0xd0Be223ae9719bBD93447ecf5289319CCf8cA227",
      },
    },
    {
      name: "ModuleRegistry",
      address: {
        [sepoliaChainId]: "0x2E0a668289D5C4Da6a2264aC8DF03cd600c7aAB8",
        // [storyTestnetId]: "0xf2965E3B6251905Dd1E8671077760D07b0408cf2",
      },
    },
    {
      name: "RoyaltyModule",
      address: {
        [sepoliaChainId]: "0xFAE961dd2b87CD5818dbCDc2591e6AB0b50E96b0",
        // [storyTestnetId]: "0x551AD8CD7893003cE00500aC2aCF1E327763D9f6",
      },
    },
    {
      name: "RoyaltyPolicyLAP",
      address: {
        [sepoliaChainId]: "0xAAbaf349C7a2A84564F9CC4Ac130B3f19A718E86",
        // [storyTestnetId]: "0x2EcdB5bD12a037dCb9De0Ab7957f35FEeF758eA6",
      },
    },
    {
      name: "SPG",
      address: {
        [sepoliaChainId]: "0x69415CE984A79a3Cfbe3F51024C63b6C107331e3",
        // [storyTestnetId]: "0x2EcdB5bD12a037dCb9De0Ab7957f35FEeF758eA6",
      },
    },
    {
      name: "SPGNFTBeacon",
      address: {
        [sepoliaChainId]: "0x027D258659FBdda9033f9c008AF166239EBa67c1",
        // [storyTestnetId]: "0x2EcdB5bD12a037dCb9De0Ab7957f35FEeF758eA6",
      },
    },
    {
      name: "SPGNFTImpl",
      address: {
        [sepoliaChainId]: "0xDb6480C00B570324A122A6B35F9CAC0F87BDb3e6",
        // [storyTestnetId]: "0x2EcdB5bD12a037dCb9De0Ab7957f35FEeF758eA6",
      },
    },
  ];
  return {
    out: "../core-sdk/src/abi/generated.ts",
    contracts: [],
    plugins: [
      blockExplorer({
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
          AccessController: ["PermissionSet", "setPermission"],
          DisputeModule: [
            "DisputeCancelled",
            "DisputeRaised",
            "DisputeResolved",
            "cancelDispute",
            "raiseDispute",
            "resolveDispute",
          ],
          IPAccountImpl: ["execute", "executeWithSig"],
          IPAssetRegistry: ["IPRegistered", "ipId", "isRegistered", "register"],
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
            "registerIpAndMakeDerivativeWithLicenseTokens"
          ],
        },
      }),
    ],
  };
});
