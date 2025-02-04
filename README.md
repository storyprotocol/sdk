# 📖 Story Protocol SDK

<div align="left">

[![GitHub Repo stars](https://img.shields.io/github/stars/storyprotocol/sdk?logo=github&color=yellow)](https://github.com/storyprotocol/sdk/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/storyprotocol/sdk?logo=github&color=blue)](https://github.com/storyprotocol/sdk/network/members)
[![GitHub last commit](https://img.shields.io/github/last-commit/storyprotocol/sdk?logo=git)](https://github.com/storyprotocol/sdk/commits/main)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

</div>

---

## 🚀 Overview

Welcome to the **Story Protocol SDK**!  
This SDK provides **APIs** for developers to build applications with **Story Protocol**, enabling seamless creation and interaction with **IP assets**.

---

## ⚡ Installation

### 1️⃣ Install Story Protocol Core SDK

Ensure you have an existing **Node.js** project before installation.

📌 **Using `npm`**:
```sh
npm install --save @story-protocol/core-sdk viem@1.21.4
```

📌 **Using `pnpm`**:
```sh
pnpm install @story-protocol/core-sdk viem@1.21.4
```

📌 **Using `yarn`**:
```sh
yarn add @story-protocol/core-sdk viem@1.21.4
```

📌 **Note:**  
The package `viem` ([npm package](https://www.npmjs.com/package/viem)) is required for **DeFi wallet access**.

---

## 🛠 Initializing SDK Client

### 2️⃣ Set Up Your Wallet

Use `viem` to create a wallet:

```typescript
import { privateKeyToAccount } from "viem/accounts";

const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "0x";
const account = privateKeyToAccount(PRIVATE_KEY as Address);
```

📌 **Note:** Ensure `WALLET_PRIVATE_KEY` is set in your `.env` file.

---

### 3️⃣ Configure SDK Client

Initialize the SDK client using `StoryClient`:

```typescript
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";

const config: StoryConfig = {
  transport: http(process.env.RPC_PROVIDER_URL),
  account: account,
};

const client = StoryClient.newClient(config);
```

📌 **Note:** Set up `RPC_PROVIDER_URL` for your desired chain in your `.env` file.  
💡 We recommend using the **Iliad network**:
```sh
RPC_PROVIDER_URL=https://rpc.partner.testnet.storyprotocol.net
```

---

## 🏗 Building & Testing Locally

### 4️⃣ Prerequisites

📌 Install required dependencies:
```sh
npm install -g pnpm typescript yalc
```

---

### 5️⃣ Using `yalc` for Local Testing

📌 **In `typescript-sdk/packages/core-sdk` directory**:

```sh
cd packages/core-sdk
npm run build
yalc publish
```

📌 **In your test project**:

```sh
yalc add @story-protocol/core-sdk@<version>
pnpm install
```

📌 **To refresh changes**:

```sh
npm run build
yalc push
yalc update
```

---

## 🔄 Updating Smart Contract ABIs

To pull & compile the latest **Protocol Core & Periphery v1** ABIs:

📌 **Run:**
```sh
cd packages/wagmi-generator
npm run generate
```

---

## 📦 Available Packages

| Package | Description |
|---------|------------|
| [core-sdk](./packages/core-sdk) | Core SDK for protocol interaction |
| [react-sdk](./packages/react-sdk) | React SDK for frontend integration |

---

## 🤝 Contributing

Pull requests are welcome!  
🔹 Before major changes, **open an issue** for discussion.  
🔹 See our [CONTRIBUTING.md](CONTRIBUTING.md) guide.  

✅ **Ensure tests are updated appropriately.**

---

## 📜 License

This project is licensed under the **MIT License**.  
See [LICENSE](LICENSE.md) for details.

---

## 📬 Contact Us

<p align="left">
  <a href="https://discord.gg/storyprotocol">
    <img src="https://img.shields.io/badge/Discord-5865F2?logo=discord&logoColor=white&style=for-the-badge" alt="Discord">
  </a>
  <a href="https://x.com/storyprotocol">
    <img src="https://img.shields.io/badge/Twitter-000000?logo=x&logoColor=white&style=for-the-badge" alt="Twitter (X)">
  </a>
</p>
