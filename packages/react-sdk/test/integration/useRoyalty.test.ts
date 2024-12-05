import { act, renderHook } from "@testing-library/react";
import { Address, encodeFunctionData } from "viem";

import { useIpAccount, useIpAsset, useLicense, useRoyalty } from "../../src";
import Wrapper from "./utils/Wrapper";
import { getTokenId, mockERC20Address, mockERC721Address } from "./utils/util";

describe("useRoyalty Functions", () => {
  const {
    result: { current: royaltyHook },
  } = renderHook(() => useRoyalty(), { wrapper: Wrapper });
  const {
    result: { current: ipAssetHook },
  } = renderHook(() => useIpAsset(), { wrapper: Wrapper });
  const {
    result: { current: licenseHook },
  } = renderHook(() => useLicense(), { wrapper: Wrapper });
  const {
    result: { current: ipAccountHook },
  } = renderHook(() => useIpAccount(), { wrapper: Wrapper });
  let ipId1: Address;
  let ipId2: Address;

  const getIpId = async (): Promise<Address> => {
    const tokenId = await getTokenId();
    return await act(async () => {
      return (
        await ipAssetHook.register({
          nftContract: mockERC721Address,
          tokenId: tokenId!,
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).ipId!;
    });
  };
  const getCommercialPolicyId = async (): Promise<bigint> => {
    return await act(async () => {
      return (
        await licenseHook.registerCommercialUsePIL({
          mintingFee: "1",
          currency: mockERC20Address,
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).licenseTermsId!;
    });
  };

  const attachLicenseTerms = async (ipId: Address, licenseTermsId: bigint) => {
    await act(async () => {
      await licenseHook.attachLicenseTerms({
        ipId,
        licenseTermsId: licenseTermsId,
        txOptions: {
          waitForTransaction: true,
        },
      });
    });
  };
  beforeAll(async () => {
    ipId1 = await getIpId();
    ipId2 = await getIpId();
    const licenseTermsId = await getCommercialPolicyId();
    await attachLicenseTerms(ipId1, licenseTermsId);
    await act(async () => {
      await ipAssetHook.registerDerivative({
        childIpId: ipId2,
        parentIpIds: [ipId1],
        licenseTermsIds: [licenseTermsId],
        txOptions: {
          waitForTransaction: true,
        },
      });
    });
  });

  it("should success when collect royalty tokens", async () => {
    await act(async () => {
      await expect(
        royaltyHook.collectRoyaltyTokens({
          parentIpId: ipId1,
          royaltyVaultIpId: ipId2,
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).resolves.toEqual(
        expect.objectContaining({
          txHash: expect.any(String),
          royaltyTokensCollected: expect.any(BigInt),
        })
      );
    });
  });

  it("should success when pay royalty on behalf", async () => {
    await act(async () => {
      await expect(
        royaltyHook.payRoyaltyOnBehalf({
          receiverIpId: ipId1,
          payerIpId: ipId2,
          token: mockERC20Address,
          amount: "10",
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).resolves.toEqual(
        expect.objectContaining({
          txHash: expect.any(String),
        })
      );
    });
  });

  it.skip("should success when snapshot", async () => {
    await act(async () => {
      await expect(
        royaltyHook.snapshot({
          royaltyVaultIpId: ipId1,
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).resolves.toEqual(
        expect.objectContaining({
          txHash: expect.any(String),
          snapshotId: expect.any(BigInt),
        })
      );
    });
  });
  it.skip("should success when claimable revenue", async () => {
    await act(async () => {
      await expect(
        royaltyHook.claimableRevenue({
          royaltyVaultIpId: ipId1,
          account: ipId1,
          snapshotId: "1",
          token: mockERC20Address,
        })
      ).resolves.toEqual(expect.any(BigInt));
    });
  });

  it.skip("should success when claim revenue by ipAccount", async () => {
    await act(async () => {
      await expect(
        royaltyHook.claimRevenue({
          royaltyVaultIpId: ipId1,
          snapshotIds: ["1"],
          account: ipId1,
          token: mockERC20Address,
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).resolves.toEqual(
        expect.objectContaining({
          txHash: expect.any(String),
          claimableToken: expect.any(BigInt),
        })
      );
    });
  });

  it.skip("should success when claim revenue by ipAccount by EOA", async () => {
    const proxyAddress = await royaltyHook.getRoyaltyVaultAddress(ipId1);
    //1.transfer token to eoa
    await act(async () => {
      await ipAccountHook.execute({
        to: proxyAddress,
        value: 0,
        ipId: ipId1,
        txOptions: {
          waitForTransaction: true,
        },
        data: encodeFunctionData({
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
                  name: "value",
                  type: "uint256",
                },
              ],
              name: "transfer",
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
          ],
          functionName: "transfer",
          args: [
            process.env.TEST_WALLET_ADDRESS as Address,
            BigInt(10 * 10 ** 6),
          ],
        }),
      });
    });
    //2. transfer token to royaltyVault，revenue token
    await act(async () => {
      await royaltyHook.payRoyaltyOnBehalf({
        receiverIpId: ipId1,
        payerIpId: ipId2,
        token: mockERC20Address,
        amount: "10",
        txOptions: {
          waitForTransaction: true,
        },
      });
    });
    //3. snapshot
    let snapshotId: bigint;
    await act(async () => {
      snapshotId = (
        await royaltyHook.snapshot({
          royaltyVaultIpId: ipId1,
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).snapshotId!;
    });
    //4. claim revenue
    await act(async () => {
      await expect(
        royaltyHook.claimRevenue({
          royaltyVaultIpId: ipId1,
          snapshotIds: [snapshotId],
          token: mockERC20Address,
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).resolves.toEqual(
        expect.objectContaining({
          txHash: expect.any(String),
          claimableToken: expect.any(BigInt),
        })
      );
    });
  });
});
