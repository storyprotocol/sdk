import chai, { expect } from "chai";
import { AxiosInstance } from "axios";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import chaiAsPromised from "chai-as-promised";
import { PublicClient, WalletClient, Account, parseGwei, toBytes, stringToHex } from "viem";
import { LicenseClient } from "../../../src";
import {
  ConfigureLicenseRequest,
  CreateLicenseRequest,
} from "../../../src/types/resources/license";
import { mockCreateAndConfigureLicenseLog } from "../utils/mockData";

chai.use(chaiAsPromised);
chai.config.truncateThreshold = 0;

describe(`Test License`, function () {
  let licenseClient: LicenseClient;
  let axiosMock: AxiosInstance;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  beforeEach(function () {
    axiosMock = createMock<AxiosInstance>();
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    const accountMock = createMock<Account>();
    accountMock.address = "0x73fcb515cee99e4991465ef586cfe2b072ebb512";
    walletMock.account = accountMock;
    licenseClient = new LicenseClient(axiosMock, rpcMock, walletMock);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("Test LicenseClient.create", async function () {
    it("should be able to create license", async function () {
      const ipOrgIdMock = "0x8d312f57eb3b461ba5b34930768543611203c1aa";
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon
        .stub()
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves({
        logs: mockCreateAndConfigureLicenseLog,
      });

      const createLicenseRequest: CreateLicenseRequest = {
        ipOrgId: ipOrgIdMock,
        params: [],
        parentLicenseId: "0",
        ipaId: "0",
        preHookData: [],
        postHookData: [],
        txOptions: {
          waitForTransaction: true,
        },
      };

      const createLicenseRes = await expect(licenseClient.create(createLicenseRequest)).not.to.be
        .rejected;
      console.log(createLicenseRes);
      expect(createLicenseRes.licenseId).to.be.a("string");
      expect(createLicenseRes.licenseId).not.be.undefined;
    });
    it("should be able to create license (don't wait for txn)", async function () {
      const ipOrgIdMock = "0x8d312f57eb3b461ba5b34930768543611203c1aa";
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon
        .stub()
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves({
        logs: mockCreateAndConfigureLicenseLog,
      });

      const createLicenseRequest: CreateLicenseRequest = {
        ipOrgId: ipOrgIdMock,
        params: [],
        parentLicenseId: "0",
        ipaId: "0",
        preHookData: [],
        postHookData: [],
        txOptions: {
          waitForTransaction: false,
        },
      };

      const createLicenseRes = await expect(licenseClient.create(createLicenseRequest)).not.to.be
        .rejected;
      console.log(createLicenseRes);
      expect(createLicenseRes.txHash).to.be.a("string");
      expect(createLicenseRes.txHash).not.be.undefined;
    });
    it("should be able to create license", async function () {
      const ipOrgIdMock = "0x8d312f57eb3b461ba5b34930768543611203c1aa";
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon
        .stub()
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves({
        logs: mockCreateAndConfigureLicenseLog,
      });

      const createLicenseRequest: CreateLicenseRequest = {
        ipOrgId: ipOrgIdMock,
        params: [],
        parentLicenseId: "0",
        ipaId: "0",
        preHookData: [],
        postHookData: [],
        txOptions: {
          waitForTransaction: true,
        },
      };
      const createLicenseRes = await expect(licenseClient.create(createLicenseRequest)).not.to.be
        .rejected;
      console.log(createLicenseRes);
      expect(createLicenseRes.txHash).to.be.a("string");
      expect(createLicenseRes.txHash).not.be.undefined;
    });

    it("should be able to get transaction hash after calling license.create", async function () {
      const ipOrgIdMock = "0x973748DC37577905a072d3Bf5ea0e8E69547c872";
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon
        .stub()
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves({
        logs: mockCreateAndConfigureLicenseLog,
      });

      const createLicenseRequest: CreateLicenseRequest = {
        ipOrgId: ipOrgIdMock,
        params: [],
        parentLicenseId: "0",
        ipaId: "0",
        preHookData: [],
        postHookData: [],
        txOptions: {
          waitForTransaction: true,
        },
      };

      const createLicenseRes = await expect(licenseClient.create(createLicenseRequest)).not.to.be
        .rejected;
      expect(createLicenseRes.txHash).to.be.a("string");
      expect(createLicenseRes.txHash).not.be.undefined;
    });
    it("should be able to configure license", async function () {
      const ipOrgIdMock = "0x973748DC37577905a072d3Bf5ea0e8E69547c872";
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon
        .stub()
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves({
        logs: mockCreateAndConfigureLicenseLog,
      });

      // Configure license
      const configureLicenseRequest: ConfigureLicenseRequest = {
        ipOrg: ipOrgIdMock,
        frameworkId: "SPUML-1.0",
        params: [],
        licensor: 1,
        txOptions: {
          waitForTransaction: true,
          gasPrice: parseGwei("250"),
        },
      };

      const configureResponse = await licenseClient.configure(configureLicenseRequest);

      expect(configureResponse.success).to.be.true;
    });
    it("should be able to configure license (don't wait for txn)", async function () {
      const ipOrgIdMock = "0x973748DC37577905a072d3Bf5ea0e8E69547c872";
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon
        .stub()
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves({
        logs: mockCreateAndConfigureLicenseLog,
      });

      // Configure license
      const configureLicenseRequest: ConfigureLicenseRequest = {
        ipOrg: ipOrgIdMock,
        frameworkId: "SPUML-1.0",
        params: [],
        licensor: 1,
        txOptions: {
          waitForTransaction: true,
          gasPrice: parseGwei("250"),
        },
      };

      const configureResponse = await licenseClient.configure(configureLicenseRequest);

      expect(configureResponse.txHash).to.be.a("string");
      expect(configureResponse.txHash).not.be.undefined;
    });
    it("should be able to configure license with Derivatives-Allowed parameter ", async function () {
      const ipOrgIdMock = "0x973748DC37577905a072d3Bf5ea0e8E69547c872";
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon
        .stub()
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves({
        logs: mockCreateAndConfigureLicenseLog,
      });

      const attributionParam = {
        tag: stringToHex("Derivatives-Allowed", { size: 32 }),
        value: {
          interface: "bool",
          data: [false],
        },
      };

      const licenseParameters = [attributionParam];

      // Configure license
      const configureLicenseRequest: ConfigureLicenseRequest = {
        ipOrg: ipOrgIdMock,
        frameworkId: "SPUML-1.0",
        params: licenseParameters,
        licensor: 1,
        txOptions: {
          waitForTransaction: true,
          gasPrice: parseGwei("250"),
        },
      };

      const configureResponse = await licenseClient.configure(configureLicenseRequest);

      expect(configureResponse.txHash).to.be.a("string");
      expect(configureResponse.txHash).not.be.undefined;
    });
    it("should be able to configure license with Attribution parameter ", async function () {
      const ipOrgIdMock = "0x973748DC37577905a072d3Bf5ea0e8E69547c872";
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon
        .stub()
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves({
        logs: mockCreateAndConfigureLicenseLog,
      });

      const attributionParam = {
        tag: stringToHex("Attribution", { size: 32 }),
        value: {
          interface: "bool",
          data: [false],
        },
      };

      const licenseParameters = [attributionParam];

      // Configure license
      const configureLicenseRequest: ConfigureLicenseRequest = {
        ipOrg: ipOrgIdMock,
        frameworkId: "SPUML-1.0",
        params: licenseParameters,
        licensor: 1,
        txOptions: {
          waitForTransaction: true,
          gasPrice: parseGwei("250"),
        },
      };

      const configureResponse = await licenseClient.configure(configureLicenseRequest);

      expect(configureResponse.txHash).to.be.a("string");
      expect(configureResponse.txHash).not.be.undefined;
    });
    it("should be able to configure license", async function () {
      const ipOrgIdMock = "0x973748DC37577905a072d3Bf5ea0e8E69547c872";
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon
        .stub()
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves({
        logs: mockCreateAndConfigureLicenseLog,
      });

      // Configure license
      const configureLicenseRequest: ConfigureLicenseRequest = {
        ipOrg: ipOrgIdMock,
        frameworkId: "SPUML-1.0",
        params: [],
        licensor: 1,
        txOptions: {
          waitForTransaction: true,
          gasPrice: parseGwei("250"),
        },
      };

      const configureResponse = await licenseClient.configure(configureLicenseRequest);

      expect(configureResponse.success).to.be.true;
    });
    it("should be able to get transaction hash after calling license.configure", async function () {
      const ipOrgIdMock = "0x973748DC37577905a072d3Bf5ea0e8E69547c872";
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon
        .stub()
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      rpcMock.waitForTransactionReceipt = sinon.stub().resolves({
        logs: mockCreateAndConfigureLicenseLog,
      });

      // Configure license
      const configureLicenseRequest: ConfigureLicenseRequest = {
        ipOrg: ipOrgIdMock,
        frameworkId: "SPUML-1.0",
        params: [],
        licensor: 1,
        txOptions: {
          waitForTransaction: false,
          gasPrice: parseGwei("250"),
        },
      };

      const configureResponse = await licenseClient.configure(configureLicenseRequest);

      expect(configureResponse.txHash).to.be.a("string");
      expect(configureResponse.txHash).not.be.undefined;
    });

    it("create should throw error", async () => {
      const ipOrgIdMock = "0x973748DC37577905a072d3Bf5ea0e8E69547c872";
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().rejects(new Error("http 500"));

      const createLicenseRequest: CreateLicenseRequest = {
        ipOrgId: ipOrgIdMock,
        params: [],
        parentLicenseId: "0",
        ipaId: "0",
        preHookData: [],
        postHookData: [],
        txOptions: {
          waitForTransaction: true,
          gasPrice: parseGwei("250"),
        },
      };

      await expect(licenseClient.create(createLicenseRequest)).to.be.rejectedWith("http 500");
    });
    it("configure should throw error", async () => {
      const ipOrgIdMock = "0x973748DC37577905a072d3Bf5ea0e8E69547c872";
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().rejects(new Error("http 500"));
      // Configure license
      const configureLicenseRequest: ConfigureLicenseRequest = {
        ipOrg: ipOrgIdMock,
        frameworkId: "SPUML-1.0",
        params: [],
        licensor: 1,
        txOptions: {
          waitForTransaction: true,
          gasPrice: parseGwei("250"),
        },
      };

      await expect(licenseClient.configure(configureLicenseRequest)).to.be.rejectedWith("http 500");
    });
    it("configure should throw error if incorrect params", async () => {
      const ipOrgIdMock = "0x973748DC37577905a072d3Bf5ea0e8E69547c872";
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().rejects(new Error("http 500"));
      // Configure license
      const configureLicenseRequest: ConfigureLicenseRequest = {
        ipOrg: ipOrgIdMock,
        frameworkId: "SPUML-1.0",
        params: [
          {
            tag: stringToHex("foo", { size: 32 }),
            value: {
              interface: "bool",
              data: [true],
            },
          },
        ],
        licensor: 1,
        txOptions: {
          waitForTransaction: true,
          gasPrice: parseGwei("250"),
        },
      };

      await expect(licenseClient.configure(configureLicenseRequest)).to.be.rejectedWith("http 500");
    });
  });
});
