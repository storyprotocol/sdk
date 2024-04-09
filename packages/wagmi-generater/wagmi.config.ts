import {defineConfig} from '@wagmi/cli'
import {blockExplorer, react} from '@wagmi/cli/plugins'
import {sdk} from './sdk'
import type {Evaluate} from "@wagmi/cli/src/types";
import type {ContractConfig} from "@wagmi/cli/src/config";
import {resolveProxyContracts} from "./resolveProxyContracts";
import {sepolia} from 'viem/chains';

const storyTestnetId = 1513

export default defineConfig(async () => {
    const contracts: Evaluate<Omit<ContractConfig, 'abi'>>[] = [
        {
            name: "AccessController", address: {
                [sepolia.id]: "0xad64a4b2e18FF7D2f97aF083E7b193d7Dd141735",
                [storyTestnetId]: "0x6fB5BA9A8747E897109044a1cd1192898AA384a9",
            }
        },
        {
            name: "DisputeModule", address: {
                [sepolia.id]: "0x6157B19CBc151af2b36e0a2581001d32a22b2661",
                [storyTestnetId]: "0x837d095F9A11178545DF4114C44fb526dcf74168",
            }
        },
        {
            name: "IPAccountImpl", address: {
                [sepolia.id]: "0x79792DccC6C58C303510fc1F7649e481C431aFb1",
                [storyTestnetId]: "0x6d1398e1ceE174a3e41d6eB50F00Fe43132f9C8A",
            }
        },
        {
            name: "IPAssetRegistry", address: {
                [sepolia.id]: "0x292639452A975630802C17c9267169D93BD5a793",
                [storyTestnetId]: "0x30C89bCB41277f09b18DF0375b9438909e193bf0",
            }
        },
        {
            name: "IpRoyaltyVaultImpl", address: {
                [storyTestnetId]: "0x0dB6AAb7525F03Bf94A1fC08A9aACCc2Ad25eD12",
            }
        },
        {
            name: "LicenseRegistry", address: {
                [sepolia.id]: "0xc2BC7a2d5784768BDEd98436f2522A4931e2FBb4",
                [storyTestnetId]: "0x410d2332270cEb9Ca78b7E2c3720046b3ef2D8Ba",
            }
        },
        {
            name: "LicensingModule", address: {
                [sepolia.id]: "0x950d766A1a0afDc33c3e653C861A8765cb42DbdC",
                [storyTestnetId]: "0x2A88056985814dcBb72aFA50B95893359B6262f5",
            }
        },
        {
            name: "ModuleRegistry", address: {
                [sepolia.id]: "0x5Aac3177F496F503Ac724A0D0A697f6ba9dA2C27",
                [storyTestnetId]: "0xab0bf9846eCE1299AaA1cB3FF5EfbBA328968771",
            }
        },
        {
            name: "PILPolicyFrameworkManager", address: {
                [sepolia.id]: "0xeAABf2b80B7e069EE449B5629590A1cc0F9bC9C2",
                [storyTestnetId]: "0xAc2C50Af31501370366D243FaeC56F89128f6d96",
            }
        },
        {
            name: "RoyaltyModule", address: {
                [sepolia.id]: "0xA6bEf9CC650A16939566c1da5d5088f3F028a865",
                [storyTestnetId]: "0xF77b0933F6aaC2dCE2eAa0d79f6Bfd6b9347a5E7",
            }
        },
        {
            name: "RoyaltyPolicyLAP", address: {
                [sepolia.id]: "0x16eF58e959522727588921A92e9084d36E5d3855",
                [storyTestnetId]: "0x265C21b34e0E92d63C678425478C42aa8D727B79",
            }
        },

        // {name: "MockERC20", address: "0xCc97e835157daf88820cbDE105ADFF5d7981A382"},
        // {name: "MockERC721", address: "0x7c0004C6D352bC0a0531AaD46d33A03D9d51ab1D"},
        // {name: "ArbitrationPolicySP", address: "0x114aE96d362b802Ed92758A21992e429e9E83565"},
        // {name: "Governance", address: "0x0Fee5B61cF0976f3F59138146a9180a107738db9"},
        // {name: "IPAccountRegistry", address: "0x0CCc0CD388477ED0D7531d2aD6e68c9E24B8392d"},
        // {name: "IpRoyaltyVaultBeacon", address: "0x8C7664Befc382A282F8aA821A2d337960e410E77"},
        // {name: "MockTokenGatedHook", address: "0xD3Aa4F5B77509907FF3d7a90cEadE19bab2b6Fdb"},
        // {name: "TokenWithdrawalModule", address: "0x446B734C3Fc13c53b4E32FEFCaaED97e0100552D"},
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
                permissionLessSDK: false,
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
                    "LicenseRegistry": [
                        "TransferBatch",
                        "TransferSingle",
                        "mintLicense",
                    ],
                    "LicensingModule": [
                        "IpIdLinkedToParents",
                        "PolicyAddedToIpId",
                        "PolicyRegistered",
                        "addPolicyToIp",
                        "getPolicyId",
                        "linkIpToParents",
                        "mintLicense",
                        "registerPolicy",
                    ],
                    "ModuleRegistry": [
                        "isRegistered",
                    ],
                    "PILPolicyFrameworkManager": [
                        "registerPolicy",
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
