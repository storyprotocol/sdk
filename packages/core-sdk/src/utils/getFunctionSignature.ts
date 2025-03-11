import { Abi, AbiFunction, AbiParameter } from "viem";

type FunctionSignature = {
  /** The contract ABI */
  abi: Abi;
  /** The name of the method to get the signature for */
  methodName: string;
  /** Optional index for overloaded functions (0-based) */
  overloadIndex?: number;
};
/**
 * Gets the function signature from an ABI for a given method name.
 *
 * @returns The function signature in standard format (e.g. "methodName(uint256,address)")
 * @throws Error if method not found or if overloadIndex is required but not provided
 */
export function getFunctionSignature({
  abi,
  methodName,
  overloadIndex,
}: FunctionSignature): string {
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
