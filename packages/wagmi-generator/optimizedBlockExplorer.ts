import {BlockExplorerConfig} from "@wagmi/cli/src/plugins/blockExplorer";
import {blockExplorer} from "@wagmi/cli/plugins";
import type {ContractConfig} from "@wagmi/cli/src/config";

export function optimizedBlockExplorer(config: BlockExplorerConfig) {
    const getAddress = config.getAddress

    let lastAddress: { address: NonNullable<ContractConfig['address']> } = null
    config.getAddress = (config: { address: NonNullable<ContractConfig['address']> }) => {
        lastAddress = config
        return getAddress(config)
    }

    const result = blockExplorer(config)
    const contracts = result.contracts

    result.contracts = () => {
        const result = contracts()
        if (result instanceof Promise) {
            result.catch(error => {
                console.log("")
                console.error("!!! RESOLVING CONTRACTS ERROR !!!")
                console.log(`${error}`)
                console.log("----------")
                console.log(`Address: ${JSON.stringify(lastAddress)}`)
                if (error.details) {
                    console.log(`Details: `, error.details)
                }
            })
        }
        return result
    }
    return result
}