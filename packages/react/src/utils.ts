import { pascalCase } from "change-case";

export function defaultGetHookName({
  contractName,
  itemName,
  type,
}: {
  contractName: string;
  itemName: string | undefined;
  type: string;
}): `use${string}` {
  // Full hook name if itemName is a commonly shared interface
  if (itemName?.toLowerCase() === "name" || itemName?.toLowerCase() === "supportsinterface")
    return `use${pascalCase(type)}${pascalCase(contractName)}${pascalCase(itemName)}`;

  if (!itemName) return `use${pascalCase(type)}${pascalCase(contractName)}`;

  // Write hooks are named use{itemName}, for example useRegisterIpAsset
  if (type.toLowerCase() === "write") {
    return `use${pascalCase(itemName)}`;
  }

  // Default hook name otherwise
  return `use${pascalCase(type)}${itemName}`;
}

export function defaultWagmiGetHookName({
  contractName,
  itemName,
  type,
}: {
  contractName: string;
  itemName: string | undefined;
  type: string;
}): `use${string}` {
  if (!itemName) return `use${pascalCase(type)}${pascalCase(contractName)}`;

  if (type.toLowerCase() === "write") {
    return `use${pascalCase(
      itemName ? itemName : `${pascalCase(type)}${pascalCase(contractName)}`,
    )}`;
  }
  return `use${pascalCase(type)}${pascalCase(contractName)}${itemName}`;
}
