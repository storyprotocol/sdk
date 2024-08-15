import { Evaluate } from "@wagmi/core/internal";
import { Plugin } from "@wagmi/cli/dist/types/config";
import { RequiredBy } from "viem/_types/types/utils";
import { Contract } from "@wagmi/cli/src/config";
import { pascalCase, camelCase } from "change-case";
import { AbiFunction, AbiEvent, AbiParameter } from "abitype";

export type SDKConfig = {
  permissionLessSDK?: boolean;
  whiteList?: Record<string, Array<string>>;
};

type SDKResult = Evaluate<RequiredBy<Plugin, "run">>;
type RunConfig = {
  contracts: Array<Contract>;
  isTypeScript: boolean;
};

const primitiveNeedImportMap: Record<string, boolean> = {
  Address: true,
  Hex: true,
};

const primitiveTypeMap = {
  uint8: "number",
  uint32: "number",
  uint64: "bigint",
  uint256: "bigint",
  address: "Address",
  bytes32: "Hex",
  bytes4: "Hex",
  bytes: "Hex",
  bool: "boolean",
  string: "string",
};

let importUsedMap: Record<string, Record<string, boolean>> = {};

function addImport(from: string, ...names: Array<string>) {
  if (!(from in importUsedMap)) {
    importUsedMap[from] = {};
  }

  names.forEach((it) => (importUsedMap[from][it] = true));
}

function buildImport(): string {
  let imports: Array<string> = [];
  for (let from in importUsedMap) {
    imports.push(
      `import {${Object.keys(importUsedMap[from]).join(", ")}} from "${from}";`
    );
  }
  return imports.join("\n");
}

function isAbiFuncOnlyRead(func: AbiFunction): boolean {
  return func.stateMutability == "view" || func.stateMutability == "pure";
}

function parameterToPrimitiveType(type: string): string {
  if (type.endsWith("[]")) {
    return `readonly ${parameterToPrimitiveType(
      type.substring(0, type.length - 2)
    )}[]`;
  } else if (type in primitiveTypeMap) {
    if (primitiveNeedImportMap[primitiveTypeMap[type]]) {
      addImport("viem", primitiveTypeMap[type]);
    }

    return primitiveTypeMap[type];
  } else {
    addImport("abitype", "AbiTypeToPrimitiveType");
    return `AbiTypeToPrimitiveType<'${type}'>`;
  }
}

function parameterToType(
  type: AbiParameter,
  optional: boolean = false
): string {
  let optionalAppend = "";
  if (optional) optionalAppend = " | undefined";
  if ("components" in type && type.components) {
    if (type.type == "tuple" || type.type == "tuple[]") {
      let tupleType = generateContractTypes("", type.components, optional);
      if (tupleType.valid) {
        if (type.type == "tuple[]") tupleType.type += "[]";
        return tupleType.type + optionalAppend;
      }
    }

    addImport("abitype", "AbiParameterToPrimitiveType");
    return (
      `AbiParameterToPrimitiveType<${JSON.stringify(type)}>` + optionalAppend
    );
  } else {
    return parameterToPrimitiveType(type.type) + optionalAppend;
  }
}

function generateContractTypes(
  name: string,
  params: readonly AbiParameter[],
  optional: boolean = false
) {
  if (!params.length) return { valid: false };

  let comment: Array<string> = ["\n/**"];
  const typePrefix = name !== "" ? `export type ${name} =` : "";
  const allHasName = params.filter((it) => !it.name).length == 0;
  if (name != "") {
    comment.push(`* ${name}`);
    comment.push(`*`);
  }

  if (allHasName) {
    let type: Array<string> = [];
    let args: Array<string> = [];
    type.push(`${typePrefix} {`);
    for (let i = 0; i < params.length; i++) {
      if (optional) {
        comment.push(`* @param ${params[i].name} ${params[i].type} (optional)`);
        type.push(`  ${params[i].name}?: ${parameterToType(params[i])};`);
      } else {
        comment.push(`* @param ${params[i].name} ${params[i].type}`);
        type.push(`  ${params[i].name}: ${parameterToType(params[i])};`);
      }
      args.push(`  request.${params[i].name},`);
    }
    type.push(`}`);
    comment.push(`*/`);

    return {
      valid: true,
      comment: comment.join("\n"),
      type: type.join("\n"),
      args: args.join("\n"),
      kind: "object",
    };
  } else {
    if (params.length == 1) {
      return {
        valid: true,
        comment: "",
        type: `${typePrefix} ${parameterToType(params[0], optional)}`,
        args: "request",
        kind: "alone",
      };
    }

    let type: Array<string> = [];
    let args: Array<string> = [];
    type.push(`${typePrefix} readonly [`);
    for (let i = 0; i < params.length; i++) {
      comment.push(`* @param ${i} ${params[i].type}`);
      type.push(`${parameterToType(params[i], optional)},`);
      args.push(`request[${i}]`);
    }
    type.push(`]`);
    comment.push(`*/`);

    return {
      valid: true,
      comment: comment.join("\n"),
      type: type.join(""),
      args: args.join(","),
      kind: "array",
    };
  }
}

