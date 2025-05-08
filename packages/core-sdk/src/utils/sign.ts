import {
  WalletClient,
  encodeAbiParameters,
  encodeFunctionData,
  keccak256,
  toFunctionSelector,
} from "viem";

import { accessControllerAbi, accessControllerAddress, ipAccountImplAbi } from "../abi/generated";
import { validateAddress } from "./utils";
import { defaultFunctionSelector } from "../constants/common";
import {
  PermissionSignatureRequest,
  SignatureRequest,
  SignatureResponse,
} from "../types/resources/permission";

/**
 * Get the signature for setting permissions.
 */
export const getPermissionSignature = async (
  param: PermissionSignatureRequest,
): Promise<SignatureResponse> => {
  const { ipId, deadline, state, wallet, chainId, permissions } = param;
  const accessAddress = accessControllerAddress[chainId];
  const isBatchPermissionFunction = permissions.length >= 2;
  const data = encodeFunctionData({
    abi: accessControllerAbi,
    functionName: isBatchPermissionFunction
      ? "setBatchTransientPermissions"
      : "setTransientPermission",
    args: isBatchPermissionFunction
      ? [
          permissions.map((item) => ({
            ipAccount: validateAddress(item.ipId),
            signer: validateAddress(item.signer),
            to: validateAddress(item.to),
            func: item.func ? toFunctionSelector(item.func) : defaultFunctionSelector,
            permission: item.permission,
          })),
        ]
      : [
          validateAddress(permissions[0].ipId),
          validateAddress(permissions[0].signer),
          validateAddress(permissions[0].to),
          permissions[0].func ? toFunctionSelector(permissions[0].func) : defaultFunctionSelector,
          permissions[0].permission,
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
  const signature = await (wallet as WalletClient).signTypedData({
    account: wallet.account,
    domain: {
      name: "Story Protocol IP Account",
      version: "1",
      chainId,
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
  return { signature, nonce };
};
