import {Evaluate} from "@wagmi/core/internal";
import {Plugin} from "@wagmi/cli/dist/types/config";
import {RequiredBy} from "viem/_types/types/utils";
import {Contract} from "@wagmi/cli/src/config";
import {pascalCase, camelCase} from 'change-case'
import {AbiFunction, AbiEvent, AbiParameter} from "abitype";

export type SDKConfig = {}

type ReactResult = Evaluate<RequiredBy<Plugin, 'run'>>
type RunConfig = {
    contracts: Array<Contract>
    isTypeScript: boolean,
}

const primitiveTypeMap = {
    uint8: 'number',
    uint32: 'number',
    uint64: 'bigint',
    uint256: 'bigint',
    address: 'Address',
    bytes32: 'Hex',
    bytes4: 'Hex',
    bytes: 'Hex',
    bool: 'boolean',
    string: 'string',
}

function isAbiFuncOnlyRead(func: AbiFunction): boolean {
    return func.stateMutability == "view" || func.stateMutability == "pure"
}

function parameterToPrimitiveType(type: string): string {
    if (type.endsWith("[]")) {
        return `readonly ${parameterToPrimitiveType(type.substring(0, type.length - 2))}[]`
    } else if (type in primitiveTypeMap) {
        return primitiveTypeMap[type]
    } else {
        return `AbiTypeToPrimitiveType<'${type}'>`
    }
}

function parameterToType(type: AbiParameter, optional: boolean = false): string {
    let optionalAppend = ""
    if (optional) optionalAppend = " | undefined"
    if ('components' in type && type.components) {
        if (type.type == "tuple" || type.type == "tuple[]") {
            let tupleType = generateContractTypes("", type.components, optional);
            if (tupleType.valid) {
                if (type.type == "tuple[]") tupleType.type += "[]"
                return tupleType.type + optionalAppend
            }
        }

        return `AbiParameterToPrimitiveType<${JSON.stringify(type)}>` + optionalAppend
    } else {
        return parameterToPrimitiveType(type.type) + optionalAppend
    }
}

function generateContractTypes(name: string, params: readonly AbiParameter[], optional: boolean = false) {
    if (!params.length) return {valid: false}

    const typePrefix = name !== "" ? `export type ${name} =` : ""
    const allHasName = params.filter(it => !it.name).length == 0
    if (allHasName) {
        let type: Array<string> = [];
        let args: Array<string> = [];
        type.push(`${typePrefix} {`)
        for (let i = 0; i < params.length; i++) {
            if (optional) {
                type.push(`  ${params[i].name}?: ${parameterToType(params[i])};`)
            } else {
                type.push(`  ${params[i].name}: ${parameterToType(params[i])};`)
            }
            args.push(`  request.${params[i].name},`)
        }
        type.push(`}`)

        return {valid: true, type: type.join("\n"), args: args.join("\n"), kind: "object"};
    } else {
        if (params.length == 1) {
            return {
                valid: true,
                type: `${typePrefix} ${parameterToType(params[0], optional)}`,
                args: "request",
                kind: "alone"
            }
        }

        let type: Array<string> = [];
        let args: Array<string> = [];
        type.push(`${typePrefix} readonly [`)
        for (let i = 0; i < params.length; i++) {
            type.push(`${parameterToType(params[i], optional)},`)
            args.push(`request[${i}]`)
        }
        type.push(`]`)

        return {valid: true, type: type.join(""), args: args.join(","), kind: "array"};
    }
}

function generateContractFunction(contractName: string, func: AbiFunction) {
    const abiName = `${camelCase(contractName)}Abi`
    const indexFuncName = ('index' in func) ? `${func.name}${func.index}` : func.name
    const inName = `${pascalCase(contractName)}${pascalCase(indexFuncName)}Request`
    let outName = `${pascalCase(contractName)}${pascalCase(indexFuncName)}Response`
    const inType = generateContractTypes(inName, func.inputs)
    const outType = generateContractTypes(outName, func.outputs)
    const inParams = inType.valid ? `request: ${inName}` : ``
    let method = 'readContract'

    let funcLine: Array<string> = [];
    let types: Array<string> = [];

    if (inType.valid) types.push(inType.type)

    if (!isAbiFuncOnlyRead(func)) {
        method = 'simulateContract';
        outType.valid = true
        outName = "WriteContractReturnType"
    } else if (outType.valid) types.push(outType.type)

    funcLine.push(``)
    if (outType.valid) {
        funcLine.push(`  public async ${camelCase(indexFuncName)}(${inParams}): Promise<${outName}> {`)
        if (method == "simulateContract") {
            funcLine.push(`      const { request: call } = await this.rpcClient.${method}({`)
        } else if (outType.kind == "object") {
            funcLine.push(`      const result = await this.rpcClient.${method}({`)
        } else {
            funcLine.push(`      return await this.rpcClient.${method}({`)
        }
    } else {
        funcLine.push(`  public async ${camelCase(indexFuncName)}(${inParams}): Promise<void> {`)
        funcLine.push(`      await this.rpcClient.${method}({`)
    }
    funcLine.push(`        abi: ${abiName},`)
    funcLine.push(`        address: this.address,`)
    funcLine.push(`        functionName: "${func.name}",`)
    if (!isAbiFuncOnlyRead(func)) {
        funcLine.push(`        account: this.wallet.account,`)
    }
    if (inType.valid) {
        funcLine.push(`        args: [`)
        funcLine.push(inType.args)
        funcLine.push(`        ],`)
    }
    funcLine.push(`      });`)
    if (method == "simulateContract") {
        funcLine.push(`  return await this.wallet.writeContract(call);`)
    } else if (outType.valid && outType.kind == "object") {
        funcLine.push(`  return {`)
        if (func.outputs.length == 1) {
            func.outputs.forEach(it =>
                funcLine.push(` ${it.name}: result,`)
            )
        } else {
            func.outputs.forEach((it, i) =>
                funcLine.push(` ${it.name}: result[${i}],`)
            )
        }
        funcLine.push(`  };`)
    }
    funcLine.push(`  }`)

    return {func: funcLine.join("\n"), types: types.join("\n")}
}

