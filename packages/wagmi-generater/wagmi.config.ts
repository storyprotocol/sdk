import {defineConfig} from '@wagmi/cli'
import {blockExplorer} from '@wagmi/cli/plugins'
import {sdk} from './sdk'
import type {Evaluate} from "@wagmi/cli/src/types";
import type {ContractConfig} from "@wagmi/cli/src/config";
import {resolveProxyContracts} from "./resolveProxyContracts";

export default defineConfig(async () => {
    const contracts: Evaluate<Omit<ContractConfig, 'abi'>>[] = [
        {name: "AccessController", address: "0x6fB5BA9A8747E897109044a1cd1192898AA384a9"},
        {name: "DisputeModule", address: "0x837d095F9A11178545DF4114C44fb526dcf74168"},
        {name: "IPAccountImpl", address: "0x6d1398e1ceE174a3e41d6eB50F00Fe43132f9C8A"},
        {name: "IPAssetRegistry", address: "0x30C89bCB41277f09b18DF0375b9438909e193bf0"},
        {name: "IpRoyaltyVaultImpl", address: "0x0dB6AAb7525F03Bf94A1fC08A9aACCc2Ad25eD12"},
        {name: "LicenseRegistry", address: "0x410d2332270cEb9Ca78b7E2c3720046b3ef2D8Ba"},
        {name: "LicensingModule", address: "0x2A88056985814dcBb72aFA50B95893359B6262f5"},
        {name: "ModuleRegistry", address: "0xab0bf9846eCE1299AaA1cB3FF5EfbBA328968771"},
        {name: "PILPolicyFrameworkManager", address: "0xAc2C50Af31501370366D243FaeC56F89128f6d96"},
        {name: "RoyaltyModule", address: "0xF77b0933F6aaC2dCE2eAa0d79f6Bfd6b9347a5E7"},
        {name: "RoyaltyPolicyLAP", address: "0x265C21b34e0E92d63C678425478C42aa8D727B79"},

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
                    ],
                }
            }),
        ],
    }
})
