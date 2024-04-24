import {defineConfig} from '@wagmi/cli'
import {blockExplorer, react} from '@wagmi/cli/plugins'
import {sdk} from './sdk'
import type {Evaluate} from "@wagmi/cli/src/types";
import type {ContractConfig} from "@wagmi/cli/src/config";
import {resolveProxyContracts} from "./resolveProxyContracts";
const storyTestnetId = 1513;
const sepoliaChainId = 11155111;
export default defineConfig(async () => {
    const contracts: Evaluate<Omit<ContractConfig, 'abi'>>[] = [
        {
            name: "AccessController", address: {
                [sepoliaChainId]: "0xFbD5BE3815b71564Dc51C3C8301c47770fC9a61c",
                // [storyTestnetId]: "0x7e253Df9b0fC872746877Fa362b2cAf32712d770",
            }
        },
        {
            name: "DisputeModule", address: {
                [sepoliaChainId]: "0xd0194dD93968DE60dBe10610fb6Ce2C86a51A78e",
                // [storyTestnetId]: "0x6d54456Ae5DCbDC0C9E2713cC8E650fE4f445c7C",
            }
        },
        {
            name: "IPAccountImpl", address: {
                [sepoliaChainId]: "0x71898BD128039BC5bb8D2451Cfc43A55F64fb9c6",
                // [storyTestnetId]: "0x38cAfD16502B1d61c6399A18d6Fa1Ea8CEca3678",
            }
        },
        {
            name: "IPAssetRegistry", address: {
                [sepoliaChainId]: "0x84c177633adCD26157732e18dd9E145E442E6aCb",
                // [storyTestnetId]: "0x862de97662a1231FFc14038eC1BE93aB129D2169",
            }
        },
        {
            name: "IpRoyaltyVaultImpl", address: {
                [sepoliaChainId]: "0xDdAa6A42399F8eA503048ACb93A5fAe6e6b39598",
                // [storyTestnetId]: "0x8Be22cc2D13ADF496a417D9C616dA4a253c68Af8",
            }
        },
        {
            name: "LicenseRegistry", address: {
                [sepoliaChainId]: "0xbbcb7b0Bd15b1CfcA0A923791e526A6E90774D40",
                // [storyTestnetId]: "0x0c3D467537FAd845a78728CEdc3D9447338c5422",
            }
        },
        {
            name: "LicenseToken", address: {
                [sepoliaChainId]: "0xCe9862F0a6f39631A2A790237086bd48635e3e42",
                // [storyTestnetId]: "0xD40b7bCA204f96a346021e31c9ad54FF495226e7",
            }
        },
        {
            name: "LicensingModule", address: {
                [sepoliaChainId]: "0xf6C72a97E6ef70A9AB0F96c6E4baB93b868DC992",
                // [storyTestnetId]: "0xEeDDE5529122b621105798860F235c28FD3aBA40",
            }
        },
        {
            name: "PILicenseTemplate", address: {
                [sepoliaChainId]: "0xFD474b0938303613AAa377BE375c3A571cAA04fb",
                // [storyTestnetId]: "0xd0Be223ae9719bBD93447ecf5289319CCf8cA227",
            }
        },
        {
            name: "ModuleRegistry", address: {
                [sepoliaChainId]: "0x59b37bb4D6913eFE32f40D09b5290ff5509E6738",
                // [storyTestnetId]: "0xf2965E3B6251905Dd1E8671077760D07b0408cf2",
            }
        },
        {
            name: "RoyaltyModule", address: {
                [sepoliaChainId]: "0xE50BB9D71b4d5c587d36849460F57df5bc939dab",
                // [storyTestnetId]: "0x551AD8CD7893003cE00500aC2aCF1E327763D9f6",
            }
        },
        {
            name: "RoyaltyPolicyLAP", address: {
                [sepoliaChainId]: "0xf4f93F779BAe88898BA0Fc6ddb6FAA05632ee13c",
                // [storyTestnetId]: "0x2EcdB5bD12a037dCb9De0Ab7957f35FEeF758eA6",
            }
        },
    ]
    return {
        out: '../core-sdk/src/abi/generated.ts',
        contracts: [],
        plugins: [
            blockExplorer({
                baseUrl: 'https://api-sepolia.etherscan.io/api',
                name: 'Etherscan',
                getAddress: await resolveProxyContracts({
                    baseUrl: 'https://rpc.sepolia.org',
                    contracts: contracts,
                    chainId: sepoliaChainId,
                }),
                contracts: contracts,
                apiKey: "SESFC586HF7TPP759BIWCQ14Q5MP3H5JMC",
            }),
            sdk({
                permissionLessSDK: true,
                whiteList: {
                    "AccessController": [
                        "PermissionSet",
                        "setPermission",
                    ],
                    "DisputeModule": [
                        "DisputeCancelled",
                        "DisputeRaised",
                        "DisputeResolved",
                        "cancelDispute",
                        "raiseDispute",
                        "resolveDispute",
                    ],
                    "IPAccountImpl": [
                        "execute",
                        "executeWithSig",
                    ],
                    "IPAssetRegistry": [
                        "IPRegistered",
                        "ipId",
                        "isRegistered",
                        "register",
                    ],
                    "IpRoyaltyVaultImpl": [
                        "claimRevenueBySnapshotBatch",
                        "claimRevenueByTokenBatch",
                        "claimableRevenue",
                        "collectRoyaltyTokens",
                        "ipId",
                        "RoyaltyTokensCollected",
                        "snapshot",
                        "SnapshotCompleted",
                        "RevenueTokenClaimed"
                    ],
                    "PiLicenseTemplate": [
                        "getLicenseTermsId",
                        "registerLicenseTerms",
                        "LicenseTermsRegistered"
                    ],
                    "LicensingModule": [
                        "attachLicenseTerms",
                        "mintLicenseTokens",
                        "LicenseTokensMinted",
                        "registerDerivativeWithLicenseTokens",
                        "registerDerivative",
                    ],
                    "ModuleRegistry": [
                        "isRegistered",
                    ],
                    "RoyaltyModule": [
                        "payRoyaltyOnBehalf",
                    ],
                    "RoyaltyPolicyLAP": [
                        "onRoyaltyPayment",
                        "getRoyaltyData",
                    ],
                    "LicenseToken":[
                        "ownerOf"
                    ]
                }
            }),
        ],
    }
})