import { Address, Hex, LocalAccount, PrivateKeyAccount, getAddress } from "viem";

import { accessControllerAddress } from "../abi/generated";

export const getPermissionSignature = async (params: {
  ipId: Address;
  nonce: number | bigint;
  deadline: bigint;
  data: Hex;
  account: LocalAccount | PrivateKeyAccount;
  chainId: bigint;
}): Promise<Hex> => {
  const { ipId, deadline, nonce, data, account, chainId } = params;
  if (!account.signTypedData) {
    throw new Error("The account does not support signTypedData, Please use a local account.");
  }
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