function generateContractFunction(contractName: string, func: AbiFunction) {
  const abiName = `${camelCase(contractName)}Abi`;
  const indexFuncName =
    "index" in func ? `${func.name}${func.index}` : func.name;
  const inName = `${pascalCase(contractName)}${pascalCase(
    indexFuncName
  )}Request`;
  let outName = `${pascalCase(contractName)}${pascalCase(
    indexFuncName
  )}Response`;
  const inType = generateContractTypes(inName, func.inputs);
  const outType = generateContractTypes(outName, func.outputs);
  const inParams = inType.valid ? `request: ${inName}` : ``;
  let method = "readContract";

  let funcLine: Array<string> = [];
  let types: Array<string> = [];

  if (inType.valid) types.push(`${inType.comment}\n${inType.type}`);

  if (!isAbiFuncOnlyRead(func)) {
    addImport("viem", "WriteContractReturnType");

    method = "simulateContract";
    outType.valid = true;
    outName = "WriteContractReturnType";
  } else if (outType.valid) types.push(`${outType.comment}\n${outType.type}`);

  funcLine.push(``);
  if (outType.valid) {
    funcLine.push(`/**`);
    funcLine.push(` * method ${func.name} for contract ${contractName}`);
    funcLine.push(` *`);
    funcLine.push(` * @param request ${inName}`);
    funcLine.push(` * @return Promise<${outName}>`);
    funcLine.push(`*/`);
    funcLine.push(
      `  public async ${camelCase(
        indexFuncName
      )}(${inParams}): Promise<${outName}> {`
    );
    if (method == "simulateContract") {
      funcLine.push(
        `      const { request: call } = await this.rpcClient.${method}({`
      );
    } else if (outType.kind == "object") {
      funcLine.push(`      const result = await this.rpcClient.${method}({`);
    } else {
      funcLine.push(`      return await this.rpcClient.${method}({`);
    }
  } else {
    funcLine.push(`/**`);
    funcLine.push(` * method ${func.name} for contract ${contractName}`);
    funcLine.push(` *`);
    funcLine.push(` * @param request ${inName}`);
    funcLine.push(` * @return Promise<void>`);
    funcLine.push(`*/`);
    funcLine.push(
      `  public async ${camelCase(indexFuncName)}(${inParams}): Promise<void> {`
    );
    funcLine.push(`      await this.rpcClient.${method}({`);
  }
  funcLine.push(`        abi: ${abiName},`);
  funcLine.push(`        address: this.address,`);
  funcLine.push(`        functionName: "${func.name}",`);
  if (!isAbiFuncOnlyRead(func)) {
    funcLine.push(`        account: this.wallet.account,`);
  }
  if (inType.valid) {
    funcLine.push(`        args: [`);
    funcLine.push(inType.args);
    funcLine.push(`        ],`);
  }
  funcLine.push(`      });`);
  if (method == "simulateContract") {
    funcLine.push(
      `  return await this.wallet.writeContract(call as WriteContractParameters);`
    );
  } else if (outType.valid && outType.kind == "object") {
    funcLine.push(`  return {`);
    if (func.outputs.length == 1) {
      func.outputs.forEach((it) => funcLine.push(` ${it.name}: result,`));
    } else {
      func.outputs.forEach((it, i) =>
        funcLine.push(` ${it.name}: result[${i}],`)
      );
    }
    funcLine.push(`  };`);
  }
  funcLine.push(`  }`);
  addImport("viem", "WriteContractParameters");

  return { func: funcLine.join("\n"), types: types.join("\n") };
}

