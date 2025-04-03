import { Address, Hex, encodeFunctionData, PublicClient } from "viem";

import {
  IPAccountExecuteRequest,
  IPAccountExecuteResponse,
  IPAccountExecuteWithSigRequest,
  IPAccountExecuteWithSigResponse,
  IpAccountStateResponse,
  SetIpMetadataRequest,
  TokenResponse,
  TransferErc20Request,
} from "../types/resources/ipAccount";
import { handleError } from "../utils/errors";
import {
  coreMetadataModuleAbi,
  coreMetadataModuleAddress,
  Erc20Client,
  IpAccountImplClient,
  SimpleWalletClient,
  WrappedIpClient,
} from "../abi/generated";
import { validateAddress } from "../utils/utils";
import { ChainIds } from "../types/config";
import { handleTxOptions } from "../utils/txOptions";
import { TransactionResponse } from "../types/options";
import { WIP_TOKEN_ADDRESS } from "../constants/common";

export class IPAccountClient {
  public wrappedIpClient: WrappedIpClient;
  public erc20Client: Erc20Client;
  private readonly wallet: SimpleWalletClient;
  private readonly rpcClient: PublicClient;
  private readonly chainId: ChainIds;
  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, chainId: ChainIds) {
    this.wallet = wallet;
    this.rpcClient = rpcClient;
    this.chainId = chainId;
    this.wrappedIpClient = new WrappedIpClient(rpcClient, wallet);
    this.erc20Client = new Erc20Client(rpcClient, wallet);
  }

  /**
   * Executes a transaction from the IP Account.
   */
  public async execute(request: IPAccountExecuteRequest): Promise<IPAccountExecuteResponse> {
    try {
      const ipAccountClient = new IpAccountImplClient(
        this.rpcClient,
        this.wallet,
        validateAddress(request.ipId),
      );

      const req = {
        to: request.to,
        value: BigInt(0),
        data: request.data,
      };

      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData: ipAccountClient.executeEncode({ ...req, operation: 0 }) };
      } else {
        const txHash = await ipAccountClient.execute({ ...req, operation: 0 });

        if (request.txOptions?.waitForTransaction) {
          await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
        }
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to execute the IP Account transaction");
    }
  }

  /**
   * Executes a transaction from the IP Account with a signature.
   */
  public async executeWithSig(
    request: IPAccountExecuteWithSigRequest,
  ): Promise<IPAccountExecuteWithSigResponse> {
    try {
      const ipAccountClient = new IpAccountImplClient(
        this.rpcClient,
        this.wallet,
        validateAddress(request.ipId),
      );

      const req = {
        to: validateAddress(request.to),
        value: BigInt(request.value || 0),
        data: request.data,
        signer: validateAddress(request.signer),
        deadline: BigInt(request.deadline),
        signature: request.signature,
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData: ipAccountClient.executeWithSigEncode(req) };
      } else {
        const txHash = await ipAccountClient.executeWithSig(req);

        if (request.txOptions?.waitForTransaction) {
          await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
        }
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to execute with signature for the IP Account transaction");
    }
  }

  /**
   * Returns the IPAccount's internal nonce for transaction ordering.
   */
  public async getIpAccountNonce(ipId: Address): Promise<IpAccountStateResponse> {
    try {
      const ipAccount = new IpAccountImplClient(this.rpcClient, this.wallet, validateAddress(ipId));
      const { result: state } = await ipAccount.state();
      return state;
    } catch (error) {
      handleError(error, "Failed to get the IP Account nonce");
    }
  }

  /**
   * Returns the identifier of the non-fungible token which owns the account
   */
  public async getToken(ipId: Address): Promise<TokenResponse> {
    try {
      const ipAccount = new IpAccountImplClient(this.rpcClient, this.wallet, validateAddress(ipId));
      const [chainId, tokenContract, tokenId] = await ipAccount.token();
      return {
        chainId,
        tokenContract,
        tokenId,
      };
    } catch (error) {
      handleError(error, "Failed to get the token");
    }
  }
  /**
   * Sets the metadataURI for an IP asset.
   */
  public async setIpMetadata({
    ipId,
    metadataURI,
    metadataHash,
    txOptions,
  }: SetIpMetadataRequest): Promise<Hex> {
    try {
      const data = encodeFunctionData({
        abi: coreMetadataModuleAbi,
        functionName: "setMetadataURI",
        args: [validateAddress(ipId), metadataURI, metadataHash],
      });
      const { txHash } = await this.execute({
        ipId: ipId,
        to: coreMetadataModuleAddress[this.chainId],
        data: data,
        value: 0,
        txOptions: {
          ...txOptions,
          encodedTxDataOnly: false,
        },
      });
      return txHash!;
    } catch (error) {
      handleError(error, "Failed to set the IP metadata");
    }
  }

  /**
   * Transfers ERC20 tokens from the IP Account to the target address.
   */
  public async transferErc20({
    ipId,
    tokens,
    txOptions,
  }: TransferErc20Request): Promise<TransactionResponse> {
    try {
      const ipAccount = new IpAccountImplClient(this.rpcClient, this.wallet, validateAddress(ipId));
      const calls = tokens.map(({ address: token, target, amount }) => {
        let encodedData: Hex;
        if (validateAddress(token) === WIP_TOKEN_ADDRESS) {
          encodedData = this.wrappedIpClient.transferEncode({
            to: validateAddress(target),
            amount: BigInt(amount),
          }).data;
        } else {
          encodedData = this.erc20Client.transferEncode({
            to: validateAddress(target),
            value: BigInt(amount),
          }).data;
        }
        return {
          target: token,
          data: encodedData,
          value: 0n,
        };
      });
      const txHash = await ipAccount.executeBatch({ calls, operation: 0 });
      return handleTxOptions({
        txHash,
        txOptions,
        rpcClient: this.rpcClient,
      });
    } catch (error) {
      handleError(error, "Failed to transfer Erc20");
    }
  }
}
