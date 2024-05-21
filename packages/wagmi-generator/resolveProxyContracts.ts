import type {Evaluate} from "@wagmi/cli/src/types";
import type {ContractConfig} from "@wagmi/cli/src/config";
import {Address} from "viem";

export type Config = {
    baseUrl: string,
    contracts: Evaluate<Omit<ContractConfig, 'abi'>>[],
    chainId: number,
}
export type ProxyMap = (config: { address: NonNullable<ContractConfig['address']> }) => Address

interface RpcResponse {
    result: Address
}

function getAddress(chainId: number, address: string | (Record<undefined, Address> & Partial<Record<number, Address>>)): Address {
    if (typeof address == "string") {
        return address as Address
    } else {
        return address[chainId]
    }
}

function makeProxyMap(chainId: number, proxyContractsMap: Record<Address, Address>): ProxyMap {
    return function (config): Address {
        let address: Address = getAddress(chainId, config.address)

        if (address in proxyContractsMap) {
            return proxyContractsMap[address]
        } else {
            return address
        }
    }
}

export async function resolveProxyContracts(config: Config): Promise<ProxyMap> {
    const proxyContractsMap: Record<Address, Address> = {}
    for (let contract of config.contracts) {
        const address: Address = getAddress(config.chainId, contract.address)
        const resp = await fetch(config.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: 1,
                jsonrpc: "2.0",
                method: "eth_getStorageAt",
                params: [
                    address,
                    "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
                    "latest"
                ],
            })
        })

        const rpcResponse: RpcResponse = await resp.json()
        if (!/^0x0+$/[Symbol.match](rpcResponse.result)) {
            proxyContractsMap[address] = `0x${rpcResponse.result.substring(rpcResponse.result.length - 40)}`
        }
    }

    return makeProxyMap(config.chainId, proxyContractsMap)
}