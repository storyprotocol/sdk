import {defineConfig} from '@wagmi/cli'
import {blockExplorer} from '@wagmi/cli/plugins'
import {sdk} from './sdk'

export default defineConfig({
    out: '../core-sdk/src/abi/generated.ts',
    contracts: [],
    plugins: [
        blockExplorer({
            baseUrl: 'https://story-network.explorer.caldera.xyz/api',
            name: 'StoryScan',
            contracts: [
                {name: "AccessController", address: "0x92c87ae0a0a4b8629ad028e55183CC2b7eC057D3"},
                {name: "AncestorsVaultLAP", address: "0x280f8921E36d6Af2E03AD84EC8194ad1b6B4799c"},
                {name: "ArbitrationPolicySP", address: "0xCc3dDa466A18C4F20Bc0750756B92E2f23741Fd3"},
                {name: "DisputeModule", address: "0x0Ac6fdA124b05D2daA5E9De7059c866EE1CE7Bcb"},
                {name: "Governance", address: "0x6D8070F7726769bEd136bc7007B3deA695f7047A"},
                {name: "IPAccountImpl", address: "0xddcBD4309f0545fa8cC99137bC621620e017bdBe"},
                {name: "IPAccountRegistry", address: "0x16129393444e5BEb435501Dea41D5ECfB10b76F0"},
                {name: "IPAssetRegistry", address: "0xAAe9e83F8cE8832270AF033c609e233686f0E0eB"},
                {name: "IPAssetRenderer", address: "0x39cCE13916e7bfdeFa462D360d551aEcc6D82311"},
                {name: "IPMetadataProvider", address: "0x0A97aD19FEF318F0ACA888574b64A35402C8aDDB"},
                {name: "IPResolver", address: "0xeAEd88BEbF00acac8EFE9ED426cDDD2Dc9f8CB78"},
                {name: "LicenseRegistry", address: "0x410d2332270cEb9Ca78b7E2c3720046b3ef2D8Ba"},
                {name: "LicensingModule", address: "0x2A88056985814dcBb72aFA50B95893359B6262f5"},
                {name: "MockERC20", address: "0x3271778AdE44EfeC9e11b7160827921b6d614AF1"},
                {name: "MockERC721", address: "0xCdBa568f1f4e16a6c6CBC8F509eCc87972Fef09f"},
                {name: "MockTokenGatedHook", address: "0x008B5D8Db85100E143729453784e9F077B2279fA"},
                {name: "ModuleRegistry", address: "0xB8617E2FC9dbFd51781B8D281b725976E3B43f9d"},
                {name: "PILPolicyFrameworkManager", address: "0xAc2C50Af31501370366D243FaeC56F89128f6d96"},
                {name: "RegistrationModule", address: "0xa6249720b3BD1179d84b7E74029Ed2F78E5eC694"},
                {name: "RoyaltyModule", address: "0xE1a667ccc38540b38d8579c499bE22e51390a308"},
                {name: "RoyaltyPolicyLAP", address: "0x265C21b34e0E92d63C678425478C42aa8D727B79"},
                {name: "TokenWithdrawalModule", address: "0x5f62d238B3022bA5881e5e443B014cac6999a4f2"},
            ],
        }),
        sdk(),
    ],
})
