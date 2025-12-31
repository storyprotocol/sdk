import { expect } from "chai";
import { SinonStub, stub } from "sinon";
import { zeroAddress, zeroHash } from "viem";

import {
  PiLicenseTemplateReadOnlyClient,
  RoyaltyModuleReadOnlyClient,
  totalLicenseTokenLimitHookAddress,
} from "../../../src/abi/generated";
import { LicensingConfig } from "../../../src/types/common";
import { LicenseTerms } from "../../../src/types/resources/license";
import { validateLicenseTermsData } from "../../../src/utils/registrationUtils/registerValidation";
import { aeneid, mockAddress } from "../mockData";
import { createMockPublicClient } from "../testUtils";

describe("validateLicenseTermsData", () => {
  let rpcClient: ReturnType<typeof createMockPublicClient>;

  const mockLicenseTerms: LicenseTerms = {
    transferable: true,
    royaltyPolicy: zeroAddress,
    defaultMintingFee: 0n,
    expiration: 0n,
    commercialUse: false,
    commercialAttribution: false,
    commercializerChecker: zeroAddress,
    commercializerCheckerData: zeroAddress,
    commercialRevShare: 0,
    commercialRevCeiling: 0n,
    derivativesAllowed: true,
    derivativesAttribution: true,
    derivativesApproval: false,
    derivativesReciprocal: true,
    derivativeRevCeiling: 0n,
    currency: zeroAddress,
    uri: "",
  };
  let isWhitelistedRoyaltyPolicyStub: SinonStub;
  let isWhitelistedRoyaltyTokenStub: SinonStub;
  let existsStub: SinonStub;

  beforeEach(() => {
    rpcClient = createMockPublicClient();
    isWhitelistedRoyaltyPolicyStub = stub(
      RoyaltyModuleReadOnlyClient.prototype,
      "isWhitelistedRoyaltyPolicy",
    );
    isWhitelistedRoyaltyTokenStub = stub(
      RoyaltyModuleReadOnlyClient.prototype,
      "isWhitelistedRoyaltyToken",
    );
    existsStub = stub(PiLicenseTemplateReadOnlyClient.prototype, "exists").resolves(true);
    stub(PiLicenseTemplateReadOnlyClient.prototype, "getLicenseTerms").resolves({
      terms: mockLicenseTerms,
    });
  });
  it("should throw error when royalty policy is not whitelisted", async () => {
    isWhitelistedRoyaltyPolicyStub.resolves(false);
    await expect(
      validateLicenseTermsData(
        [
          {
            terms: {
              ...mockLicenseTerms,
              royaltyPolicy: mockAddress,
              currency: mockAddress,
              commercialUse: true,
            },
          },
        ],
        rpcClient,
        aeneid,
      ),
    ).to.be.rejectedWith(`The royalty policy ${mockAddress} is not whitelisted.`);
  });
  it("should throw error when currency token is not whitelisted", async () => {
    isWhitelistedRoyaltyPolicyStub.resolves(true);
    isWhitelistedRoyaltyTokenStub.resolves(false);
    await expect(
      validateLicenseTermsData(
        [
          {
            terms: {
              ...mockLicenseTerms,
              currency: mockAddress,
              royaltyPolicy: mockAddress,
              commercialUse: true,
            },
          },
        ],
        rpcClient,
        aeneid,
      ),
    ).to.be.rejectedWith(`The currency token ${mockAddress} is not whitelisted.`);
  });

  it("should throw error when revenue share is more than 100", async () => {
    await expect(
      validateLicenseTermsData(
        [
          {
            terms: {
              ...mockLicenseTerms,
              commercialRevShare: 101,
              commercialUse: true,
              royaltyPolicy: mockAddress,
              currency: mockAddress,
            },
          },
        ],
        rpcClient,
        aeneid,
      ),
    ).to.be.rejectedWith("commercialRevShare must be between 0 and 100.");
  });
  it("should throw error when defaultMintingFee is less than 0", async () => {
    await expect(
      validateLicenseTermsData(
        [{ terms: { ...mockLicenseTerms, defaultMintingFee: -1 } }],
        rpcClient,
        aeneid,
      ),
    ).to.be.rejectedWith("DefaultMintingFee should be greater than or equal to 0.");
  });
  it("should throw error when neither terms nor licenseTermsId is provided", async () => {
    await expect(validateLicenseTermsData([{}], rpcClient, aeneid)).to.be.rejectedWith(
      "Either terms or licenseTermsId must be provided.",
    );
  });
  it("should throw error when license terms id does not exist", async () => {
    existsStub.resolves(false);
    await expect(
      validateLicenseTermsData([{ licenseTermsId: 999 }], rpcClient, aeneid),
    ).to.be.rejectedWith("The license terms id 999 is not exist.");
  });
  it("should throw error when mintingFee is less than 0 in licensingConfig", async () => {
    await expect(
      validateLicenseTermsData(
        [
          {
            terms: mockLicenseTerms,
            licensingConfig: {
              isSet: true,
              mintingFee: -1,
              licensingHook: zeroAddress,
              hookData: zeroAddress,
              commercialRevShare: 0,
              disabled: false,
              expectMinimumGroupRewardShare: 0,
              expectGroupRewardPool: zeroAddress,
            },
          },
        ],
        rpcClient,
        aeneid,
      ),
    ).to.be.rejectedWith("The mintingFee must be greater than 0.");
  });

  it("should throw error when mintingFee is greater than 0 and royaltyPolicy is zero address", async () => {
    await expect(
      validateLicenseTermsData(
        [
          {
            terms: { ...mockLicenseTerms, royaltyPolicy: zeroAddress },
            licensingConfig: {
              isSet: true,
              mintingFee: 1,
              licensingHook: zeroAddress,
              hookData: zeroAddress,
              commercialRevShare: 0,
              disabled: false,
              expectMinimumGroupRewardShare: 0,
              expectGroupRewardPool: zeroAddress,
            },
          },
        ],
        rpcClient,
        aeneid,
      ),
    ).to.be.rejectedWith(
      "A royalty policy must be provided when the minting fee is greater than 0.",
    );
  });
  it("should throw error when maxLicenseTokens is less than 0", async () => {
    await expect(
      validateLicenseTermsData(
        [{ terms: mockLicenseTerms, maxLicenseTokens: -1 }],
        rpcClient,
        aeneid,
      ),
    ).to.be.rejectedWith("The max license tokens must be greater than or equal to 0.");
  });

  it("should return licenseTerms and licenseTermsData when terms is provided", async () => {
    const result = await validateLicenseTermsData([{ terms: mockLicenseTerms }], rpcClient, aeneid);
    expect(result.licenseTerms).to.deep.equal([mockLicenseTerms]);
    expect(result.licenseTermsData).to.deep.equal([
      {
        terms: mockLicenseTerms,
        licensingConfig: {
          isSet: false,
          mintingFee: 0n,
          licensingHook: zeroAddress,
          hookData: zeroHash,
          commercialRevShare: 0,
          disabled: false,
          expectMinimumGroupRewardShare: 0,
          expectGroupRewardPool: zeroAddress,
        },
      },
    ]);
    expect(result.maxLicenseTokens).to.deep.equal([]);
  });
  it("should return licenseTerms and licenseTermsData when licenseTermsId is provided", async () => {
    const result = await validateLicenseTermsData([{ licenseTermsId: 1 }], rpcClient, aeneid);
    expect(result.licenseTerms).to.deep.equal([mockLicenseTerms]);
    expect(result.licenseTermsData).to.deep.equal([
      {
        terms: mockLicenseTerms,
        licensingConfig: {
          isSet: false,
          mintingFee: 0n,
          licensingHook: zeroAddress,
          hookData: zeroHash,
          commercialRevShare: 0,
          disabled: false,
          expectMinimumGroupRewardShare: 0,
          expectGroupRewardPool: zeroAddress,
        },
      },
    ]);
    expect(result.maxLicenseTokens).to.deep.equal([]);
  });
  it("should return licenseTerms and licenseTermsData when terms, licenseTermsId,maxLicenseTokens and licensingConfig are provided", async () => {
    isWhitelistedRoyaltyPolicyStub.resolves(true);
    isWhitelistedRoyaltyTokenStub.resolves(true);

    const firstLicenseTerms: LicenseTerms = {
      ...mockLicenseTerms,
      royaltyPolicy: mockAddress,
      currency: mockAddress,
      defaultMintingFee: 1n,
      commercialUse: true,
    };
    const secondLicenseTerms: LicenseTerms = {
      ...mockLicenseTerms,
      royaltyPolicy: mockAddress,
      currency: mockAddress,
      defaultMintingFee: 2n,
      commercialUse: true,
    };
    const firstLicensingConfig: LicensingConfig = {
      isSet: true,
      mintingFee: 1n,
      licensingHook: zeroAddress,
      hookData: zeroAddress,
      commercialRevShare: 0,
      disabled: false,
      expectMinimumGroupRewardShare: 0,
      expectGroupRewardPool: zeroAddress,
    };
    const secondLicensingConfig: LicensingConfig = {
      isSet: true,
      mintingFee: 0n,
      licensingHook: zeroAddress,
      hookData: zeroAddress,
      commercialRevShare: 0,
      disabled: false,
      expectMinimumGroupRewardShare: 0,
      expectGroupRewardPool: zeroAddress,
    };
    const defaultLicensingConfig: LicensingConfig = {
      isSet: false,
      mintingFee: 0n,
      licensingHook: zeroAddress,
      hookData: zeroHash,
      commercialRevShare: 0,
      disabled: false,
      expectMinimumGroupRewardShare: 0,
      expectGroupRewardPool: zeroAddress,
    };

    const result = await validateLicenseTermsData(
      [
        {
          terms: firstLicenseTerms,
          licensingConfig: firstLicensingConfig,
          maxLicenseTokens: 100,
        },
        {
          licenseTermsId: 2,
          licensingConfig: secondLicensingConfig,
          maxLicenseTokens: 200,
        },
        {
          terms: secondLicenseTerms,
        },
      ],
      rpcClient,
      aeneid,
    );
    expect(result.licenseTerms).to.deep.equal([
      firstLicenseTerms,
      mockLicenseTerms,
      secondLicenseTerms,
    ]);
    expect(result.licenseTermsData).to.deep.equal([
      {
        terms: firstLicenseTerms,
        licensingConfig: {
          ...firstLicensingConfig,
          licensingHook: totalLicenseTokenLimitHookAddress[aeneid],
        },
      },
      {
        terms: mockLicenseTerms,
        licensingConfig: {
          ...secondLicensingConfig,
          licensingHook: totalLicenseTokenLimitHookAddress[aeneid],
        },
      },
      {
        terms: secondLicenseTerms,
        licensingConfig: defaultLicensingConfig,
      },
    ]);
    expect(result.maxLicenseTokens).to.deep.equal([100n, 200n]);
  });
});
