import {
  Address,
  ContractFunctionName,
  Hex,
  LocalAccount,
  PrivateKeyAccount,
  encodeFunctionData,
  toFunctionSelector,
} from "viem";

import { accessControllerAbi, accessControllerAddress } from "../abi/generated";
import { getAddress } from "./utils";
import { SetPermissionsRequest } from "../types/resources/permission";
import { defaultFunctionSelector } from "../constants/common";

export const getPermissionSignature = async (params: {
  ipId: Address;
  nonce: number | bigint;
  deadline: bigint;
  account: LocalAccount | PrivateKeyAccount;
  chainId: bigint;
  permissions: Omit<SetPermissionsRequest, "txOptions">[];
  permissionFunc?: ContractFunctionName<typeof accessControllerAbi>;
}): Promise<Hex> => {
  const { ipId, deadline, nonce, account, chainId, permissions, permissionFunc } = params;
  if (!account.signTypedData) {
    throw new Error("The account does not support signTypedData, Please use a local account.");
  }
  const permissionFunction = permissionFunc ? permissionFunc : "setPermission";
  const data = encodeFunctionData({
    abi: accessControllerAbi,
    functionName: permissionFunc ? permissionFunc : "setPermission",
    args:
      permissionFunction === "setPermission"
        ? [
            permissions[0].ipId,
            permissions[0].signer,
            permissions[0].to,
            permissions[0].func ? toFunctionSelector(permissions[0].func) : defaultFunctionSelector,
            permissions[0].permission,
          ]
        : [
            permissions.map((item) => ({
              ipAccount: item.ipId,
              signer: item.signer,
              to: item.to,
              func: item.func ? toFunctionSelector(item.func) : defaultFunctionSelector,
              permission: item.permission,
            })),
          ],
  });
  return await account.signTypedData({
    domain: {
      name: "Story Protocol IP Account",
      version: "1",
      chainId: Number(chainId),
      verifyingContract: ipId,
    },
    types: {
      Execute: [
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "data", type: "bytes" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "Execute",
    message: {
      to: getAddress(
        accessControllerAddress[Number(chainId) as keyof typeof accessControllerAddress],
        "accessControllerAddress",
      ),
      value: BigInt(0),
      data,
      nonce: BigInt(nonce),
      deadline,
    },
  });
};

export const getDeadline = (deadline?: bigint | number | string): bigint => {
  if (deadline && (isNaN(Number(deadline)) || BigInt(deadline) < 0n)) {
    throw new Error("Invalid deadline value.");
  }
  const timestamp = BigInt(Date.now());
  return deadline ? timestamp + BigInt(deadline) : timestamp + 1000n;
};
