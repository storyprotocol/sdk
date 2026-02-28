import { expect } from "chai";
import { Address, zeroAddress } from "viem";

import { erc20Address, wrappedIpAddress } from "../../../src/abi/generated";
import { validateCurrencyToken } from "../../../src/utils/currencyValidation";
import { aeneid } from "../mockData";

const mainnetChainId = 1514;

describe("validateCurrencyToken", () => {
  it("should throw when token is zero address", () => {
    expect(() => validateCurrencyToken(zeroAddress, aeneid)).to.throw(
      "Currency token cannot be zero address.",
    );
    expect(() => validateCurrencyToken(zeroAddress, mainnetChainId)).to.throw(
      "Currency token cannot be zero address.",
    );
  });

  it("should allow WIP on Aeneid Testnet", () => {
    expect(() => validateCurrencyToken(wrappedIpAddress[aeneid], aeneid)).to.not.throw();
  });

  it("should allow MERC20 on Aeneid Testnet", () => {
    expect(() => validateCurrencyToken(erc20Address[aeneid], aeneid)).to.not.throw();
  });

  it("should throw when token is not WIP or MERC20 on Aeneid Testnet", () => {
    expect(() =>
      validateCurrencyToken("0x73fcb515cee99e4991465ef586cfe2b072ebb513" as `0x${string}`, aeneid),
    ).to.throw(
      "On Aeneid Testnet, only WIP or MERC20 is allowed as currency token. The provided token is not allowed.",
    );
  });

  it("should allow WIP on Mainnet", () => {
    expect(() => validateCurrencyToken(wrappedIpAddress[mainnetChainId], mainnetChainId)).to.not
      .throw();
  });

  it("should throw when token is MERC20 on Mainnet", () => {
    expect(() => validateCurrencyToken(erc20Address[mainnetChainId], mainnetChainId)).to.throw(
      "On Mainnet, only WIP is allowed as currency token. The provided token is not allowed.",
    );
  });

  it("should throw when token is not WIP on Mainnet", () => {
    expect(() =>
      validateCurrencyToken("0x73fcb515cee99e4991465ef586cfe2b072ebb513" as `0x${string}`, mainnetChainId),
    ).to.throw(
      "On Mainnet, only WIP is allowed as currency token. The provided token is not allowed.",
    );
  });

  it("should throw for unsupported chain ID", () => {
    const validAddress = "0x1514000000000000000000000000000000000000" as Address;
    expect(() =>
      validateCurrencyToken(validAddress, 9999 as 1315 | 1514),
    ).to.throw("Unsupported chain ID: 9999.");
  });
});
