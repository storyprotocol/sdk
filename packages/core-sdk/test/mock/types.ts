import type { Hex } from "viem";

/**
 * Request to get the balance of a mock ERC20 token
 * @param owner - the address to get the balance of
 * @param [convertToDisplay] - if true, divide the raw Solidity balance by the token's decimals (amount / 10^decimals)
 */
export type BalanceOfMockERC20Request = {
  owner: Hex;
  convertToDisplay?: boolean;
};

/**
 * Response from getting the balance of a mock ERC20 token. `number` if `convertToDisplay` is true, `bigint` otherwise
 */
export type BalanceOfMockERC20Response = BalanceOfMockERC20Request["convertToDisplay"] extends true
  ? number
  : bigint;

/**
 * Request to mint a mock ERC20 token
 * @param to - the address to mint the token to
 * @param amount - the amount to mint
 */
export type MintMockERC20Request = {
  to: Hex;
  amount: string;
};

/**
 * Request to approve a mock ERC20 token
 * @param spender - the address to approve
 * @param amount - the amount to approve
 */
export type ApproveMockERC20Request = {
  spender: Hex;
  amount: string;
};

/**
 * Request to get the allowance of a mock ERC20 token
 * @param owner - the owner of the tokens
 * @param spender - the spender of the tokens
 */
export type AllowanceMockERC20Request = {
  owner: Hex;
  spender: Hex;
};

/**
 * Request to mint a mock ERC721 token
 * @param to - the address to mint the token to
 * @param [id] - if provided, will try to mint this ID
 */
export type MintMockERC721Request = {
  to: Hex;
  id?: bigint;
};
