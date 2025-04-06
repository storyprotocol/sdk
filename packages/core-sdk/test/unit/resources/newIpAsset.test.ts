import chai from "chai";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import chaiAsPromised from "chai-as-promised";
import { WalletClient } from "viem/_types/clients/createWalletClient";
import { LocalAccount, PublicClient, zeroAddress } from "viem";
import { IPAssetClient } from "../../../src";
import { MintAndRegisterAssetRequest } from "../../../src/resources/ipAsset/types";
import {
  derivativeData,
  ipId,
  pilLicenseTermsData,
  royaltyShares,
  tokenId,
  txHash,
} from "../constants";
import { RoyaltyModuleReadOnlyClient } from "../../../src/abi/generated";
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Test New IPAsset methods", () => {
  let ipAssetClient: IPAssetClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;
  const spgNftContract = "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";

  beforeEach(() => {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    const accountMock = createMock<LocalAccount>();
    ipAssetClient = new IPAssetClient(rpcMock, walletMock, "1516");
    walletMock.account = accountMock;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("mintAndRegister", () => {
    beforeEach(() => {
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      sinon.stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId,
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: tokenId,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);
      sinon.stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: 1n,
      });
      sinon
        .stub(RoyaltyModuleReadOnlyClient.prototype, "isWhitelistedRoyaltyPolicy")
        .resolves(true);
      sinon.stub(RoyaltyModuleReadOnlyClient.prototype, "isWhitelistedRoyaltyToken").resolves(true);
      sinon
        .stub(
          ipAssetClient.royaltyTokenDistributionWorkflowsClient,
          "mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens",
        )
        .resolves(txHash);
      sinon
        .stub(ipAssetClient.derivativeWorkflowsClient, "mintAndRegisterIpAndMakeDerivative")
        .resolves(txHash);
      sinon
        .stub(
          ipAssetClient.royaltyTokenDistributionWorkflowsClient,
          "mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens",
        )
        .resolves(txHash);
      sinon.stub(ipAssetClient.registrationWorkflowsClient, "mintAndRegisterIp").resolves(txHash);
      sinon
        .stub(ipAssetClient.licenseAttachmentWorkflowsClient, "mintAndRegisterIpAndAttachPilTerms")
        .resolves(txHash);
    });

    describe("new ip", () => {
      const baseRequest: MintAndRegisterAssetRequest = {
        type: "new-ip",
        nft: {
          spgNftContract,
        },
      };

      it("succeeds", async () => {
        const rsp = await ipAssetClient.mintAndRegister(baseRequest);
        expect(rsp).to.deep.equal({ txHash });
      });

      describe("with terms", () => {
        it("succeeds", async () => {
          const rsp = await ipAssetClient.mintAndRegister({
            ...baseRequest,
            license: [pilLicenseTermsData],
          });
          expect(rsp).to.deep.equal({ txHash });
        });

        describe("with royalty", async () => {
          it("succeeds", async () => {
            const rsp = await ipAssetClient.mintAndRegister({
              ...baseRequest,
              license: [pilLicenseTermsData],
              royaltyShares,
            });
            expect(rsp).to.deep.equal({ txHash });
          });
        });
      });

      describe("only loyalty", () => {
        it("fails because of missing terms", async () => {
          const req = ipAssetClient.mintAndRegister({ ...baseRequest, royaltyShares });
          await expect(req).to.be.rejected;
        });
      });
    });

    describe("derivative", () => {
      const baseRequest: MintAndRegisterAssetRequest = {
        type: "derivative",
        nft: {
          spgNftContract,
        },
        derivativeData,
      };

      it("succeeds", async () => {
        const rsp = await ipAssetClient.mintAndRegister(baseRequest);
        expect(rsp).to.deep.equal({ txHash });
      });

      describe("with royalty", () => {
        it("succeeds", async () => {
          const rsp = await ipAssetClient.mintAndRegister({
            ...baseRequest,
            royaltyShares,
          });
          expect(rsp).to.deep.equal({ txHash });
        });
      });
    });
  });
});
