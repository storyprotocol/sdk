import { useCallback } from "react";
import { useExecute } from "./generated/ipAccountImpl";

interface SetPermissionState {
  // Define the structure expected in your state
  isPending: boolean;
}

interface SetPermissionArgs {
  address: `0x${string}`;
  args: {
    ipAsset: `0x${string}`;
    signer: `0x${string}`;
    to: `0x${string}`;
    func: string;
    permission: string | number | bigint;
  };
}

export function useSetPermission(): {
  writeContractAsync: (args: SetPermissionArgs) => Promise<void>;
  state: SetPermissionState;
} {
  const { writeContractAsync: writeContractAsyncRaw, ...state } = useExecute();

  const writeContractAsync = useCallback(
    async ({
      address,
      args,
    }: {
      address: `0x${string}`;
      args: {
        ipAsset: `0x${string}`;
        signer: `0x${string}`;
        to: `0x${string}`;
        func: string;
        permission: string | number | bigint;
      };
    }) => {
      await writeContractAsyncRaw({
        functionName: "execute",
        address: address,
        args: [args.ipAsset, args.signer, args.to, args.func, BigInt(args.permission)],
      });
    },
    [writeContractAsyncRaw],
  );

  return { writeContractAsync, ...state };
}