function generateEventFunction(contractName: any, event: AbiEvent) {
    const abiName = `${camelCase(contractName)}Abi`
    const typeName = `${pascalCase(contractName)}${pascalCase(event.name)}Event`
    const type = generateContractTypes(typeName, event.inputs, true)

    let funcLine: Array<string> = [];
    let types: Array<string> = [];

    if (type.valid) {
        types.push(type.type)
        funcLine.push(``)
        funcLine.push(`  public watch${pascalCase(event.name)}Event(onLogs: (txHash: Hex, ev: ${typeName}) => void): WatchContractEventReturnType {`)
        funcLine.push(`    return this.rpcClient.watchContractEvent({`)
        funcLine.push(`      abi: ${abiName},`)
        funcLine.push(`      address: this.address,`)
        funcLine.push(`      eventName: '${event.name}',`)
        funcLine.push(`      onLogs: (evs) => {evs.forEach(it=> onLogs(it.transactionHash, it.args))},`)
        funcLine.push(`    })`)
        funcLine.push(`  }`)
    }

    return {func: funcLine.join("\n"), types: types.join("\n")}
}

function generateContract(contract: Contract): string {
    let contractAddress = ""
    if (typeof contract.address == "string") {
        contractAddress = `= '${contract.address}'`
    } else {
        for (let addressKey in contract.address) {
            contractAddress = `= '${contract.address[addressKey]}'`
        }
    }

    let functionMap: Record<string, number> = {}
    let abiViewFunctions: Array<AbiFunction> = [];
    let abiWriteFunctions: Array<AbiFunction> = [];
    let abiEvents: Array<AbiEvent> = [];
    for (let abiElement of contract.abi) {
        switch (abiElement.type) {
            case "function":
                const indexAbiElement: AbiFunction & { index?: number } = abiElement

                if (!functionMap[indexAbiElement.name]) {
                    functionMap[indexAbiElement.name] = 1
                } else {
                    functionMap[indexAbiElement.name]++
                    indexAbiElement.index = functionMap[indexAbiElement.name]
                }

                if (isAbiFuncOnlyRead(indexAbiElement)) {
                    abiViewFunctions.push(indexAbiElement)
                } else {
                    abiWriteFunctions.push(indexAbiElement)
                }
                break;
            case "event":
                abiEvents.push(abiElement)
                break;
        }
    }

    let file: Array<string> = [];
    let types: Array<string> = [];

    if (abiViewFunctions.length) {
        file.push(`export class ${pascalCase(contract.name)}ReadOnlyClient {`)
        file.push(`  protected readonly rpcClient: PublicClient;`)
        file.push(`  protected readonly address: Address;`)
        file.push(``)
        file.push(`  constructor (rpcClient: PublicClient, address: Address ${contractAddress}) {`)
        file.push(`      this.address = address;`)
        file.push(`      this.rpcClient = rpcClient;`)
        file.push(`  }`)
        abiViewFunctions.forEach(it => {
            const data = generateContractFunction(contract.name, it)
            file.push(data.func)
            types.push(data.types)
        })
        file.push(`}`)
    }

    if (abiWriteFunctions.length) {
        const extend = abiViewFunctions.length ? ` extends ${pascalCase(contract.name)}ReadOnlyClient` : ``
        file.push(`export class ${pascalCase(contract.name)}Client ${extend} {`)
        file.push(`  protected readonly wallet: WalletClient;`)
        file.push(``)
        file.push(`  constructor (rpcClient: PublicClient, wallet: WalletClient, address: Address ${contractAddress}) {`)
        file.push(`      super(rpcClient, address);`)
        file.push(`      this.wallet = wallet;`)
        file.push(`  }`)
        abiWriteFunctions.forEach(it => {
            const data = generateContractFunction(contract.name, it)
            file.push(data.func)
            types.push(data.types)
        })
        file.push(`}`)
    }

    if (abiEvents.length) {
        file.push(`export class ${pascalCase(contract.name)}EventClient {`)
        file.push(`  protected readonly rpcClient: PublicClient;`)
        file.push(`  protected readonly address: Address;`)
        file.push(``)
        file.push(`  constructor (rpcClient: PublicClient, address: Address ${contractAddress}) {`)
        file.push(`      this.address = address;`)
        file.push(`      this.rpcClient = rpcClient;`)
        file.push(`  }`)
        abiEvents.forEach(it => {
            const data = generateEventFunction(contract.name, it)
            file.push(data.func)
            types.push(data.types)
        })
        file.push(`}`)
    }

    return `// Contract ${contract.name} =============================================================\n` +
        types.join("\n\n") +
        "\n\n" +
        file.join("\n");
}

export function sdk(config: SDKConfig = {}): ReactResult {
    return {
        name: 'SDK',
        async run(config: RunConfig): Promise<{ imports?: string, prepend?: string, content: string }> {
            let classFile: Array<string> = []

            for (const contract of config.contracts) {
                classFile.push(generateContract(contract))
            }

            return {
                imports: `import {Address, PublicClient, WalletClient, WatchContractEventReturnType, WriteContractReturnType, Hex} from "viem";import {AbiTypeToPrimitiveType, AbiParameterToPrimitiveType} from "abitype";`,
                content: classFile.join("\n\n"),
            }
        },
    }
}

