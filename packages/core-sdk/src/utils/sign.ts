import { encodeFunctionData, toFunctionSelector } from "viem";

import { accessControllerAbi, accessControllerAddress } from "../abi/generated";
import { getAddress } from "./utils";
import { defaultFunctionSelector } from "../constants/common";
import { PermissionSignatureRequest, PermissionSignatureResponse } from "../types/common";

/**
 * Get the signature for setting permissions.
 * @param param - The parameter object containing necessary data to get the signature.
 * @param param.ipId - The IP ID.
 * @param param.deadline - The deadline.
 * @param param.nonce - The nonce.
 * @param param.wallet - The wallet client.
 * @param param.chainId - The chain ID.
 * @param param.permissions - The permissions.
 * @param param.permissionFunc - The permission function,default function is setPermission.
 * @returns A Promise that resolves to the signature.
 */
export const getPermissionSignature = async (
  param: PermissionSignatureRequest,
): Promise<PermissionSignatureResponse> => {
  const { ipId, deadline, nonce, wallet, chainId, permissions, permissionFunc } = param;
  if (!wallet.signTypedData) {
    throw new Error("The wallet client does not support signTypedData, please try again.");
  }
  if (!wallet.account) {
    throw new Error("The wallet client does not have an account, please try again.");
  }
  const permissionFunction = permissionFunc ? permissionFunc : "setPermission";
  const data = encodeFunctionData({
    abi: accessControllerAbi,
    functionName: permissionFunc ? permissionFunc : "setPermission",
    args:
      permissionFunction === "setPermission"
        ? [
            getAddress(permissions[0].ipId, "permissions[0].ipId"),
            getAddress(permissions[0].signer, "permissions[0].signer"),
            getAddress(permissions[0].to, "permissions[0].to"),
            permissions[0].func ? toFunctionSelector(permissions[0].func) : defaultFunctionSelector,
            permissions[0].permission,
          ]
        : [
            permissions.map((item, index) => ({
              ipAccount: getAddress(item.ipId, `permissions[${index}].ipId`),
              signer: getAddress(item.signer, `permissions[${index}].signer`),
              to: getAddress(item.to, `permissions[${index}].to`),
              func: item.func ? toFunctionSelector(item.func) : defaultFunctionSelector,
              permission: item.permission,
            })),
          ],
  });
  return await wallet.signTypedData({
    account: wallet.account,
    domain: {
      name: "Story Protocol IP Account",
      version: "1",
      chainId: Number(chainId),
      verifyingContract: getAddress(ipId, "ipId"),
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
      deadline: BigInt(deadline),
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
