import {
  PublicClient,
  WalletClient,
  http,
  createPublicClient,
  createWalletClient,
  Hex,
  Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { chainStringToViemChain, waitTx } from "../../../src/utils/utils";
import { RPC, homer } from "./util";
import { mockErc20Address } from "../../../src/abi/generated";
export class MockERC20 {
  private publicClient: PublicClient;
  private walletClient: WalletClient;
  public address: Address = mockErc20Address[homer];

  constructor(address?: Address) {
    const baseConfig = {
      chain: chainStringToViemChain("homer"),
      transport: http(RPC),
    } as const;
    this.publicClient = createPublicClient(baseConfig);
    this.walletClient = createWalletClient({
      ...baseConfig,
      account: privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as Hex),
    });
    this.address = address || mockErc20Address[homer];
  }

  public async approve(contract: Address): Promise<void> {
    const abi = [
      {
        inputs: [
          {
            internalType: "address",
            name: "spender",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
        ],
        name: "approve",
        outputs: [
          {
            internalType: "bool",
            name: "",
            type: "bool",
          },
        ],
        stateMutability: "nonpayable",
        type: "function",
      },
    ];
    const { request: call } = await this.publicClient.simulateContract({
      abi: abi,
      address: this.address,
      functionName: "approve",
      args: [contract, BigInt(100000 * 10 ** 6)],
      account: this.walletClient.account,
    });
    const approveHash = await this.walletClient.writeContract(call);
    await waitTx(this.publicClient, approveHash);
  }

  public async mint(): Promise<void> {
    const { request } = await this.publicClient.simulateContract({
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "mint",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      address: this.address,
      functionName: "mint",
      account: this.walletClient.account,
      args: [process.env.TEST_WALLET_ADDRESS! as Address, BigInt(100000 * 10 ** 6)],
    });
    const mintHash = await this.walletClient.writeContract(request);
    await waitTx(this.publicClient, mintHash);
  }
}
