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
        [odysseyChainId]: "0x36c307E6eAa3663a06386c6f3D3f9909Cb0c1DfA",
      },
    },
    {
      name: "DisputeModule",
      address: {
        [odysseyChainId]: "0xA5758EbB764816a338BD2E0339454fdeD61FEDCC",
      },
    },
    {
      name: "IPAccountImpl",
      address: {
        [odysseyChainId]: "0x252118ce469EFeA3a210817620AB77216b001C1e",
      },
    },
    {
      name: "IPAssetRegistry",
      address: {
        [odysseyChainId]: "0xe9FDB3D7c6AB31eD5eEA45f547Ca19C5de4244Af",
      },
    },
    {
      name: "IpRoyaltyVaultImpl",
      address: {
        [odysseyChainId]: "0xFcbaF5Ae5eFF8b21E68759402952F28404e48704",
      },
    },
    {
      name: "LicenseRegistry",
      address: {
        [odysseyChainId]: "0xDEF65942605C0c1d8eBcf3249AFBa3b8204BA8A9",
      },
    },
    {
      name: "LicenseToken",
      address: {
        [odysseyChainId]: "0x6A875Bba3F710e05D9c5a9C74AC4f511ae948Df5",
      },
    },
    {
      name: "LicensingModule",
      address: {
        [odysseyChainId]: "0x98fBba1415369D67f0E8B9D4eD04Ed9A9cdE3152",
      },
    },
    {
      name: "PILicenseTemplate",
      address: {
        [odysseyChainId]: "0x2412341DFC214763dDCFCE76acf2Da09Bc7b4F7E",
      },
    },
    {
      name: "ModuleRegistry",
      address: {
        [odysseyChainId]: "0x6159Be97753e5a31fc2e25e2D189678eEebE8861",
      },
    },
    {
      name: "RoyaltyModule",
      address: {
        [odysseyChainId]: "0xdCe2468a64D8D88a00074c47760C2b6AaEDbEDc8",
      },
    },
    {
      name: "RoyaltyPolicyLAP",
      address: {
        [odysseyChainId]: "0x80244b027E2296fb8fb4dFd05FaCc7A36C12e29a",
      },
    },
    {
      name: "RoyaltyPolicyLRP",
      address: {
        [odysseyChainId]: "0x85E38f84128B97F9C7C50b1B912D8Af159d49e29",
      },
    },
    {
      name: "SPGNFTBeacon",
      address: {
        [odysseyChainId]: "0xC8774113B8FbD1741Ab5CDCd39389be4269C7a12",
      },
    },
    {
      name: "SPGNFTImpl",
      address: {
        [odysseyChainId]: "0x00D0f71B99eB5c5eb3fbd9feFA5996329A8db3Ae",
      },
    },
    {
      name: "CoreMetadataModule",
      address: {
        [odysseyChainId]: "0x6aeDf1fEBF4c8c764019C6F90e94aB9D94324c50",
      },
    },
    {
      name: "DerivativeWorkflows",
      address: {
        [odysseyChainId]: "0x2dC1cB61ac23257e99C716932756FE2e0f7aaDeB",
      },
    },
    {
      name: "GroupingWorkflows",
      address: {
        [odysseyChainId]: "0xDA49FFefbc20311d86E275741D152942C3EB5412",
      },
    },
    {
      name: "RegistrationWorkflows",
      address: {
        [odysseyChainId]: "0x1F67Da99E9b3aB4557941258624730db9f9098a4",
      },
    },
    {
      name: "RoyaltyWorkflows",
      address: {
        [odysseyChainId]: "0x90F7c98EfB9Dd19e88c9C30C5a298C54276a47E3",
      },
    },
    {
      name: "LicenseAttachmentWorkflows",
      address: {
        [odysseyChainId]: "0x928fD7A75EF7C14bf87Ee6b7d507d109a9E72603",
      },
    },
    {
      name: "RoyaltyTokenDistributionWorkflows",
      address: {
        [odysseyChainId]: "0x7f6b16C0c065F3F5349EA8BE35f6f23310D7397F",
      },
    },
    {
      name: "GroupingModule",
      address: {
        [odysseyChainId]: "0x06884216bB51FD881EB255fCAcBBA626D5191C1e",
      },
    },
    {
      name: "EvenSplitGroupPool",
      address: {
        [odysseyChainId]: "0xF4cE2a628b60b51DEE641d4392f88850F14EFdeF",
      },
    },
    //TODO: Waiting for the contract to be verified
    // {
    //   name: "MockERC20",
    //   address: {
    //     [odysseyChainId]: "0x505F4FD2857fEF5667A68153C9b6955a8039537e",
    //   },
    // },
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
            "claimableRevenue",
            "ipId",
            "RoyaltyTokensCollected",
            "RevenueTokenClaimed",
            "balanceOf",
          ],
          PiLicenseTemplate: [
            "getLicenseTermsId",
            "registerLicenseTerms",
            "LicenseTermsRegistered",
            "getLicenseTerms",
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
            "IpRoyaltyVaultDeployed",
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
          RoyaltyTokenDistributionWorkflows: [
            "mintAndRegisterIpAndAttachPILTermsAndDistributeRoyaltyTokens",
            "mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens",
            "registerIpAndAttachPILTermsAndDeployRoyaltyVault",
            "distributeRoyaltyTokens",
            "registerIpAndMakeDerivativeAndDeployRoyaltyVault",
          ],
        },
      }),
    ],
  };
});
