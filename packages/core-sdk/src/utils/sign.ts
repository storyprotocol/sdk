import {
  WalletClient,
  encodeAbiParameters,
  encodeFunctionData,
  keccak256,
  toFunctionSelector,
} from "viem";

import { accessControllerAbi, accessControllerAddress, ipAccountImplAbi } from "../abi/generated";
import { getAddress } from "./utils";
import { defaultFunctionSelector } from "../constants/common";
import {
  PermissionSignatureRequest,
  PermissionSignatureResponse,
  SignatureRequest,
  SignatureResponse,
} from "../types/resources/permission";

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
  const { ipId, deadline, state, wallet, chainId, permissions, permissionFunc } = param;
  const permissionFunction = permissionFunc ? permissionFunc : "setPermission";
  const accessAddress =
    accessControllerAddress[Number(chainId) as keyof typeof accessControllerAddress];
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
  return await getSignature({
    state,
    to: accessAddress,
    encodeData: data,
    wallet,
    verifyingContract: ipId,
    deadline,
    chainId,
  });
};

export const getDeadline = (unixTimestamp: bigint, deadline?: bigint | number | string): bigint => {
  if (deadline && (isNaN(Number(deadline)) || BigInt(deadline) < 0n)) {
    throw new Error("Invalid deadline value.");
  }
  return deadline ? unixTimestamp + BigInt(deadline) : unixTimestamp + 1000n;
};

/**
 * Get the signature.
 * @param param - The parameter object containing necessary data to get the signature.
 * @param param.state - The IP Account's state.
 * @param param.to - The recipient address.
 * @param param.encodeData - The encoded data.
 * @param param.wallet - The wallet client.
 * @param param.verifyingContract - The verifying contract.
 * @param param.deadline - The deadline.
 * @param param.chainId - The chain ID.
 * @returns A Promise that resolves to the signature.
 */
export const getSignature = async ({
  state,
  to,
  encodeData,
  wallet,
  verifyingContract,
  deadline,
  chainId,
}: SignatureRequest): Promise<SignatureResponse> => {
  if (!(wallet as WalletClient).signTypedData) {
    throw new Error("The wallet client does not support signTypedData, please try again.");
  }
  if (!wallet.account) {
    throw new Error("The wallet client does not have an account, please try again.");
  }
  const nonce = keccak256(
    encodeAbiParameters(
      [
        { name: "", type: "bytes32" },
        { name: "", type: "bytes" },
      ],
      [
        state,
        encodeFunctionData({
          abi: ipAccountImplAbi,
          functionName: "execute",
          args: [to, 0n, encodeData],
        }),
      ],
    ),
  );
  return await (wallet as WalletClient).signTypedData({
    account: wallet.account,
    domain: {
      name: "Story Protocol IP Account",
      version: "1",
      chainId: Number(chainId),
      verifyingContract,
    },
    types: {
      Execute: [
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "data", type: "bytes" },
        { name: "nonce", type: "bytes32" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "Execute",
    message: {
      to,
      value: BigInt(0),
      data: encodeData,
      nonce,
      deadline: BigInt(deadline),
    },
  });
};
