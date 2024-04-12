import {defineConfig} from '@wagmi/cli'
import {blockExplorer, react} from '@wagmi/cli/plugins'
import {sdk} from './sdk'
import type {Evaluate} from "@wagmi/cli/src/types";
import type {ContractConfig} from "@wagmi/cli/src/config";
import {resolveProxyContracts} from "./resolveProxyContracts";

const storyTestnetId = 1513

export default defineConfig(async () => {
    const contracts: Evaluate<Omit<ContractConfig, 'abi'>>[] = [
        {
            name: "AccessController", address: {
                // [sepolia.id]: "0xad64a4b2e18FF7D2f97aF083E7b193d7Dd141735",
                [storyTestnetId]: "0x7e253Df9b0fC872746877Fa362b2cAf32712d770",
            }
        },
        {
            name: "DisputeModule", address: {
                // [sepolia.id]: "0x6157B19CBc151af2b36e0a2581001d32a22b2661",
                [storyTestnetId]: "0x6d54456Ae5DCbDC0C9E2713cC8E650fE4f445c7C",
            }
        },
        {
            name: "IPAccountImpl", address: {
                // [sepolia.id]: "0x79792DccC6C58C303510fc1F7649e481C431aFb1",
                [storyTestnetId]: "0x38cAfD16502B1d61c6399A18d6Fa1Ea8CEca3678",
            }
        },
        {
            name: "IPAssetRegistry", address: {
                // [sepolia.id]: "0x292639452A975630802C17c9267169D93BD5a793",
                [storyTestnetId]: "0x862de97662a1231FFc14038eC1BE93aB129D2169",
            }
        },
        {
            name: "IpRoyaltyVaultImpl", address: {
                // [sepolia.id]: "",
                [storyTestnetId]: "0x8Be22cc2D13ADF496a417D9C616dA4a253c68Af8",
            }
        },
        {
            name: "LicenseRegistry", address: {
                // [sepolia.id]: "0xc2BC7a2d5784768BDEd98436f2522A4931e2FBb4",
                [storyTestnetId]: "0x0c3D467537FAd845a78728CEdc3D9447338c5422",
            }
        },
        {
            name: "LicensingModule", address: {
                // [sepolia.id]: "0x950d766A1a0afDc33c3e653C861A8765cb42DbdC",
                [storyTestnetId]: "0xEeDDE5529122b621105798860F235c28FD3aBA40",
            }
        },
        {
            name: "PILicenseTemplate", address: {
                // [sepolia.id]: "",
                [storyTestnetId]: "0xd0Be223ae9719bBD93447ecf5289319CCf8cA227",
            }
        },
        {
            name: "ModuleRegistry", address: {
                // [sepolia.id]: "0x5Aac3177F496F503Ac724A0D0A697f6ba9dA2C27",
                [storyTestnetId]: "0xf2965E3B6251905Dd1E8671077760D07b0408cf2",
            }
        },
        {
            name: "RoyaltyModule", address: {
                // [sepolia.id]: "0xA6bEf9CC650A16939566c1da5d5088f3F028a865",
                [storyTestnetId]: "0x551AD8CD7893003cE00500aC2aCF1E327763D9f6",
            }
        },
        {
            name: "RoyaltyPolicyLAP", address: {
                // [sepolia.id]: "0x16eF58e959522727588921A92e9084d36E5d3855",
                [storyTestnetId]: "0x2EcdB5bD12a037dCb9De0Ab7957f35FEeF758eA6",
            }
        },
    ]

    return {
        out: '../core-sdk/src/abi/generated.ts',
        contracts: [],
        plugins: [
            blockExplorer({
                baseUrl: 'https://story-network.explorer.caldera.xyz/api',
                name: 'StoryScan',
                getAddress: await resolveProxyContracts({
                    baseUrl: 'https://story-network.rpc.caldera.xyz/http',
                    contracts: contracts,
                    chainId: storyTestnetId,
                }),
                contracts: contracts,
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
                }
            }),
        ],
    }
})
