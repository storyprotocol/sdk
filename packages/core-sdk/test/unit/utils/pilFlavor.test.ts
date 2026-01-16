import { expect } from "chai";
import { Address, zeroAddress } from "viem";

import { NativeRoyaltyPolicy, PILFlavor } from "../../../src";
import { WIP_TOKEN_ADDRESS } from "../../../src/constants/common";
import { invalidAddress, mockAddress, mockERC20, nonWhitelistedToken } from "../mockData";

describe("PILFlavor", () => {
  describe("nonCommercialSocialRemixing", () => {
    it("should get non commercial social remixing PIL", () => {
      const pil = PILFlavor.nonCommercialSocialRemixing();
      expect(pil).deep.equal({
        transferable: true,
        commercialAttribution: false,
        commercialRevCeiling: 0n,
        commercialRevShare: 0,
        commercialUse: false,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: zeroAddress,
        currency: zeroAddress,
        derivativeRevCeiling: 0n,
        derivativesAllowed: true,
        derivativesApproval: false,
        derivativesAttribution: true,
        derivativesReciprocal: true,
        expiration: 0n,
        defaultMintingFee: 0n,
        royaltyPolicy: zeroAddress,
        uri: "https://github.com/piplabs/pil-document/blob/998c13e6ee1d04eb817aefd1fe16dfe8be3cd7a2/off-chain-terms/NCSR.json",
      });
    });

    it("should be override by custom terms", () => {
      const pil = PILFlavor.nonCommercialSocialRemixing({
        override: {
          derivativesAttribution: false,
          derivativesReciprocal: false,
        },
      });

      expect(pil).deep.equal({
        transferable: true,
        commercialAttribution: false,
        commercialRevCeiling: 0n,
        commercialRevShare: 0,
        commercialUse: false,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: zeroAddress,
        currency: zeroAddress,
        derivativeRevCeiling: 0n,
        derivativesAllowed: true,
        derivativesApproval: false,
        derivativesAttribution: false,
        derivativesReciprocal: false,
        expiration: 0n,
        defaultMintingFee: 0n,
        royaltyPolicy: zeroAddress,
        uri: "https://github.com/piplabs/pil-document/blob/998c13e6ee1d04eb817aefd1fe16dfe8be3cd7a2/off-chain-terms/NCSR.json",
      });
    });
  });

  describe("TSSDK-135(Add validation for inputs currency and currencyToken.) commercialUse", () => {
    it("should get commercial use PIL when royaltyPolicy is not provided", () => {
      const pil = PILFlavor.commercialUse({
        defaultMintingFee: 100n,
        currency: mockAddress,
      });
      expect(pil).deep.equal({
        commercialAttribution: true,
        commercialRevCeiling: 0n,
        commercialRevShare: 0,
        commercialUse: true,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: zeroAddress,
        currency: mockAddress,
        derivativeRevCeiling: 0n,
        derivativesAllowed: false,
        derivativesApproval: false,
        derivativesAttribution: false,
        derivativesReciprocal: false,
        expiration: 0n,
        defaultMintingFee: 100n,
        royaltyPolicy: "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",
        transferable: true,
        uri: "https://github.com/piplabs/pil-document/blob/9a1f803fcf8101a8a78f1dcc929e6014e144ab56/off-chain-terms/CommercialUse.json",
      });
    });
    it("should override by custom terms", () => {
      const pil = PILFlavor.commercialUse({
        defaultMintingFee: 10n,
        currency: zeroAddress,
        chainId: "mainnet",
        royaltyPolicy: NativeRoyaltyPolicy.LRP,
        override: {
          commercialRevShare: 10,
          defaultMintingFee: 100,
          royaltyPolicy: NativeRoyaltyPolicy.LAP,
          currency: mockAddress,
        },
      });
      expect(pil).deep.equal({
        commercialAttribution: true,
        commercialRevCeiling: 0n,
        commercialRevShare: 10,
        commercialUse: true,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: zeroAddress,
        currency: mockAddress,
        derivativeRevCeiling: 0n,
        derivativesAllowed: false,
        derivativesApproval: false,
        derivativesAttribution: false,
        derivativesReciprocal: false,
        expiration: 0n,
        defaultMintingFee: 100n,
        royaltyPolicy: "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",
        transferable: true,
        uri: "https://github.com/piplabs/pil-document/blob/9a1f803fcf8101a8a78f1dcc929e6014e144ab56/off-chain-terms/CommercialUse.json",
      });
    });

    it("should allow MERC20 on aeneid (1315)", () => {
      const pil = PILFlavor.commercialUse({
        defaultMintingFee: 100n,
        currency: mockERC20,
        chainId: "aeneid",
      });
      expect(pil.currency).to.equal(mockERC20);
    });

    it("should reject MERC20 on mainnet (1514)", () => {
      expect(() =>
        PILFlavor.commercialUse({
          defaultMintingFee: 100n,
          currency: mockERC20,
          chainId: "mainnet",
        }),
      ).to.throw(`Currency token ${mockERC20} is not allowed on chain mainnet.`);
    });

    it("should reject non-whitelisted token on aeneid", () => {
      expect(() =>
        PILFlavor.commercialUse({
          defaultMintingFee: 100n,
          currency: nonWhitelistedToken,
          chainId: "aeneid",
        }),
      ).to.throw(`Currency token ${nonWhitelistedToken} is not allowed on chain aeneid.`);
    });

    it("should allow WIP on aeneid (1315)", () => {
      const pil = PILFlavor.commercialUse({
        defaultMintingFee: 100n,
        currency: WIP_TOKEN_ADDRESS,
        chainId: "aeneid",
      });
      expect(pil.currency).to.equal(WIP_TOKEN_ADDRESS);
    });

    it("should allow WIP on mainnet (1514)", () => {
      const pil = PILFlavor.commercialUse({
        defaultMintingFee: 100n,
        currency: WIP_TOKEN_ADDRESS,
        chainId: "mainnet",
      });
      expect(pil.currency).to.equal(WIP_TOKEN_ADDRESS);
    });

    it("should reject non-whitelisted token on mainnet", () => {
      expect(() =>
        PILFlavor.commercialUse({
          defaultMintingFee: 100n,
          currency: nonWhitelistedToken,
          chainId: "mainnet",
        }),
      ).to.throw(`Currency token ${nonWhitelistedToken} is not allowed on chain mainnet.`);
    });

    it("should reject invalid address on aeneid (expected: whitelist error)", () => {
      expect(() =>
        PILFlavor.commercialUse({
          defaultMintingFee: 100n,
          currency: invalidAddress as unknown as Address,
          chainId: "aeneid",
        }),
      ).to.throw(`Currency token ${invalidAddress} is not allowed on chain aeneid.`);
    });

    it("should reject invalid address on mainnet (expected: whitelist error)", () => {
      expect(() =>
        PILFlavor.commercialUse({
          defaultMintingFee: 100n,
          currency: invalidAddress as unknown as Address,
          chainId: "mainnet",
        }),
      ).to.throw(`Currency token ${invalidAddress} is not allowed on chain mainnet.`);
    });
  });

  describe("TSSDK-135(Add validation for inputs currency and currencyToken.) commercialRemix", () => {
    it("should get commercial remix PIL when royaltyPolicy is not provided", () => {
      const pil = PILFlavor.commercialRemix({
        defaultMintingFee: 100n,
        currency: mockAddress,
        commercialRevShare: 10,
      });
      expect(pil).deep.equal({
        commercialAttribution: true,
        commercialRevCeiling: 0n,
        commercialRevShare: 10,
        commercialUse: true,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: zeroAddress,
        currency: mockAddress,
        derivativeRevCeiling: 0n,
        derivativesAllowed: true,
        derivativesApproval: false,
        derivativesAttribution: true,
        derivativesReciprocal: true,
        expiration: 0n,
        defaultMintingFee: 100n,
        royaltyPolicy: "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",
        transferable: true,
        uri: "https://github.com/piplabs/pil-document/blob/ad67bb632a310d2557f8abcccd428e4c9c798db1/off-chain-terms/CommercialRemix.json",
      });
    });

    it("should override by custom terms", () => {
      const pil = PILFlavor.commercialRemix({
        defaultMintingFee: 100n,
        currency: zeroAddress,
        commercialRevShare: 10,
        chainId: "mainnet",
        royaltyPolicy: NativeRoyaltyPolicy.LRP,
        override: {
          commercialRevShare: 1,
          defaultMintingFee: 800,
          royaltyPolicy: NativeRoyaltyPolicy.LRP,
          currency: mockAddress,
        },
      });
      expect(pil).deep.equal({
        commercialAttribution: true,
        commercialRevCeiling: 0n,
        commercialRevShare: 1,
        commercialUse: true,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: zeroAddress,
        currency: mockAddress,
        derivativeRevCeiling: 0n,
        derivativesAllowed: true,
        derivativesApproval: false,
        derivativesAttribution: true,
        derivativesReciprocal: true,
        expiration: 0n,
        defaultMintingFee: 800n,
        royaltyPolicy: "0x9156e603C949481883B1d3355c6f1132D191fC41",
        transferable: true,
        uri: "https://github.com/piplabs/pil-document/blob/ad67bb632a310d2557f8abcccd428e4c9c798db1/off-chain-terms/CommercialRemix.json",
      });
    });

    it("should allow MERC20 on aeneid (1315)", () => {
      const pil = PILFlavor.commercialRemix({
        defaultMintingFee: 100n,
        currency: mockERC20,
        commercialRevShare: 10,
        chainId: "aeneid",
      });
      expect(pil.currency).to.equal(mockERC20);
    });

    it("should reject MERC20 on mainnet (1514)", () => {
      expect(() =>
        PILFlavor.commercialRemix({
          defaultMintingFee: 100n,
          currency: mockERC20,
          commercialRevShare: 10,
          chainId: "mainnet",
        }),
      ).to.throw(`Currency token ${mockERC20} is not allowed on chain mainnet.`);
    });

    it("should reject non-whitelisted token on aeneid", () => {
      expect(() =>
        PILFlavor.commercialRemix({
          defaultMintingFee: 100n,
          currency: nonWhitelistedToken,
          commercialRevShare: 10,
          chainId: "aeneid",
        }),
      ).to.throw(`Currency token ${nonWhitelistedToken} is not allowed on chain aeneid.`);
    });

    it("should allow WIP on aeneid (1315)", () => {
      const pil = PILFlavor.commercialRemix({
        defaultMintingFee: 100n,
        currency: WIP_TOKEN_ADDRESS,
        commercialRevShare: 10,
        chainId: "aeneid",
      });
      expect(pil.currency).to.equal(WIP_TOKEN_ADDRESS);
    });

    it("should allow WIP on mainnet (1514)", () => {
      const pil = PILFlavor.commercialRemix({
        defaultMintingFee: 100n,
        currency: WIP_TOKEN_ADDRESS,
        commercialRevShare: 10,
        chainId: "mainnet",
      });
      expect(pil.currency).to.equal(WIP_TOKEN_ADDRESS);
    });

    it("should reject non-whitelisted token on mainnet", () => {
      expect(() =>
        PILFlavor.commercialRemix({
          defaultMintingFee: 100n,
          currency: nonWhitelistedToken,
          commercialRevShare: 10,
          chainId: "mainnet",
        }),
      ).to.throw(`Currency token ${nonWhitelistedToken} is not allowed on chain mainnet.`);
    });

    it("should reject invalid address on aeneid (expected: whitelist error)", () => {
      expect(() =>
        PILFlavor.commercialRemix({
          defaultMintingFee: 100n,
          currency: invalidAddress as unknown as Address,
          commercialRevShare: 10,
          chainId: "aeneid",
        }),
      ).to.throw(`Currency token ${invalidAddress} is not allowed on chain aeneid.`);
    });

    it("should reject invalid address on mainnet (expected: whitelist error)", () => {
      expect(() =>
        PILFlavor.commercialRemix({
          defaultMintingFee: 100n,
          currency: invalidAddress as unknown as Address,
          commercialRevShare: 10,
          chainId: "mainnet",
        }),
      ).to.throw(`Currency token ${invalidAddress} is not allowed on chain mainnet.`);
    });
  });

  describe("TSSDK-135(Add validation for inputs currency and currencyToken.) creativeCommonsAttribution", () => {
    it("should get creative commons attribution PIL ", () => {
      const pil = PILFlavor.creativeCommonsAttribution({
        royaltyPolicy: NativeRoyaltyPolicy.LAP,
        currency: mockAddress,
      });
      expect(pil).deep.equal({
        transferable: true,
        royaltyPolicy: "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",
        defaultMintingFee: 0n,
        expiration: 0n,
        commercialUse: true,
        commercialAttribution: true,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: zeroAddress,
        commercialRevShare: 0,
        commercialRevCeiling: 0n,
        derivativesAllowed: true,
        derivativesAttribution: true,
        derivativesApproval: false,
        derivativesReciprocal: true,
        derivativeRevCeiling: 0n,
        currency: mockAddress,
        uri: "https://github.com/piplabs/pil-document/blob/998c13e6ee1d04eb817aefd1fe16dfe8be3cd7a2/off-chain-terms/CC-BY.json",
      });
    });

    it("should override by custom terms", () => {
      const pil = PILFlavor.creativeCommonsAttribution({
        royaltyPolicy: NativeRoyaltyPolicy.LAP,
        currency: mockAddress,
        chainId: "mainnet",
        override: {
          royaltyPolicy: mockAddress,
          commercialRevShare: 100,
          currency: mockAddress,
        },
      });
      expect(pil).deep.equal({
        transferable: true,
        royaltyPolicy: mockAddress,
        defaultMintingFee: 0n,
        expiration: 0n,
        commercialUse: true,
        commercialAttribution: true,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: zeroAddress,
        commercialRevShare: 100,
        commercialRevCeiling: 0n,
        derivativesAllowed: true,
        derivativesAttribution: true,
        derivativesApproval: false,
        derivativesReciprocal: true,
        derivativeRevCeiling: 0n,
        currency: mockAddress,
        uri: "https://github.com/piplabs/pil-document/blob/998c13e6ee1d04eb817aefd1fe16dfe8be3cd7a2/off-chain-terms/CC-BY.json",
      });
    });

    it("should allow MERC20 on aeneid (1315)", () => {
      const pil = PILFlavor.creativeCommonsAttribution({
        royaltyPolicy: NativeRoyaltyPolicy.LAP,
        currency: mockERC20,
        chainId: "aeneid",
      });
      expect(pil.currency).to.equal(mockERC20);
    });

    it("should reject MERC20 on mainnet (1514)", () => {
      expect(() =>
        PILFlavor.creativeCommonsAttribution({
          royaltyPolicy: NativeRoyaltyPolicy.LAP,
          currency: mockERC20,
          chainId: "mainnet",
        }),
      ).to.throw(`Currency token ${mockERC20} is not allowed on chain mainnet.`);
    });

    it("should allow WIP on aeneid (1315)", () => {
      const pil = PILFlavor.creativeCommonsAttribution({
        royaltyPolicy: NativeRoyaltyPolicy.LAP,
        currency: WIP_TOKEN_ADDRESS,
        chainId: "aeneid",
      });
      expect(pil.currency).to.equal(WIP_TOKEN_ADDRESS);
    });

    it("should allow WIP on mainnet (1514)", () => {
      const pil = PILFlavor.creativeCommonsAttribution({
        royaltyPolicy: NativeRoyaltyPolicy.LAP,
        currency: WIP_TOKEN_ADDRESS,
        chainId: "mainnet",
      });
      expect(pil.currency).to.equal(WIP_TOKEN_ADDRESS);
    });

    it("should reject non-whitelisted token on mainnet", () => {
      expect(() =>
        PILFlavor.creativeCommonsAttribution({
          royaltyPolicy: NativeRoyaltyPolicy.LAP,
          currency: nonWhitelistedToken,
          chainId: "mainnet",
        }),
      ).to.throw(`Currency token ${nonWhitelistedToken} is not allowed on chain mainnet.`);
    });

    it("should reject invalid address on aeneid (expected: whitelist error)", () => {
      expect(() =>
        PILFlavor.creativeCommonsAttribution({
          royaltyPolicy: NativeRoyaltyPolicy.LAP,
          currency: invalidAddress as unknown as Address,
          chainId: "aeneid",
        }),
      ).to.throw(`Currency token ${invalidAddress} is not allowed on chain aeneid.`);
    });

    it("should reject invalid address on mainnet (expected: whitelist error)", () => {
      expect(() =>
        PILFlavor.creativeCommonsAttribution({
          royaltyPolicy: NativeRoyaltyPolicy.LAP,
          currency: invalidAddress as unknown as Address,
          chainId: "mainnet",
        }),
      ).to.throw(`Currency token ${invalidAddress} is not allowed on chain mainnet.`);
    });
  });

  describe("validate license terms", () => {
    describe("royalty policy and currency validation", () => {
      it("should throw error when royaltyPolicy is not zeroAddress but currency is zeroAddress", () => {
        expect(() => {
          PILFlavor.commercialUse({
            defaultMintingFee: 100n,
            currency: zeroAddress,
            royaltyPolicy: mockAddress,
          });
        }).to.throw("Royalty policy requires currency token.");
      });

      it("should not throw error when both royaltyPolicy and currency are valid", () => {
        expect(() => {
          PILFlavor.commercialUse({
            defaultMintingFee: 100n,
            currency: mockAddress,
            royaltyPolicy: NativeRoyaltyPolicy.LAP,
          });
        }).to.not.throw();
      });

      it("should not throw error when both royaltyPolicy and currency are zeroAddress", () => {
        expect(() => {
          PILFlavor.nonCommercialSocialRemixing({
            override: {
              royaltyPolicy: zeroAddress,
              currency: zeroAddress,
            },
          });
        }).to.not.throw();
      });
    });

    describe("defaultMintingFee validation", () => {
      it("should throw error when defaultMintingFee is negative", () => {
        expect(() => {
          PILFlavor.commercialUse({
            defaultMintingFee: -100n,
            currency: mockAddress,
          });
        }).to.throw("DefaultMintingFee should be greater than or equal to 0.");
      });

      it("should not throw error when defaultMintingFee is 0", () => {
        expect(() => {
          PILFlavor.commercialUse({
            defaultMintingFee: 0n,
            currency: mockAddress,
          });
        }).to.not.throw();
      });

      it("should not throw error when defaultMintingFee > 0 and royaltyPolicy is set to zeroAddress", () => {
        expect(() => {
          PILFlavor.commercialUse({
            defaultMintingFee: 100n,
            currency: mockAddress,
            royaltyPolicy: zeroAddress,
          });
        }).to.throw("Royalty policy is required when defaultMintingFee is greater than 0.");
      });
    });

    describe("commercial use validation", () => {
      it("should throw error when commercialUse is false but commercialAttribution is true", () => {
        expect(() => {
          PILFlavor.commercialRemix({
            commercialRevShare: 0,
            defaultMintingFee: 0n,
            currency: mockAddress,
            override: {
              commercialUse: false,
              commercialAttribution: true,
            },
          });
        }).to.throw("Cannot add commercialAttribution when commercial use is disabled.");
      });

      it("should throw error when commercialUse is false but commercializerChecker is set", () => {
        expect(() => {
          PILFlavor.commercialUse({
            defaultMintingFee: 0n,
            currency: mockAddress,
            override: {
              commercialUse: false,
              commercialAttribution: false,
              commercializerChecker: mockAddress,
            },
          });
        }).to.throw("Cannot add commercializerChecker when commercial use is disabled.");
      });

      it("should throw error when commercialUse is false but commercialRevShare > 0", () => {
        expect(() => {
          PILFlavor.commercialUse({
            defaultMintingFee: 0n,
            currency: mockAddress,
            override: {
              commercialUse: false,
              commercialAttribution: false,
              commercialRevShare: 10,
            },
          });
        }).to.throw("Cannot add commercialRevShare when commercial use is disabled.");
      });

      it("should throw error when commercialUse is false but commercialRevCeiling > 0", () => {
        expect(() => {
          PILFlavor.commercialUse({
            defaultMintingFee: 0n,
            currency: mockAddress,
            override: {
              commercialUse: false,
              commercialAttribution: false,
              commercialRevCeiling: 100n,
            },
          });
        }).to.throw("Cannot add commercialRevCeiling when commercial use is disabled.");
      });

      it("should throw error when commercialUse is false but derivativeRevCeiling > 0", () => {
        expect(() => {
          PILFlavor.commercialUse({
            defaultMintingFee: 0n,
            currency: mockAddress,
            override: {
              commercialUse: false,
              commercialAttribution: false,
              derivativeRevCeiling: 100n,
            },
          });
        }).to.throw("Cannot add derivativeRevCeiling when commercial use is disabled.");
      });

      it("should throw error when commercialUse is false but royaltyPolicy is set", () => {
        expect(() => {
          PILFlavor.commercialUse({
            defaultMintingFee: 0n,
            currency: mockAddress,
            override: {
              commercialUse: false,
              commercialAttribution: false,
              royaltyPolicy: mockAddress,
            },
          });
        }).to.throw("Cannot add royaltyPolicy when commercial use is disabled.");
      });

      it("should not throw error when commercialUse is true and royaltyPolicy is set to zeroAddress", () => {
        expect(() => {
          PILFlavor.commercialUse({
            defaultMintingFee: 0n,
            currency: mockAddress,
            royaltyPolicy: zeroAddress,
          });
        }).to.throw("Royalty policy is required when commercial use is enabled.");
      });
    });

    describe("derivatives validation", () => {
      it("should throw error when derivativesAllowed is false but derivativesAttribution is true", () => {
        expect(() => {
          PILFlavor.commercialUse({
            defaultMintingFee: 0n,
            currency: mockAddress,
            override: {
              derivativesAttribution: true,
            },
          });
        }).to.throw("Cannot add derivativesAttribution when derivative use is disabled.");
      });

      it("should throw error when derivativesAllowed is false but derivativesApproval is true", () => {
        expect(() => {
          PILFlavor.commercialUse({
            defaultMintingFee: 0n,
            currency: mockAddress,
            override: {
              derivativesApproval: true,
            },
          });
        }).to.throw("Cannot add derivativesApproval when derivative use is disabled.");
      });

      it("should throw error when derivativesAllowed is false but derivativesReciprocal is true", () => {
        expect(() => {
          PILFlavor.commercialUse({
            defaultMintingFee: 0n,
            currency: mockAddress,
            override: {
              derivativesReciprocal: true,
            },
          });
        }).to.throw("Cannot add derivativesReciprocal when derivative use is disabled.");
      });

      it("should throw error when derivativesAllowed is false but derivativeRevCeiling > 0", () => {
        expect(() => {
          PILFlavor.commercialUse({
            defaultMintingFee: 0n,
            currency: mockAddress,
            override: {
              derivativeRevCeiling: 100n,
            },
          });
        }).to.throw("Cannot add derivativeRevCeiling when derivative use is disabled.");
      });

      it("should not throw error when derivativesAllowed is true and derivative fields are set", () => {
        expect(() => {
          PILFlavor.commercialRemix({
            defaultMintingFee: 0n,
            currency: mockAddress,
            commercialRevShare: 0,
            override: {
              derivativesAttribution: true,
              derivativesReciprocal: true,
              derivativeRevCeiling: 100n,
              derivativesApproval: true,
            },
          });
        }).to.not.throw();
      });
    });

    describe("commercialRevShare validation", () => {
      it("should throw error when commercialRevShare is greater than 100", () => {
        expect(() => {
          PILFlavor.commercialUse({
            defaultMintingFee: 0n,
            currency: mockAddress,
            override: {
              commercialRevShare: 101,
            },
          });
        }).to.throw("commercialRevShare must be between 0 and 100.");
      });

      it("should throw error when commercialRevShare is less than 0", () => {
        expect(() => {
          PILFlavor.commercialUse({
            defaultMintingFee: 0n,
            currency: mockAddress,
            override: {
              commercialRevShare: -1,
            },
          });
        }).to.throw("commercialRevShare must be between 0 and 100.");
      });
    });

    describe("numeric field normalization", () => {
      it("should normalize defaultMintingFee to BigInt", () => {
        const pil = PILFlavor.commercialUse({
          defaultMintingFee: 100,
          currency: mockAddress,
        });
        expect(pil.defaultMintingFee).to.equal(100n);
      });
      it("should normalize expiration to BigInt", () => {
        const pil = PILFlavor.commercialUse({
          defaultMintingFee: 0n,
          currency: mockAddress,
          override: {
            expiration: 1234567890,
          },
        });
        expect(pil.expiration).to.equal(1234567890n);
      });

      it("should normalize commercialRevCeiling to BigInt", () => {
        const pil = PILFlavor.commercialRemix({
          defaultMintingFee: 0n,
          currency: mockAddress,
          commercialRevShare: 0,
          override: {
            commercialRevCeiling: 1000000,
          },
        });
        expect(pil.commercialRevCeiling).to.equal(1000000n);
      });

      it("should normalize derivativeRevCeiling to BigInt", () => {
        const pil = PILFlavor.commercialRemix({
          defaultMintingFee: 0n,
          currency: mockAddress,
          commercialRevShare: 0,
          override: {
            derivativeRevCeiling: 500000,
          },
        });
        expect(pil.derivativeRevCeiling).to.equal(500000n);
      });
    });
  });
});