function generateContractDataFunction(contractName: string, func: AbiFunction) {
  const abiName = `${camelCase(contractName)}Abi`;
  const indexFuncName =
    "index" in func ? `${func.name}${func.index}` : func.name;
  const inName = `${pascalCase(contractName)}${pascalCase(
    indexFuncName
  )}Request`;
  const inType = generateContractTypes(inName, func.inputs);
  const inParams = inType.valid ? `request: ${inName}` : ``;
  let method = "readContract";

  let funcLine: Array<string> = [];
  let types: Array<string> = [];

  if (inType.valid) types.push(`${inType.comment}\n${inType.type}`);

  addImport("viem", "encodeFunctionData");

  funcLine.push(``);
  funcLine.push(`/**`);
  funcLine.push(
    ` * method ${func.name} for contract ${contractName} with only encode`
  );
  funcLine.push(` *`);
  funcLine.push(` * @param request ${inName}`);
  funcLine.push(` * @return EncodedTxData`);
  funcLine.push(`*/`);
  funcLine.push(
    `  public ${camelCase(indexFuncName)}Encode(${inParams}): EncodedTxData {`
  );
  funcLine.push(`      return {`);
  funcLine.push(`        to: this.address,`);
  funcLine.push(`        data:encodeFunctionData({`);
  funcLine.push(`          abi: ${abiName},`);
  funcLine.push(`          functionName: "${func.name}",`);
  if (inType.valid) {
    funcLine.push(`          args: [`);
    funcLine.push(inType.args);
    funcLine.push(`          ],`);
  }
  funcLine.push(`        }),`);
  funcLine.push(`      };`);
  funcLine.push(`  }`);

  return { func: funcLine.join("\n"), types: "" };
}

function generateEventFunction(contractName: any, event: AbiEvent) {
  const abiName = `${camelCase(contractName)}Abi`;
  const typeName = `${pascalCase(contractName)}${pascalCase(event.name)}Event`;
  const type = generateContractTypes(typeName, event.inputs, false);

  let funcLine: Array<string> = [];
  let types: Array<string> = [];

  if (type.valid) {
    types.push(`${type.comment}\n${type.type}`);
    funcLine.push(``);
    funcLine.push(`/**`);
    funcLine.push(` * event ${event.name} for contract ${contractName}`);
    funcLine.push(`*/`);
    funcLine.push(
      `  public watch${pascalCase(
        event.name
      )}Event(onLogs: (txHash: Hex, ev: Partial<${typeName}>) => void): WatchContractEventReturnType {`
    );
    funcLine.push(`    return this.rpcClient.watchContractEvent({`);
    funcLine.push(`      abi: ${abiName},`);
    funcLine.push(`      address: this.address,`);
    funcLine.push(`      eventName: '${event.name}',`);
    funcLine.push(
      `      onLogs: (evs) => {evs.forEach(it=> onLogs(it.transactionHash, it.args))},`
    );
    funcLine.push(`    })`);
    funcLine.push(`  }`);
    funcLine.push(``);
    funcLine.push(`/**`);
    funcLine.push(
      ` * parse tx receipt event ${event.name} for contract ${contractName}`
    );
    funcLine.push(` */`);
    funcLine.push(
      `public parseTx${pascalCase(
        event.name
      )}Event(txReceipt: TransactionReceipt): Array<${typeName}> {`
    );
    funcLine.push(`    const targetLogs: Array<${typeName}> = [];`);
    funcLine.push(`    for (const log of txReceipt.logs) {`);
    funcLine.push(`        try {`);
    funcLine.push(`            const event = decodeEventLog({`);
    funcLine.push(`                abi: ${abiName},`);
    funcLine.push(`                eventName: '${event.name}',`);
    funcLine.push(`                data: log.data,`);
    funcLine.push(`                topics: log.topics,`);
    funcLine.push(`            });`);
    funcLine.push(
      `            if (event.eventName === '${event.name}') {targetLogs.push(event.args)}`
    );
    funcLine.push(`        } catch (e) { /* empty */ }`);
    funcLine.push(`    }`);
    funcLine.push(`    return targetLogs`);
    funcLine.push(`}`);

    addImport(
      "viem",
      "decodeEventLog",
      "WatchContractEventReturnType",
      "TransactionReceipt"
    );
  }

  return { func: funcLine.join("\n"), types: types.join("\n") };
}

