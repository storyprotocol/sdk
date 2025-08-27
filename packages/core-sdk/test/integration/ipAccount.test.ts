import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import {
  Address,
  encodeFunctionData,
  getAddress,
  Hex,
  parseEther,
  toFunctionSelector,
  toHex,
} from "viem";

import { AccessPermission, getSignature, StoryClient, WIP_TOKEN_ADDRESS } from "../../src";
import {
  aeneid,
  getStoryClient,
  getTokenId,
  mockERC721,
  publicClient,
  TEST_WALLET_ADDRESS,
  walletClient,
} from "./utils/util";
import {
  accessControllerAbi,
  accessControllerAddress,
  coreMetadataModuleAddress,
  Erc20Client,
} from "../../src/abi/generated";

use(chaiAsPromised);

const coreMetadataModule = coreMetadataModuleAddress[aeneid];
const permissionAddress = accessControllerAddress[aeneid];

describe("IPAccount Functions", () => {
  let client: StoryClient;
  let ipId: Address;
  let data: Hex;

  before(async () => {
    client = getStoryClient();
    const tokenId = await getTokenId();
    const registerResult = await client.ipAsset.register({
      nftContract: mockERC721,
      tokenId: tokenId!,
    });
    ipId = registerResult.ipId!;
    data = encodeFunctionData({
      abi: accessControllerAbi,
      functionName: "setTransientPermission",
      args: [
        getAddress(ipId),
        getAddress(TEST_WALLET_ADDRESS),
        getAddress(coreMetadataModule),
        toFunctionSelector("function setAll(address,string,bytes32,bytes32)"),
        AccessPermission.ALLOW,
      ],
    });
  });

  describe("execute", () => {
    it("should successfully execute a transaction", async () => {
      const response = await client.ipAccount.execute({
        to: permissionAddress,
        value: 0,
        data: data,
        ipId: ipId,
      });
      expect(response.txHash).to.be.a("string");
    });

    it("should fail with invalid ipId", async () => {
      await expect(
        client.ipAccount.execute({
          to: permissionAddress,
          value: 0,
          data: data,
          ipId: "0x0000000000000000000000000000000000000000",
        }),
      ).to.be.rejected;
    });
  });

  describe("executeWithSig", () => {
    const EXPIRED_DEADLINE = BigInt(Math.floor(Date.now() / 1000) - 3600); // 1 hour ago
    const VALID_DEADLINE = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now

    it("should successfully execute with valid signature", async () => {
      // Get the IP Account nonce (state)
      const nonceResult = await client.ipAccount.getIpAccountNonce(ipId);
      
      // Generate signature for the execute operation itself
      // We need to sign the data that will be executed, not the permission data
      const { signature } = await getSignature({
        state: nonceResult,
        to: permissionAddress,
        encodeData: data,
        wallet: walletClient,
        verifyingContract: ipId,
        deadline: VALID_DEADLINE,
        chainId: aeneid,
      });

      // Execute with signature
      const response = await client.ipAccount.executeWithSig({
        to: permissionAddress,
        data: data,
        ipId: ipId,
        signer: TEST_WALLET_ADDRESS,
        deadline: VALID_DEADLINE,
        signature: signature,
      });

      expect(response.txHash).to.be.a("string");
    });

    it("should fail with expired deadline", async () => {
      await expect(
        client.ipAccount.executeWithSig({
          to: permissionAddress,
          data: data,
          ipId: ipId,
          signer: TEST_WALLET_ADDRESS,
          deadline: EXPIRED_DEADLINE,
          signature: "0x",
        }),
      ).to.be.rejectedWith("IPAccount__ExpiredSignature");
    });

    it("should fail with invalid signature format", async () => {
      await expect(
        client.ipAccount.executeWithSig({
          to: permissionAddress,
          data: data,
          ipId: ipId,
          signer: TEST_WALLET_ADDRESS,
          deadline: VALID_DEADLINE,
          signature: "0x1234567890abcdef" as Hex, // Invalid signature format
        }),
      ).to.be.rejectedWith("IPAccount__InvalidSignature");
    });

    it("should fail with signature from wrong signer", async () => {
      // Generate signature with wrong signer
      const wrongSigner = "0x1234567890123456789012345678901234567890" as Address;
      const nonceResult = await client.ipAccount.getIpAccountNonce(ipId);
      
      const { signature } = await getSignature({
        state: nonceResult,
        to: permissionAddress,
        encodeData: data,
        wallet: walletClient,
        verifyingContract: ipId,
        deadline: VALID_DEADLINE,
        chainId: aeneid,
      });

      await expect(
        client.ipAccount.executeWithSig({
          to: permissionAddress,
          data: data,
          ipId: ipId,
          signer: wrongSigner,
          deadline: VALID_DEADLINE,
          signature: signature,
        }),
      ).to.be.rejectedWith("IPAccount__InvalidSignature");
    });

    it("should fail with invalid ipId format", async () => {
      const nonceResult = await client.ipAccount.getIpAccountNonce(ipId);
      
      const { signature } = await getSignature({
        state: nonceResult,
        to: permissionAddress,
        encodeData: data,
        wallet: walletClient,
        verifyingContract: ipId,
        deadline: VALID_DEADLINE,
        chainId: aeneid,
      });

      await expect(
        client.ipAccount.executeWithSig({
          to: permissionAddress,
          data: data,
          ipId: "0x123" as Address, // Invalid address format
          signer: TEST_WALLET_ADDRESS,
          deadline: VALID_DEADLINE,
          signature: signature,
        }),
      ).to.be.rejectedWith("Invalid address: 0x123.");
    });

    it("should fail when IP account does not exist", async () => {
      // Create a real non-existent IP address (but with correct format)
      const nonExistentIpId = "0x1111111111111111111111111111111111111111" as Address;
      
      // Generate signature for this non-existent IP
      // Note: We need to try to get nonce first, if IP doesn't exist, this step should fail
      try {
        const nonceResult = await client.ipAccount.getIpAccountNonce(nonExistentIpId);
        
        const { signature } = await getSignature({
          state: nonceResult,
          to: permissionAddress,
          encodeData: data,
          wallet: walletClient,
          verifyingContract: nonExistentIpId, // Use non-existent IP as verifying contract
          deadline: VALID_DEADLINE,
          chainId: aeneid,
        });

        await expect(
          client.ipAccount.executeWithSig({
            to: permissionAddress,
            data: data,
            ipId: nonExistentIpId,
            signer: TEST_WALLET_ADDRESS,
            deadline: VALID_DEADLINE,
            signature: signature,
          }),
        ).to.be.rejectedWith("IPAccount__InvalidSignature"); // Should fail because IP doesn't exist
      } catch (error) {
        // If getting nonce fails, it means IP indeed doesn't exist, which is also our expected result
        expect((error as Error).message).to.include("Failed to get the IP Account nonce");
      }
    });

    it("should fail with unauthorized signer", async () => {
      // Test various unauthorized signer scenarios
      const unauthorizedSigner = "0x2222222222222222222222222222222222222222" as Address;
      
      const nonceResult = await client.ipAccount.getIpAccountNonce(ipId);
      const { signature } = await getSignature({
        state: nonceResult,
        to: permissionAddress,
        encodeData: data,
        wallet: walletClient,
        verifyingContract: ipId,
        deadline: VALID_DEADLINE,
        chainId: aeneid,
      });

      await expect(
        client.ipAccount.executeWithSig({
          to: permissionAddress,
          data: data,
          ipId: ipId,
          signer: unauthorizedSigner, // Unauthorized signer
          deadline: VALID_DEADLINE,
          signature: signature,
        }),
      ).to.be.rejectedWith("IPAccount__InvalidSignature"); // Contract returns InvalidSignature for permission issues
    });

    it("should fail with signature for wrong data", async () => {
      // Generate signature for different data than what we execute
      const wrongData = encodeFunctionData({
        abi: accessControllerAbi,
        functionName: "setTransientPermission",
        args: [
          getAddress("0x1234567890123456789012345678901234567890"),
          getAddress(TEST_WALLET_ADDRESS),
          getAddress(coreMetadataModule),
          toFunctionSelector("function setAll(address,string,bytes32,bytes32)"),
          AccessPermission.DENY,
        ],
      });

      const nonceResult = await client.ipAccount.getIpAccountNonce(ipId);
      
      const { signature } = await getSignature({
        state: nonceResult,
        to: permissionAddress,
        encodeData: wrongData, // Sign wrong data
        wallet: walletClient,
        verifyingContract: ipId,
        deadline: VALID_DEADLINE,
        chainId: aeneid,
      });

      await expect(
        client.ipAccount.executeWithSig({
          to: permissionAddress,
          data: data, // Execute with original data, not the signed data
          ipId: ipId,
          signer: TEST_WALLET_ADDRESS,
          deadline: VALID_DEADLINE,
          signature: signature,
        }),
      ).to.be.rejectedWith("IPAccount__InvalidSignature"); // Should fail because data doesn't match signature
    });

    it("should fail with signature for wrong target address", async () => {
      // Generate signature for different target address than what we execute
      const wrongTarget = "0x1234567890123456789012345678901234567890" as Address;
      const nonceResult = await client.ipAccount.getIpAccountNonce(ipId);
      
      const { signature } = await getSignature({
        state: nonceResult,
        to: wrongTarget, // Sign for wrong target
        encodeData: data,
        wallet: walletClient,
        verifyingContract: ipId,
        deadline: VALID_DEADLINE,
        chainId: aeneid,
      });

      await expect(
        client.ipAccount.executeWithSig({
          to: permissionAddress, // Execute with original target, not the signed target
          data: data,
          ipId: ipId,
          signer: TEST_WALLET_ADDRESS,
          deadline: VALID_DEADLINE,
          signature: signature,
        }),
      ).to.be.rejectedWith("IPAccount__InvalidSignature"); // Should fail because target doesn't match signature
    });

    it("should execute with zero value transaction", async () => {
      // Test successful execution with zero value
      const nonceResult = await client.ipAccount.getIpAccountNonce(ipId);
      
      const { signature } = await getSignature({
        state: nonceResult,
        to: permissionAddress,
        encodeData: data,
        wallet: walletClient,
        verifyingContract: ipId,
        deadline: VALID_DEADLINE,
        chainId: aeneid,
      });

      const response = await client.ipAccount.executeWithSig({
        to: permissionAddress,
        data: data,
        ipId: ipId,
        signer: TEST_WALLET_ADDRESS,
        deadline: VALID_DEADLINE,
        signature: signature,
        value: 0, // Explicitly set zero value
      });

      expect(response.txHash).to.be.a("string");
    });
  });

  describe("getIpAccountNonce", () => {
    it("should successfully return account nonce", async () => {
      const response = await client.ipAccount.getIpAccountNonce(ipId);
      expect(response).to.be.a("string");
    });

    it("should fail with invalid ipId", async () => {
      await expect(client.ipAccount.getIpAccountNonce("0x0000000000000000000000000000000000000000"))
        .to.be.rejected;
    });
  });

  describe("getToken", () => {
    it("should successfully return token information", async () => {
      const response = await client.ipAccount.getToken(ipId);

      expect(response.chainId).to.be.a("bigint");
      expect(response.tokenContract).to.be.a("string");
      expect(response.tokenId).to.be.a("bigint");
      expect(response.tokenContract).to.equal(mockERC721);
    });

    it("should fail with invalid ipId", async () => {
      await expect(client.ipAccount.getToken("0x0000000000000000000000000000000000000000")).to.be
        .rejected;
    });
  });

  it("should successfully set ip metadata", async () => {
    const txHash = await client.ipAccount.setIpMetadata({
      ipId: ipId,
      metadataURI: "https://example.com",
      metadataHash: toHex("test", { size: 32 }),
    });
    expect(txHash).to.be.a("string");
  });

  it("should successfully transfer ERC20 tokens", async () => {
    const erc20 = new Erc20Client(publicClient, walletClient);
    // 1. Query token balance of ipId and wallet before
    const initialErc20BalanceOfIpId = await erc20.balanceOf({
      account: ipId,
    });
    const initialErc20BalanceOfWallet = await erc20.balanceOf({
      account: TEST_WALLET_ADDRESS,
    });
    const initialWipBalanceOfIpId = await client.wipClient.balanceOf(ipId);
    const initialWipBalanceOfWallet = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);
    // 2. transfer erc20 token to the ip account
    const txHash = await erc20.mint({
      to: ipId,
      amount: parseEther("0.002"),
    });
    await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });
    // 3. transfer wip to the ip account
    await client.wipClient.deposit({
      amount: 1n,
    });
    await client.wipClient.transfer({
      to: ipId,
      amount: 1n,
    });
    // 4. transfer token of ip account to wallet address
    const ret = await client.ipAccount.transferErc20({
      ipId,
      tokens: [
        {
          address: WIP_TOKEN_ADDRESS,
          target: TEST_WALLET_ADDRESS,
          amount: 1n,
        },
        {
          address: erc20.address,
          target: TEST_WALLET_ADDRESS,
          amount: parseEther("0.001"),
        },
        {
          address: erc20.address,
          target: TEST_WALLET_ADDRESS,
          amount: parseEther("0.001"),
        },
      ],
    });
    // 5. query token balance of ipId and wallet address after
    const finalErc20BalanceOfIpId = await erc20.balanceOf({
      account: ipId,
    });
    const finalWipBalanceOfIpId = await client.wipClient.balanceOf(ipId);
    const finalErc20BalanceOfWallet = await erc20.balanceOf({
      account: TEST_WALLET_ADDRESS,
    });
    const finalWipBalanceOfWallet = await client.wipClient.balanceOf(TEST_WALLET_ADDRESS);

    expect(ret.txHash).to.be.a("string");
    expect(finalErc20BalanceOfIpId).to.equal(initialErc20BalanceOfIpId);
    expect(finalWipBalanceOfIpId).to.equal(initialWipBalanceOfIpId);
    expect(finalErc20BalanceOfWallet).to.equal(initialErc20BalanceOfWallet + parseEther("0.002"));
    expect(finalWipBalanceOfWallet).to.equal(initialWipBalanceOfWallet + 1n);
  });
});
