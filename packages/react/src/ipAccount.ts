import { useCallback } from "react";
import { useWriteIpAccountImplExecute } from "./generated/ipAccountImpl";

// Define the type for the setPermission function
type SetPermissionFunction = (ip: string, permission: string, value: boolean) => Promise<void>;

// // Define the type for the hook return value
// interface UseSetPermissionReturn {
//   setPermission: SetPermissionFunction;
//   // ... other state properties
// }

export function useSetPermission(): any {
  // This hook returns an object with { execute, isLoading, isError, etc. }
  const { writeContractAsync: writeContractAsyncRaw, ...state } = useWriteIpAccountImplExecute();

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
        address: address,
        args: [args.ipAsset, args.signer, args.to, args.func, args.permission],
      });
    },
    [writeContractAsyncRaw],
  );

  return { writeContractAsync, ...state };
}