function generateContract(config: SDKConfig, contract: Contract): string {
  const addressName = `${camelCase(contract.name)}Address`;
  let functionMap: Record<string, number> = {};
  let abiViewFunctions: Array<AbiFunction> = [];
  let abiWriteFunctions: Array<AbiFunction> = [];
  let abiEvents: Array<AbiEvent> = [];
  for (let abiElement of contract.abi) {
    switch (abiElement.type) {
      case "function":
        if (config.whiteList && config.whiteList[contract.name]) {
          if (config.whiteList[contract.name].indexOf(abiElement.name) == -1) {
            continue;
          }
        }

        const indexAbiElement: AbiFunction & { index?: number } = abiElement;

        if (!functionMap[indexAbiElement.name]) {
          functionMap[indexAbiElement.name] = 1;
        } else {
          functionMap[indexAbiElement.name]++;
          indexAbiElement.index = functionMap[indexAbiElement.name];
        }

        if (isAbiFuncOnlyRead(indexAbiElement)) {
          abiViewFunctions.push(indexAbiElement);
        } else {
          abiWriteFunctions.push(indexAbiElement);
        }
        break;
      case "event":
        if (config.whiteList && config.whiteList[contract.name]) {
          if (config.whiteList[contract.name].indexOf(abiElement.name) == -1) {
            continue;
          }
        }

        abiEvents.push(abiElement);
        break;
    }
  }

  let file: Array<string> = [];
  let types: Array<string> = [];

  if (abiEvents.length) {
    addImport("viem", "PublicClient", "Address");

    file.push(``);
    file.push(`/**`);
    file.push(` * contract ${contract.name} event`);
    file.push(`*/`);
    file.push(`export class ${pascalCase(contract.name)}EventClient {`);
    file.push(`  protected readonly rpcClient: PublicClient;`);
    file.push(`  public readonly address: Address;`);
    file.push(``);
    file.push(`  constructor (rpcClient: PublicClient, address?: Address) {`);
    file.push(
      `      this.address = address || getAddress(${addressName}, rpcClient.chain?.id);`
    );
    file.push(`      this.rpcClient = rpcClient;`);
    file.push(`  }`);
    abiEvents.forEach((it) => {
      const data = generateEventFunction(contract.name, it);
      file.push(data.func);
      types.push(data.types);
    });
    file.push(`}`);
  }

  if (abiViewFunctions.length) {
    const extend = abiEvents.length
      ? ` extends ${pascalCase(contract.name)}EventClient`
      : ``;
    file.push(``);
    file.push(`/**`);
    file.push(` * contract ${contract.name} readonly method`);
    file.push(`*/`);
    file.push(
      `export class ${pascalCase(contract.name)}ReadOnlyClient ${extend} {`
    );
    if (!abiEvents.length) {
      addImport("viem", "PublicClient", "Address");
      file.push(`  protected readonly rpcClient: PublicClient;`);
      file.push(`  public readonly address: Address;`);
    }
    file.push(``);
    file.push(`  constructor (rpcClient: PublicClient, address?: Address) {`);
    if (abiEvents.length) {
      file.push(`      super(rpcClient, address);`);
    } else {
      file.push(
        `      this.address = address || getAddress(${addressName}, rpcClient.chain?.id);`
      );
      file.push(`      this.rpcClient = rpcClient;`);
    }
    file.push(`  }`);
    abiViewFunctions.forEach((it) => {
      const data = generateContractFunction(contract.name, it);
      file.push(data.func);
      types.push(data.types);
    });
    file.push(`}`);
  }

  if (abiWriteFunctions.length) {
    addImport("viem", "PublicClient", "Address");

    const extend = abiViewFunctions.length
      ? ` extends ${pascalCase(contract.name)}ReadOnlyClient`
      : abiEvents.length
      ? ` extends ${pascalCase(contract.name)}EventClient`
      : ``;
    file.push(``);
    file.push(`/**`);
    file.push(` * contract ${contract.name} write method`);
    file.push(`*/`);
    file.push(`export class ${pascalCase(contract.name)}Client ${extend} {`);
    file.push(`  protected readonly wallet: SimpleWalletClient;`);
    if (!extend) {
      file.push(`  protected readonly rpcClient: PublicClient;`);
      file.push(`  public readonly address: Address;`);
    }
    file.push(``);
    file.push(
      `  constructor (rpcClient: PublicClient, wallet: SimpleWalletClient, address?: Address) {`
    );
    if (!extend) {
      file.push(
        `      this.address = address || getAddress(${addressName}, rpcClient.chain?.id);`
      );
      file.push(`      this.rpcClient = rpcClient;`);
    } else {
      file.push(`      super(rpcClient, address);`);
    }
    file.push(`      this.wallet = wallet;`);
    file.push(`  }`);
    abiWriteFunctions.forEach((it) => {
      const data = generateContractFunction(contract.name, it);
      file.push(data.func);
      types.push(data.types);

      const dataFunc = generateContractDataFunction(contract.name, it);
      file.push(dataFunc.func);
      types.push(dataFunc.types);
    });
    file.push(`}`);
  }

  return (
    `// Contract ${contract.name} =============================================================\n` +
    types.join("\n\n") +
    "\n\n" +
    file.join("\n")
  );
}

