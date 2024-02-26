import sinon from "sinon";
import { expect } from "chai";
import { StoryAPIClient } from "../../../src/clients/storyAPI";
import { createMock } from "../testUtils";
import { computeRoyaltyContext } from "../../../src/utils/royaltyContext";

describe("Test royaltyContext", () => {
  const storyMock: StoryAPIClient = createMock<StoryAPIClient>();
  describe("Test computeRoyaltyContext", () => {
    const licenseIds = ["3"];
    afterEach(() => {
      sinon.restore();
    });
    it("should throw getLicense when getLicense throws an error", async () => {
      storyMock.getLicense = sinon.stub().rejects(new Error("http 500 from getLicense"));
      try {
        await computeRoyaltyContext(licenseIds, storyMock);
      } catch (err) {
        expect((err as Error).message).to.equal("http 500 from getLicense");
      }
    });

    it("should throw getRoyaltyPolicy when getRoyaltyPolicy throws an error", async () => {
      storyMock.getLicense = sinon.stub().resolves({ licensorIpId: "1" });
      storyMock.getRoyaltyPolicy = sinon
        .stub()
        .rejects(new Error("http 500 from getRoyaltyPolicy"));
      try {
        await computeRoyaltyContext(licenseIds, storyMock);
      } catch (err) {
        expect((err as Error).message).to.equal("http 500 from getRoyaltyPolicy");
      }
    });

    it("should throw getPolicy when getPolicy throws an error", async () => {
      storyMock.getLicense = sinon.stub().resolves({ licensorIpId: "1" });
      storyMock.getRoyaltyPolicy = sinon.stub().resolves({ policyId: "2" });
      storyMock.getPolicy = sinon.stub().rejects(new Error("http 500 from getPolicy"));
      try {
        await computeRoyaltyContext(licenseIds, storyMock);
      } catch (err) {
        expect((err as Error).message).to.equal("http 500 from getPolicy");
      }
    });

    it("should return original royaltyContext if no royaltyPolicy is found", async () => {
      storyMock.getLicense = sinon.stub().resolves({ licensorIpId: "1" });
      storyMock.getRoyaltyPolicy = sinon.stub().resolves();
      storyMock.getPolicy = sinon.stub().resolves();
      const {
        targetAncestors,
        targetRoyaltyAmount,
        parentAncestors1,
        parentAncestors2,
        parentAncestorsRoyalties1,
        parentAncestorsRoyalties2,
      } = await computeRoyaltyContext(licenseIds, storyMock);
      expect(targetAncestors.length).to.equal(0);
      expect(targetRoyaltyAmount.length).to.equal(0);
      expect(parentAncestors1.length).to.equal(0);
      expect(parentAncestors2.length).to.equal(0);
      expect(parentAncestorsRoyalties1.length).to.equal(0);
      expect(parentAncestorsRoyalties2.length).to.equal(0);
    });

    it("should return updated royaltyContext if a royaltyPolicy is found", async () => {
      storyMock.getLicense = sinon.stub().resolves({ licensorIpId: "0x1" });
      storyMock.getRoyaltyPolicy = sinon.stub().resolves({
        targetRoyaltyAmount: [1, 2, 3],
        targetAncestors: ["0x111111111111111111111", "0x222222222222222222222"],
      });
      storyMock.getPolicy = sinon.stub().resolves({
        pil: {
          commercialRevShare: 10,
        },
      });

      const {
        targetAncestors,
        targetRoyaltyAmount,
        parentAncestors1,
        parentAncestors2,
        parentAncestorsRoyalties1,
        parentAncestorsRoyalties2,
      } = await computeRoyaltyContext(licenseIds, storyMock);

      expect(targetAncestors).to.include.all.members([
        "0x1",
        "0x111111111111111111111",
        "0x222222222222222222222",
      ]);
      expect(targetRoyaltyAmount).to.include.all.members([10, 1, 2]);
      expect(parentAncestors1).to.include.all.members([
        "0x111111111111111111111",
        "0x222222222222222222222",
      ]);
      expect(parentAncestors2.length).to.equal(0);
      expect(parentAncestorsRoyalties1).to.include.all.members([1, 2, 3]);
      expect(parentAncestorsRoyalties2.length).to.equal(0);
    });

    it("should return updated royaltyContext if multiple licenseIds are given", async () => {
      storyMock.getLicense = sinon.stub().resolves({ licensorIpId: "0x1" });
      storyMock.getRoyaltyPolicy = sinon.stub().resolves({
        targetRoyaltyAmount: [1, 2, 3],
        targetAncestors: ["0x111111111111111111111", "0x222222222222222222222"],
      });
      storyMock.getPolicy = sinon.stub().resolves({
        pil: {
          commercialRevShare: 10,
        },
      });

      const {
        targetAncestors,
        targetRoyaltyAmount,
        parentAncestors1,
        parentAncestors2,
        parentAncestorsRoyalties1,
        parentAncestorsRoyalties2,
      } = await computeRoyaltyContext([...licenseIds, "0x2"], storyMock);

      expect(targetAncestors).to.include.all.members([
        "0x1",
        "0x111111111111111111111",
        "0x222222222222222222222",
      ]);
      expect(targetRoyaltyAmount).to.include.all.members([20, 2, 4]);
      expect(parentAncestors1).to.include.all.members([
        "0x111111111111111111111",
        "0x222222222222222222222",
      ]);
      expect(parentAncestors2).to.include.all.members([
        "0x111111111111111111111",
        "0x222222222222222222222",
      ]);
      expect(parentAncestorsRoyalties1).to.include.all.members([1, 2, 3]);
      expect(parentAncestorsRoyalties2).to.include.all.members([1, 2, 3]);
    });
  });
});
