import { expect } from "chai";

import { PILFlavor } from "../../../src/utils/pilFlavor";
import { mockAddress } from "../mockData";

describe.only("PILFlavor", () => {
  describe("nonCommercialSocialRemixing", () => {
    it("should get non commercial social remixing PIL", () => {
      const pil = PILFlavor.nonCommercialSocialRemixing();
      expect(pil).deep.equal({
        transferable: true,
        commercialAttribution: false,
        commercialRevCeiling: 0n,
        commercialRevShare: 0,
        commercialUse: false,
        commercializerChecker: "0x0000000000000000000000000000000000000000",
        commercializerCheckerData: "0x0000000000000000000000000000000000000000",
        currency: "0x0000000000000000000000000000000000000000",
        derivativeRevCeiling: 0n,
        derivativesAllowed: true,
        derivativesApproval: false,
        derivativesAttribution: true,
        derivativesReciprocal: true,
        expiration: 0n,
        defaultMintingFee: 0n,
        royaltyPolicy: "0x0000000000000000000000000000000000000000",
        uri: "https://github.com/piplabs/pil-document/blob/998c13e6ee1d04eb817aefd1fe16dfe8be3cd7a2/off-chain-terms/NCSR.json",
      });
    });

    it("should be override by custom terms", () => {
      const pil = PILFlavor.nonCommercialSocialRemixing({
        commercialAttribution: true,
        commercialRevCeiling: 100n,
        commercialRevShare: 10,
      });

      expect(pil).deep.equal({
        transferable: true,
        commercialAttribution: true,
        commercialRevCeiling: 100n,
        commercialRevShare: 10,
        commercialUse: false,
        commercializerChecker: "0x0000000000000000000000000000000000000000",
        commercializerCheckerData: "0x0000000000000000000000000000000000000000",
        currency: "0x0000000000000000000000000000000000000000",
        derivativeRevCeiling: 0n,
        derivativesAllowed: true,
        derivativesApproval: false,
        derivativesAttribution: true,
        derivativesReciprocal: true,
        expiration: 0n,
        defaultMintingFee: 0n,
        royaltyPolicy: "0x0000000000000000000000000000000000000000",
        uri: "https://github.com/piplabs/pil-document/blob/998c13e6ee1d04eb817aefd1fe16dfe8be3cd7a2/off-chain-terms/NCSR.json",
      });
    });
  });

  describe("commercialUse", () => {
    it("should get commercial use PIL", () => {
      const pil = PILFlavor.commercialUse({
        defaultMintingFee: 100n,
        currency: mockAddress,
      });
      expect(pil).deep.equal({
        commercialAttribution: true,
        commercialRevCeiling: 0n,
        commercialRevShare: 0,
        commercialUse: true,
        commercializerChecker: "0x0000000000000000000000000000000000000000",
        commercializerCheckerData: "0x0000000000000000000000000000000000000000",
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
        currency: "0x0000000000000000000000000000000000000000",
        chainId: "mainnet",
        royaltyPolicyAddress: "LRP",
        override: {
          commercialRevShare: 10,
          defaultMintingFee: 100,
          royaltyPolicyAddress: "LAP",
          currency: mockAddress,
        },
      });
      expect(pil).deep.equal({
        commercialAttribution: true,
        commercialRevCeiling: 0n,
        commercialRevShare: 100000,
        commercialUse: true,
        commercializerChecker: "0x0000000000000000000000000000000000000000",
        commercializerCheckerData: "0x0000000000000000000000000000000000000000",
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
  });
  describe("commercialRemix", () => {
    it("should get commercial remix PIL", () => {
      const pil = PILFlavor.commercialRemix({
        defaultMintingFee: 100n,
        currency: mockAddress,
        commercialRevShare: 10,
      });
      expect(pil).deep.equal({
        commercialAttribution: true,
        commercialRevCeiling: 0n,
        commercialRevShare: 100000,
        commercialUse: true,
        commercializerChecker: "0x0000000000000000000000000000000000000000",
        commercializerCheckerData: "0x0000000000000000000000000000000000000000",
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
        currency: "0x0000000000000000000000000000000000000000",
        commercialRevShare: 10,
        chainId: "mainnet",
        royaltyPolicyAddress: "LRP",
        override: {
          commercialRevShare: 1,
          defaultMintingFee: 800,
          royaltyPolicyAddress: mockAddress,
          currency: mockAddress,
        },
      });
      expect(pil).deep.equal({
        commercialAttribution: true,
        commercialRevCeiling: 0n,
        commercialRevShare: 10000,
        commercialUse: true,
        commercializerChecker: "0x0000000000000000000000000000000000000000",
        commercializerCheckerData: "0x0000000000000000000000000000000000000000",
        currency: mockAddress,
        derivativeRevCeiling: 0n,
        derivativesAllowed: true,
        derivativesApproval: false,
        derivativesAttribution: true,
        derivativesReciprocal: true,
        expiration: 0n,
        defaultMintingFee: 800n,
        royaltyPolicy: mockAddress,
        transferable: true,
        uri: "https://github.com/piplabs/pil-document/blob/ad67bb632a310d2557f8abcccd428e4c9c798db1/off-chain-terms/CommercialRemix.json",
      });
    });
  });

  describe("creativeCommonsAttribution", () => {
    it("should get creative commons attribution PIL", () => {
      const pil = PILFlavor.creativeCommonsAttribution({
        royaltyPolicyAddress: "LAP",
        currency: mockAddress,
      });
      expect(pil).deep.equal({
        transferable: true,
        royaltyPolicy: "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",
        defaultMintingFee: 0n,
        expiration: 0n,
        commercialUse: true,
        commercialAttribution: true,
        commercializerChecker: "0x0000000000000000000000000000000000000000",
        commercializerCheckerData: "0x0000000000000000000000000000000000000000",
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
        royaltyPolicyAddress: "LAP",
        currency: mockAddress,
        chainId: "mainnet",
        override: {
          royaltyPolicyAddress: mockAddress,
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
        commercializerChecker: "0x0000000000000000000000000000000000000000",
        commercializerCheckerData: "0x0000000000000000000000000000000000000000",
        commercialRevShare: 1000000,
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
  });
});
