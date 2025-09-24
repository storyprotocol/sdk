import { expect } from "chai";
import { stub } from "sinon";

import { TotalLicenseTokenLimitHookClient } from "../../../src/abi/generated";
import { setMaxLicenseTokens, SetMaxLicenseTokens } from "../../../src/utils/setMaxLicenseTokens";
import { mockAddress, txHash } from "../mockData";
import { createMockPublicClient, createMockWalletClient } from "../testUtils";

describe("Test setMaxLicenseTokens", () => {
  const mockTotalLicenseTokenLimitHookClient = new TotalLicenseTokenLimitHookClient(
    createMockPublicClient(),
    createMockWalletClient(),
  );

  beforeEach(() => {
    stub(mockTotalLicenseTokenLimitHookClient, "setTotalLicenseTokenLimit").resolves(txHash);
  });

  it("should return empty array when maxLicenseTokensData is empty", async () => {
    const params: SetMaxLicenseTokens = {
      maxLicenseTokensData: [],
      licensorIpId: mockAddress,
      licenseTermsIds: [1n, 2n, 3n],
      totalLicenseTokenLimitHookClient: mockTotalLicenseTokenLimitHookClient,
      templateAddress: mockAddress,
    };

    const result = await setMaxLicenseTokens(params);

    expect(result).to.deep.equal([]);
  });

  it("should skip items with negative maxLicenseTokens", async () => {
    const params: SetMaxLicenseTokens = {
      maxLicenseTokensData: [
        { maxLicenseTokens: 100n },
        { maxLicenseTokens: -1n },
        { maxLicenseTokens: 200n },
      ],
      licensorIpId: mockAddress,
      licenseTermsIds: [1n, 2n, 3n],
      totalLicenseTokenLimitHookClient: mockTotalLicenseTokenLimitHookClient,
      templateAddress: mockAddress,
    };

    const result = await setMaxLicenseTokens(params);

    expect(result).to.have.length(2);
  });
});
