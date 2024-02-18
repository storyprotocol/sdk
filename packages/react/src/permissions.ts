import { useCallback } from "react";
import { useExecute } from "./generated/ipAccountImpl";
import { CreateUseWriteContractParameters } from "wagmi/dist/types/hooks/codegen/createUseWriteContract";

export function useSetPermission() {
  const { writeContractAsync: writeContractAsyncRaw, ...state } = useExecute();

  const writeContractAsync: typeof writeContractAsyncRaw = useCallback(
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
      return await writeContractAsyncRaw({
        functionName: "execute",
        address: address,
        args: [args.ipAsset, args.signer, args.to, args.func, BigInt(args.permission)],
      });
    },
    [writeContractAsyncRaw],
  );

  return { writeContractAsync, ...state };
}
