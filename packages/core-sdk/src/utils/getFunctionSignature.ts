import { Abi, AbiFunction, AbiParameter } from "viem";
/**
 * Gets the function signature from an ABI for a given method name
 * @param abi - The contract ABI
 * @param methodName - The name of the method to get the signature for
 * @param overloadIndex - Optional index for overloaded functions (0-based)
 * @returns The function signature in standard format (e.g. "methodName(uint256,address)")
 * @throws Error if method not found or if overloadIndex is required but not provided
 */
export function getFunctionSignature(abi: Abi, methodName: string, overloadIndex?: number): string {
  const functions = abi.filter(
    (x): x is AbiFunction => x.type === "function" && x.name === methodName,
  );

  if (functions.length === 0) {
    throw new Error(`Method ${methodName} not found in ABI.`);
  }

  if (functions.length > 1 && overloadIndex === undefined) {
    throw new Error(
      `Method ${methodName} has ${functions.length} overloads. Please specify overloadIndex (0-${
        functions.length - 1
      }).`,
    );
  }

  const func = functions[overloadIndex || 0];

  const getTypeString = (
    input: AbiParameter & { components?: readonly AbiParameter[] },
  ): string => {
    if (input.type.startsWith("tuple")) {
      const components = input.components
        ?.map((comp: AbiParameter) =>
          getTypeString(comp as AbiParameter & { components?: AbiParameter[] }),
        )
        .join(",");
      return `(${components})`;
    }
    return input.type;
  };

  const inputs = func.inputs
    .map((input) => getTypeString(input as AbiParameter & { components?: readonly AbiParameter[] }))
    .join(",");
  return `${methodName}(${inputs})`;
}