function generateCommon(config: SDKConfig) {
  let file: Array<string> = [];
  file.push(
    `// COMMON =============================================================`
  );
  file.push(``);
  file.push(
    `function getAddress(address: Record<number, Address>, chainId?: number): Address {`
  );
  file.push(`   return address[chainId || 0] || '0x'`);
  file.push(`}`);
  file.push(``);
  file.push(`export type EncodedTxData = {to: Address, data: Hex}`);
  file.push(``);
  addImport("viem", "Address", "Hex");

  if (config.permissionLessSDK) {
    file.push(``);
    file.push(`export type SimpleWalletClient<`);
    file.push(`    TChain extends Chain | undefined = Chain | undefined,`);
    file.push(
      `    TAccount extends Account | undefined = Account | undefined,`
    );
    file.push(`> = {`);
    file.push(`  account ?: TAccount;`);
    file.push(`  writeContract: <`);
    file.push(`      const abi extends Abi | readonly unknown[],`);
    file.push(
      `      functionName extends ContractFunctionName<abi, 'payable' | 'nonpayable'>,`
    );
    file.push(`      args extends ContractFunctionArgs<`);
    file.push(`          abi,`);
    file.push(`          'payable' | 'nonpayable',`);
    file.push(`          functionName`);
    file.push(`      >,`);
    file.push(`      TChainOverride extends Chain | undefined = undefined,`);
    file.push(`  >(`);
    file.push(`      args: WriteContractParameters<`);
    file.push(`          abi,`);
    file.push(`          functionName,`);
    file.push(`          args,`);
    file.push(`          TChain,`);
    file.push(`          TAccount,`);
    file.push(`          TChainOverride`);
    file.push(`      >,`);
    file.push(`  ) => Promise<WriteContractReturnType>`);
    file.push(`};`);
    file.push(``);

    addImport(
      "viem",
      "Abi",
      "Account",
      "Chain",
      "ContractFunctionArgs",
      "ContractFunctionName",
      "WriteContractParameters",
      "WriteContractReturnType"
    );
  }

  return file.join("\n");
}

export function sdk(config: SDKConfig = {}): SDKResult {
  return {
    name: "SDK",
    async run(
      runConfig: RunConfig
    ): Promise<{ imports?: string; prepend?: string; content: string }> {
      let classFile: Array<string> = [];

      classFile.push(generateCommon(config));

      for (const contract of runConfig.contracts) {
        classFile.push(generateContract(config, contract));
      }

      return {
        imports: buildImport(),
        content: classFile.join("\n\n"),
      };
    },
  };
}
