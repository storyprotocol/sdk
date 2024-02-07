import { PublicClient, WalletClient, getAddress, Hex, encodeFunctionData } from "viem";

import { handleError } from "../utils/errors";
import { setPermissionsRequest, setPermissionsResponse } from "../types/resources/permission";
import { IPAccountImplMerged } from "../abi/ipAccountImpl.abi";
import { AccessControllerABImerged } from "../abi/accessController.abi";

// import { HashZero } from "../constants/common";

export class PermissionClient {
  private readonly wallet: WalletClient;
  private readonly rpcClient: PublicClient;

  constructor(rpcClient: PublicClient, wallet: WalletClient) {
    this.rpcClient = rpcClient;
    this.wallet = wallet;
  }

  /**
   * Set Permission based on the specified input
   *
   * @param request - the request object that contains all data needed to set permission.
   * @returns the response object that contains results from the set permission.
   */
  public async setPermission(request: setPermissionsRequest): Promise<setPermissionsResponse> {
    try {
      const IPAccountConfig = {
        abi: IPAccountImplMerged,
        address: getAddress(request.ipAsset),
      };
      const accessController = getAddress(
        process.env.ACCESS_CONTROLLER || process.env.NEXT_PUBLIC_ACCESS_CONTROLLER || "",
      ); //to
      const { request: call } = await this.rpcClient.simulateContract({
        ...IPAccountConfig,
        functionName: "execute",
        args: [
          accessController,
          0,
          encodeFunctionData({
            abi: AccessControllerABImerged,
            functionName: "setPermission",
            args: [
              getAddress(request.ipAsset), // 0x Address
              getAddress(request.signer), // 0x Address
              getAddress(request.to), // 0x Address
              request.func as Hex, // bytes4
              request.permission, // uint8
            ],
          }),
        ],
        account: this.wallet.account,
      });

      const txHash = await this.wallet.writeContract(call);
      // TODO: the emit event doesn't return anything
      // if (request.txOptions?.waitForTransaction) {
      //   await waitTxAndFilterLog(this.rpcClient, txHash, {
      //     ...AccessControllerConfig,
      //     eventName: "PermissionSet",
      //   });
      //   return { txHash: txHash };
      // } else {
      return { txHash: txHash };
      // }
    } catch (error) {
      handleError(error, "Failed to set permissions");
    }
  }
}
